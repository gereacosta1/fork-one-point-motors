// netlify/functions/affirm-authorize.js

const BASE = process.env.AFFIRM_API_BASE || "https://api.affirm.com";
const TXN = "/api/v1/transactions";

const COUNTRY_CODE = process.env.AFFIRM_COUNTRY_CODE || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const safe = (obj) => {
  try {
    return JSON.stringify(obj, null, 2).slice(0, 8000);
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
  const pub = process.env.AFFIRM_PUBLIC_KEY;
  const priv = process.env.AFFIRM_PRIVATE_KEY;

  if (!pub || !priv) return null;

  return "Basic " + Buffer.from(`${pub}:${priv}`).toString("base64");
}

function buildHeaders(extra = {}) {
  const auth = getAuthHeader();
  if (!auth) return null;

  const headers = {
    Accept: "application/json",
    Authorization: auth,
    ...extra,
  };

  if (COUNTRY_CODE) {
    headers["country-code"] = COUNTRY_CODE;
  }

  return headers;
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
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: "Method Not Allowed",
    };
  }

  try {
    let body = {};
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ ok: false, error: "invalid_json_body" }),
      };
    }

    // ===== DIAG =====
    if (body.diag === true) {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: true,
          diag: {
            base: BASE,
            endpoint: `${BASE}${TXN}`,
            hasPublicKey: Boolean(process.env.AFFIRM_PUBLIC_KEY),
            hasPrivateKey: Boolean(process.env.AFFIRM_PRIVATE_KEY),
            countryCode: COUNTRY_CODE || null,
            nodeVersion: process.versions?.node || null,
          },
        }),
      };
    }

    // ===== PING =====
    if (body.ping === true) {
      const headers = buildHeaders();
      if (!headers) {
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ ok: false, error: "missing_keys" }),
        };
      }

      const url = `${BASE}${TXN}?limit=1&transaction_type=charge`;

      const res = await doFetch(url, { method: "GET", headers });
      const data = await readJson(res);

      console.log("[affirm][ping]", res.status, safe(data));

      return {
        statusCode: res.ok ? 200 : res.status,
        headers: corsHeaders,
        body: JSON.stringify({ ok: res.ok, status: res.status, data }),
      };
    }

    // ===== MAIN FLOW =====
    const {
      checkout_token,
      order_id,
      amount_cents,
      capture = true,
      shipping_carrier,
      shipping_confirmation,
    } = body;

    if (!checkout_token || !order_id) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          ok: false,
          error: "missing_checkout_token_or_order_id",
        }),
      };
    }

    const headers = buildHeaders({ "Content-Type": "application/json" });
    if (!headers) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ ok: false, error: "missing_keys" }),
      };
    }

    // ===== AUTHORIZE =====
    const authPayload = {
      transaction_id: String(checkout_token),
      order_id: String(order_id),
    };

    const authRes = await doFetch(`${BASE}${TXN}`, {
      method: "POST",
      headers,
      body: JSON.stringify(authPayload),
    });

    const authJson = await readJson(authRes);

    console.log("[affirm][authorize]", {
      status: authRes.status,
      order_id,
      resp: safe(authJson),
    });

    if (!authRes.ok) {
      return {
        statusCode: authRes.status,
        headers: corsHeaders,
        body: JSON.stringify({
          ok: false,
          step: "authorize",
          error: authJson,
        }),
      };
    }

    const transactionId = authJson?.id;

    if (!transactionId) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          ok: false,
          error: "missing_transaction_id",
          raw: authJson,
        }),
      };
    }

    // ===== CAPTURE =====
    let captureJson = null;

    if (capture) {
      const amt = Number(amount_cents);

      if (!Number.isFinite(amt) || amt <= 0 || !Number.isInteger(amt)) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            ok: false,
            step: "validation",
            error: "invalid_amount_cents",
          }),
        };
      }

      const capRes = await doFetch(
        `${BASE}${TXN}/${encodeURIComponent(transactionId)}/capture`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            order_id: String(order_id),
            amount: amt,
            shipping_carrier,
            shipping_confirmation,
          }),
        }
      );

      captureJson = await readJson(capRes);

      console.log("[affirm][capture]", {
        status: capRes.status,
        amount: amt,
        resp: safe(captureJson),
      });

      if (!capRes.ok) {
        return {
          statusCode: capRes.status,
          headers: corsHeaders,
          body: JSON.stringify({
            ok: false,
            step: "capture",
            transaction_id: transactionId,
            error: captureJson,
          }),
        };
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: true,
        transaction_id: transactionId,
        authorized: true,
        captured: Boolean(capture),
        capture: captureJson,
      }),
    };
  } catch (err) {
    console.error("[affirm-authorize] fatal", err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: false,
        error: err?.message || "server_error",
      }),
    };
  }
}