// netlify/functions/affirm-authorize.js
// API v2: crea charge desde checkout_token y (opcional) captura el pago

const BASE = "https://api.affirm.com/api/v2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const safe = (o) => {
  try {
    return JSON.stringify(o, null, 2).slice(0, 4000);
  } catch {
    return "[unserializable]";
  }
};

const doFetch = async (...args) => {
  if (typeof fetch !== "undefined") return fetch(...args);
  const { default: nf } = await import("node-fetch");
  return nf(...args);
};

export async function handler(event) {
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

    // 🔎 Diagnóstico (no llama a Affirm)
    if (body && body.diag === true) {
      const diag = {
        nodeVersion: process.versions?.node,
        hasFetch: typeof fetch !== "undefined",
        env: {
          AFFIRM_ENV: process.env.AFFIRM_ENV || null,
          HAS_AFFIRM_PUBLIC_KEY: Boolean(process.env.AFFIRM_PUBLIC_KEY),
          HAS_AFFIRM_PRIVATE_KEY: Boolean(process.env.AFFIRM_PRIVATE_KEY),
        },
        baseURL: BASE,
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
      amount_cents,
      capture, // boolean
      shipping_carrier,
      shipping_confirmation,
    } = body;

    if (!checkout_token || !order_id) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          ok: false,
          error: "Missing checkout_token or order_id",
        }),
      };
    }

    const PUB = process.env.AFFIRM_PUBLIC_KEY;
    const PRIV = process.env.AFFIRM_PRIVATE_KEY;

    if (!PUB || !PRIV) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          ok: false,
          error: "Missing AFFIRM_PUBLIC_KEY / AFFIRM_PRIVATE_KEY",
        }),
      };
    }

    const AUTH = "Basic " + Buffer.from(`${PUB}:${PRIV}`).toString("base64");

    // 1) Create charge (authorize)
    const authRes = await doFetch(`${BASE}/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH,
      },
      body: JSON.stringify({ checkout_token }),
    });

    const charge = await authRes.json().catch(() => ({}));
    console.log("[charges]", { status: authRes.status, resp: safe(charge) });

    if (!authRes.ok) {
      return {
        statusCode: authRes.status,
        headers: corsHeaders,
        body: JSON.stringify({ ok: false, step: "charges", error: charge }),
      };
    }

    // 2) Capture (optional, instant if capture=true)
    const doCapture = capture === true;
    let captureResp = null;

    if (doCapture) {
      const amt = Number(amount_cents);

      if (!Number.isFinite(amt) || amt <= 0 || !Number.isInteger(amt)) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            ok: false,
            step: "capture",
            error: "amount_cents required (positive integer) when capture=true",
          }),
        };
      }

      const capRes = await doFetch(
        `${BASE}/charges/${encodeURIComponent(charge.id)}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: AUTH,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id,
            amount: amt,
            // si tu merchant NO requiere esto, podés omitirlo.
            // si lo requiere y falta, acá vas a ver el error exacto.
            shipping_carrier,
            shipping_confirmation,
          }),
        }
      );

      captureResp = await capRes.json().catch(() => ({}));
      console.log("[capture]", { status: capRes.status, resp: safe(captureResp) });

      if (!capRes.ok) {
        return {
          statusCode: capRes.status,
          headers: corsHeaders,
          body: JSON.stringify({
            ok: false,
            step: "capture",
            error: captureResp,
            charge_id: charge?.id,
          }),
        };
      }
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        charge_id: charge?.id,
        capture_attempted: doCapture,
        capture: captureResp,
      }),
    };
  } catch (e) {
    console.error("[affirm-authorize] error", e?.name, e?.message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        ok: false,
        error: "server_error",
        name: e?.name || null,
        message: e?.message || null,
      }),
    };
  }
}
