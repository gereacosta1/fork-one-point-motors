const BASE = "https://api.affirm.com";
const TXN = "/api/v1/transactions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const safe = (o) => {
  try {
    return JSON.stringify(o, null, 2).slice(0, 8000);
  } catch {
    return "[unserializable]";
  }
};

const doFetch = async (...args) => {
  if (typeof fetch !== "undefined") return fetch(...args);
  const { default: nf } = await import("node-fetch");
  return nf(...args);
};

function getAuthHeader() {
  const PUB = process.env.AFFIRM_PUBLIC_KEY;
  const PRIV = process.env.AFFIRM_PRIVATE_KEY;
  if (!PUB || !PRIV) return null;
  return "Basic " + Buffer.from(`${PUB}:${PRIV}`).toString("base64");
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    if (body && body.diag === true) {
      const diag = {
        nodeVersion: process.versions?.node || null,
        hasFetch: typeof fetch !== "undefined",
        env: {
          AFFIRM_ENV: process.env.AFFIRM_ENV || null,
          HAS_AFFIRM_PUBLIC_KEY: Boolean(process.env.AFFIRM_PUBLIC_KEY),
          HAS_AFFIRM_PRIVATE_KEY: Boolean(process.env.AFFIRM_PRIVATE_KEY),
        },
        endpoints: {
          authorize: `${BASE}${TXN}`,
          capture: `${BASE}${TXN}/{id}/capture`,
          list: `${BASE}${TXN}`,
        },
      };

      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, diag }),
      };
    }

    if (body && body.ping === true) {
      const AUTH = getAuthHeader();
      if (!AUTH) {
        return {
          statusCode: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ ok: false, error: "Missing AFFIRM_PUBLIC_KEY or AFFIRM_PRIVATE_KEY env vars" }),
        };
      }

      const transaction_type =
        typeof body.transaction_type === "string" && body.transaction_type.trim()
          ? body.transaction_type.trim()
          : "charge";

      const url = `${BASE}${TXN}?transaction_type=${encodeURIComponent(transaction_type)}&limit=1`;

      const r = await doFetch(url, { method: "GET", headers: { Authorization: AUTH } });

      const t = await r.text();
      let data;
      try {
        data = t ? JSON.parse(t) : null;
      } catch {
        data = { raw: t };
      }

      console.log("[affirm][ping][list transactions]", { status: r.status, transaction_type, resp: safe(data) });

      return {
        statusCode: r.ok ? 200 : r.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: r.ok, status: r.status, data }),
      };
    }

    const {
      checkout_token,
      order_id,
      amount_cents,
      capture = true,
      shipping_carrier,
      shipping_confirmation,
    } = body || {};

    if (!checkout_token || !order_id) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing checkout_token or order_id" }),
      };
    }

    const AUTH = getAuthHeader();
    if (!AUTH) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing AFFIRM_PUBLIC_KEY or AFFIRM_PRIVATE_KEY env vars" }),
      };
    }

    // 1) AUTHORIZE
    const authRes = await doFetch(`${BASE}${TXN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: AUTH },
      body: JSON.stringify({ checkout_token }),
    });

    const authText = await authRes.text();
    let authJson;
    try {
      authJson = authText ? JSON.parse(authText) : null;
    } catch {
      authJson = { raw: authText };
    }

    console.log("[affirm][authorize][transactions]", { status: authRes.status, order_id, resp: safe(authJson) });

    if (!authRes.ok) {
      return {
        statusCode: authRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, step: "authorize", error: authJson }),
      };
    }

    const transactionId = authJson?.id;
    if (!transactionId) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, step: "authorize", error: "Authorize succeeded but missing transaction id", raw: authJson }),
      };
    }

    // 2) CAPTURE
    let captureJson = null;

    if (capture) {
      const amt = Number(amount_cents);
      const okAmt = Number.isFinite(amt) && amt > 0 && Number.isInteger(amt);

      if (!okAmt) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ ok: false, step: "validate", error: "amount_cents required (positive integer) when capture=true" }),
        };
      }

      const capRes = await doFetch(`${BASE}${TXN}/${encodeURIComponent(transactionId)}/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: AUTH },
        body: JSON.stringify({
          order_id,
          amount: amt,
          shipping_carrier,
          shipping_confirmation,
        }),
      });

      const capText = await capRes.text();
      try {
        captureJson = capText ? JSON.parse(capText) : null;
      } catch {
        captureJson = { raw: capText };
      }

      console.log("[affirm][capture][transactions]", { status: capRes.status, order_id, amount_cents: amt, transactionId, resp: safe(captureJson) });

      if (!capRes.ok) {
        return {
          statusCode: capRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ ok: false, step: "capture", transaction_id: transactionId, error: captureJson }),
        };
      }
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        transaction_id: transactionId,
        authorized: true,
        captured: Boolean(capture),
        capture: captureJson,
      }),
    };
  } catch (e) {
    console.error("[affirm-authorize] error", e?.name, e?.message);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "server_error", name: e?.name || null, message: e?.message || null }),
    };
  }
}
