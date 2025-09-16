// netlify/functions/affirm-authorize.js
// API v2: crea charge desde checkout_token y (opcional) captura el pago

const isProd = String(process.env.AFFIRM_ENV || "").toLowerCase() === "prod";
const BASE = isProd
  ? "https://api.affirm.com/api/v2"
  : "https://sandbox.affirm.com/api/v2";

// CORS básico
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Logging seguro (acorta respuestas grandes)
const safe = (o) => {
  try {
    return JSON.stringify(o, null, 2).slice(0, 4000);
  } catch {
    return "[unserializable]";
  }
};

// ⚙️ En prod conviene capturar para que luego se “fundee”
const CAPTURE = false;

// Usa fetch nativo si existe; si no, importa node-fetch dinámicamente
const doFetch = async (...args) => {
  if (typeof fetch !== "undefined") return fetch(...args);
  const { default: nf } = await import("node-fetch");
  return nf(...args);
};

export async function handler(event) {
  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: "Method Not Allowed",
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    // 🔎 Modo diagnóstico (no llama a Affirm)
    if (body && body.diag === true) {
      const diag = {
        nodeVersion: process.versions?.node,
        hasFetch: typeof fetch !== "undefined",
        env: {
          AFFIRM_ENV: process.env.AFFIRM_ENV || null,
          HAS_AFFIRM_PUBLIC_KEY: Boolean(process.env.AFFIRM_PUBLIC_KEY),
          HAS_AFFIRM_PRIVATE_KEY: Boolean(process.env.AFFIRM_PRIVATE_KEY),
          HAS_AFFIRM_MERCHANT_ID: Boolean(process.env.AFFIRM_MERCHANT_ID),
        },
        baseURL: BASE,
        isProd,
      };
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, diag }),
      };
    }

    const {
      checkout_token,
      order_id,
      amount_cents,          // total en centavos (entero)
      shipping_carrier,      // opcional
      shipping_confirmation, // opcional
    } = body;

    if (!checkout_token || !order_id) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing checkout_token or order_id" }),
      };
    }

    const PUB = process.env.AFFIRM_PUBLIC_KEY;
    const PRIV = process.env.AFFIRM_PRIVATE_KEY;
    if (!PUB || !PRIV) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing AFFIRM keys" }),
      };
    }

    const AUTH = "Basic " + Buffer.from(`${PUB}:${PRIV}`).toString("base64");

    // 1) Autorizar: crear el charge a partir del checkout_token
    const authRes = await doFetch(`${BASE}/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH,
      },
      body: JSON.stringify({ checkout_token }),
    });

    const charge = await authRes.json().catch(() => ({}));
    console.log(
      "[charges] env=",
      isProd ? "prod" : "sandbox",
      " status=",
      authRes.status,
      " resp=",
      safe(charge)
    );

    if (!authRes.ok) {
      return {
        statusCode: authRes.status,
        headers: corsHeaders,
        body: JSON.stringify({ step: "charges", error: charge }),
      };
    }

    // 2) Capturar (si tu merchant no tiene auto-capture)
    let capture = null;
    if (CAPTURE) {
      if (typeof amount_cents !== "number") {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: "amount_cents required for capture=true" }),
        };
      }

      const capRes = await doFetch(`${BASE}/charges/${encodeURIComponent(charge.id)}/capture`, {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id,
          amount: amount_cents,
          shipping_carrier,
          shipping_confirmation,
        }),
      });

      capture = await capRes.json().catch(() => ({}));
      console.log("[capture] status=", capRes.status, " resp=", safe(capture));

      if (!capRes.ok) {
        return {
          statusCode: capRes.status,
          headers: corsHeaders,
          body: JSON.stringify({ step: "capture", error: capture }),
        };
      }
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, charge, capture }),
    };
  } catch (e) {
    console.error("[affirm-authorize] error", e?.name, e?.message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "server_error",
        name: e?.name || null,
        message: e?.message || null,
      }),
    };
  }
}
