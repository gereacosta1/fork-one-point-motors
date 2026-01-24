// netlify/functions/affirm-authorize.js
const BASE = process.env.AFFIRM_API_BASE || "https://api.affirm.com";
const TXN = "/api/v1/transactions";

// Si tu merchant es "global integration" (fuera de USA), Affirm pide country-code en headers.
// Para USA lo podés dejar vacío.
const COUNTRY_CODE = process.env.AFFIRM_COUNTRY_CODE || ""; // ejemplo: "USA", "CAN"

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

function buildAffirmHeaders(extra = {}) {
  const AUTH = getAuthHeader();
  if (!AUTH) return null;

  const h = {
    Accept: "application/json",
    Authorization: AUTH,
    ...extra,
  };

  if (COUNTRY_CODE) h["country-code"] = COUNTRY_CODE;
  return h;
}

async function readJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
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

    // -------- DIAG (para chequear env y endpoints) --------
    if (body && body.diag === true) {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: true,
          diag: {
            base: BASE,
            txn: `${BASE}${TXN}`,
            hasPublicKey: Boolean(process.env.AFFIRM_PUBLIC_KEY),
            hasPrivateKey: Boolean(process.env.AFFIRM_PRIVATE_KEY),
            countryCode: COUNTRY_CODE || null,
            nodeVersion: process.versions?.node || null,
            hasFetch: typeof fetch !== "undefined",
          },
        }),
      };
    }

    // -------- PING (solo verifica auth con una llamada liviana) --------
    if (body && body.ping === true) {
      const headers = buildAffirmHeaders();
      if (!headers) {
        return {
          statusCode: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ ok: false, error: "Missing AFFIRM_PUBLIC_KEY or AFFIRM_PRIVATE_KEY" }),
        };
      }

      const url = `${BASE}${TXN}?limit=1&transaction_type=capture`;
      const r = await doFetch(url, { method: "GET", headers });
      const data = await readJson(r);

      console.log("[affirm][ping]", { status: r.status, resp: safe(data) });

      return {
        statusCode: r.ok ? 200 : r.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: r.ok, status: r.status, data }),
      };
    }

    // -------- MAIN FLOW: AUTHORIZE + (optional) CAPTURE --------
    const {
      checkout_token, // esto que te llega de Affirm
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

    const headers = buildAffirmHeaders({ "Content-Type": "application/json" });
    if (!headers) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing AFFIRM_PUBLIC_KEY or AFFIRM_PRIVATE_KEY" }),
      };
    }

    // 1) AUTHORIZE
    // IMPORTANT: Según docs, el checkout_token se manda como transaction_id. :contentReference[oaicite:2]{index=2}
    const authorizePayload = {
      transaction_id: String(checkout_token),
      order_id: String(order_id),
    };

    const authRes = await doFetch(`${BASE}${TXN}`, {
      method: "POST",
      headers,
      body: JSON.stringify(authorizePayload),
    });

    const authJson = await readJson(authRes);
    console.log("[affirm][authorize]", { status: authRes.status, order_id, payload: authorizePayload, resp: safe(authJson) });

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
        body: JSON.stringify({
          ok: false,
          step: "authorize",
          error: "Authorize succeeded but missing transaction id in response",
          raw: authJson,
        }),
      };
    }

    // 2) CAPTURE (opcional)
    let captureJson = null;

    if (capture) {
      const amt = Number(amount_cents);
      const okAmt = Number.isFinite(amt) && amt > 0 && Number.isInteger(amt);

      if (!okAmt) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            ok: false,
            step: "validate",
            error: "amount_cents required (positive integer) when capture=true",
            got: amount_cents,
          }),
        };
      }

      const capRes = await doFetch(`${BASE}${TXN}/${encodeURIComponent(transactionId)}/capture`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          order_id: String(order_id),
          amount: amt,
          shipping_carrier,
          shipping_confirmation,
        }),
      });

      captureJson = await readJson(capRes);

      console.log("[affirm][capture]", {
        status: capRes.status,
        order_id,
        amount_cents: amt,
        transactionId,
        resp: safe(captureJson),
      });

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
