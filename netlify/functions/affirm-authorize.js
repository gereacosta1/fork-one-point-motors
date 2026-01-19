// netlify/functions/affirm-authorize.js

const PROD_BASE = "https://api.affirm.com";
const SANDBOX_BASE = "https://sandbox.affirm.com";
const CHARGES = "/api/v2/charges";

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

function getBase() {
  const env = String(process.env.AFFIRM_ENV || "").toLowerCase().trim();
  // Valores esperados: "sandbox" o "production" (vacío => production)
  return env === "sandbox" ? SANDBOX_BASE : PROD_BASE;
}

function getAuthHeader() {
  const PUB = process.env.AFFIRM_PUBLIC_KEY;
  const PRIV = process.env.AFFIRM_PRIVATE_KEY;
  if (!PUB || !PRIV) return null;
  return "Basic " + Buffer.from(`${PUB}:${PRIV}`).toString("base64");
}

async function readJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
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

  const BASE = getBase();
  const AUTH = getAuthHeader();

  try {
    const body = JSON.parse(event.body || "{}");

    // 1) DIAG (no pega a Affirm)
    if (body?.diag === true) {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: true,
          diag: {
            base: BASE,
            endpoints: {
              authorize: `${BASE}${CHARGES}`,
              capture: `${BASE}${CHARGES}/{id}/capture`,
            },
            env: {
              AFFIRM_ENV: process.env.AFFIRM_ENV || "production",
              HAS_AFFIRM_PUBLIC_KEY: Boolean(process.env.AFFIRM_PUBLIC_KEY),
              HAS_AFFIRM_PRIVATE_KEY: Boolean(process.env.AFFIRM_PRIVATE_KEY),
            },
            runtime: {
              node: process.versions?.node || null,
              hasFetch: typeof fetch !== "undefined",
            },
          },
        }),
      };
    }

    // 2) PING (solo valida env; no pega a Affirm)
    if (body?.ping === true) {
      if (!AUTH) {
        return {
          statusCode: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            ok: false,
            error: "Missing AFFIRM_PUBLIC_KEY or AFFIRM_PRIVATE_KEY env vars",
          }),
        };
      }
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, base: BASE, env: process.env.AFFIRM_ENV || "production" }),
      };
    }

    if (!AUTH) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: false,
          error: "Missing AFFIRM_PUBLIC_KEY or AFFIRM_PRIVATE_KEY env vars",
        }),
      };
    }

    // Inputs esperados desde tu confirm flow
    const {
      checkout_token,
      order_id,
      amount_cents,
      capture = true,
      shipping_carrier,
      shipping_confirmation,
    } = body || {};

    if (typeof checkout_token !== "string" || !checkout_token.trim()) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing checkout_token" }),
      };
    }

    // order_id: recomendable siempre, y requerido si capturás
    const needsOrderId = Boolean(capture);
    if (needsOrderId && (typeof order_id !== "string" || !order_id.trim())) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing order_id (required when capture=true)" }),
      };
    }

    // amount_cents requerido si capture=true
    let amt = null;
    if (capture) {
      amt = Number(amount_cents);
      const okAmt = Number.isFinite(amt) && amt > 0 && Number.isInteger(amt);
      if (!okAmt) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            ok: false,
            error: "amount_cents required (positive integer) when capture=true",
          }),
        };
      }
    }

    // 3) AUTHORIZE (Charges v2)
    const authRes = await doFetch(`${BASE}${CHARGES}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: AUTH },
      body: JSON.stringify({ checkout_token: checkout_token.trim() }),
    });

    const authJson = await readJson(authRes);

    console.log("[affirm][authorize][charges]", {
      status: authRes.status,
      order_id: order_id || null,
      resp: safe(authJson),
    });

    if (!authRes.ok) {
      return {
        statusCode: authRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: false, step: "authorize", error: authJson }),
      };
    }

    // En v2 charges, el id del charge suele venir en `id`
    const chargeId = authJson?.id;
    if (!chargeId) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          ok: false,
          step: "authorize",
          error: "Authorize succeeded but missing charge id",
          raw: authJson,
        }),
      };
    }

    // 4) CAPTURE (opcional)
    let captureJson = null;

    if (capture) {
      const capPayload = {
        order_id: order_id.trim(),
        amount: amt, // cents
      };

      // Opcionales (solo si existen)
      if (shipping_carrier) capPayload.shipping_carrier = shipping_carrier;
      if (shipping_confirmation) capPayload.shipping_confirmation = shipping_confirmation;

      const capRes = await doFetch(`${BASE}${CHARGES}/${encodeURIComponent(chargeId)}/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: AUTH },
        body: JSON.stringify(capPayload),
      });

      captureJson = await readJson(capRes);

      console.log("[affirm][capture][charges]", {
        status: capRes.status,
        order_id,
        amount_cents: amt,
        charge_id: chargeId,
        resp: safe(captureJson),
      });

      if (!capRes.ok) {
        return {
          statusCode: capRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            ok: false,
            step: "capture",
            charge_id: chargeId,
            error: captureJson,
          }),
        };
      }
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        charge_id: chargeId,
        authorized: true,
        captured: Boolean(capture),
        authorize: authJson,
        capture: captureJson,
      }),
    };
  } catch (e) {
    console.error("[affirm-authorize] error", e?.name, e?.message);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: false,
        error: "server_error",
        name: e?.name || null,
        message: e?.message || null,
      }),
    };
  }
}
