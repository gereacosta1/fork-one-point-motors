// netlify/functions/card-checkout.mjs
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toInt = (v, min = 1) => {
  const n = Math.trunc(toNumber(v));
  return Number.isFinite(n) ? Math.max(min, n) : min;
};

const getOriginFromHeaders = (headers = {}) => {
  const proto = headers["x-forwarded-proto"] || "https";
  const host = headers["x-forwarded-host"] || headers.host;
  return host ? `${proto}://${host}` : "https://www.onepointmotors.com";
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method Not Allowed" });
  }

  try {
    if (!stripe) return json(500, { ok: false, error: "Missing STRIPE_SECRET_KEY env var" });

    const body = JSON.parse(event.body || "{}");
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) return json(400, { ok: false, error: "items array required" });

    const origin = getOriginFromHeaders(event.headers || {});

    const line_items = items
      .map((it, index) => {
        const name = String(it.name || `Item ${index + 1}`).slice(0, 120);
        const unitAmount = Math.round(toNumber(it.price) * 100); // USD -> cents
        const qty = toInt(it.qty, 1);

        if (!name || unitAmount <= 0) return null;

        // Stripe en USD suele exigir mínimo ~50 centavos; si querés, lo forzamos:
        if (unitAmount < 50) return null;

        return {
          price_data: {
            currency: "usd",
            product_data: { name },
            unit_amount: unitAmount,
          },
          quantity: qty,
        };
      })
      .filter(Boolean);

    if (!line_items.length) {
      return json(400, { ok: false, error: "no_valid_line_items" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "afterpay_clearpay", "klarna", "zip"],
      line_items,
      success_url: `${origin}/?card=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?card=cancel`,
    });

    return json(200, { ok: true, url: session.url });
  } catch (err) {
    console.error("[card-checkout] error", err);

    const msg =
      (err && err.message) ||
      (err && err.raw && err.raw.message) ||
      "server_error";

    const code = err && (err.code || (err.raw && err.raw.code));

    return json(500, { ok: false, error: msg, code: code || null });
  }
}
