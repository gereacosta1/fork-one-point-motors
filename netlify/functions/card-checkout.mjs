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
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
  };
}

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const toInt = (value, min = 1) => {
  const num = Math.trunc(toNumber(value));
  return Number.isFinite(num) ? Math.max(min, num) : min;
};

const getOriginFromHeaders = (headers = {}) => {
  const proto =
    headers["x-forwarded-proto"] ||
    headers["X-Forwarded-Proto"] ||
    "https";

  const host =
    headers["x-forwarded-host"] ||
    headers["X-Forwarded-Host"] ||
    headers.host ||
    headers.Host;

  return host ? `${proto}://${host}` : "https://www.onepointmotors.com";
};

const normalizeImageUrl = (url) => {
  if (!url) return null;

  const value = String(url).trim();

  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return null;
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, {
      ok: false,
      error: "Method Not Allowed",
    });
  }

  try {
    if (!stripe) {
      return json(500, {
        ok: false,
        error: "Missing STRIPE_SECRET_KEY env var",
      });
    }

    let body = {};

    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, {
        ok: false,
        error: "invalid_json_body",
      });
    }

    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return json(400, {
        ok: false,
        error: "items array required",
      });
    }

    const origin = getOriginFromHeaders(event.headers || {});

    const line_items = items
      .map((item, index) => {
        const name = String(item?.name || `Item ${index + 1}`)
          .trim()
          .slice(0, 120);

        const unitAmount = Math.round(toNumber(item?.price) * 100);
        const quantity = toInt(item?.qty ?? item?.quantity, 1);
        const image = normalizeImageUrl(item?.image || item?.imageUrl);

        if (!name || unitAmount <= 0 || quantity <= 0) {
          return null;
        }

        if (unitAmount < 50) {
          return null;
        }

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name,
              ...(image ? { images: [image] } : {}),
            },
            unit_amount: unitAmount,
          },
          quantity,
        };
      })
      .filter(Boolean);

    if (line_items.length === 0) {
      return json(400, {
        ok: false,
        error: "no_valid_line_items",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      // IMPORTANTE:
      // No agregamos "zip" porque puede romper Stripe Checkout si no está disponible.
      // Card siempre debe funcionar. Klarna y Afterpay/Clearpay aparecerán solo si Stripe
      // los tiene disponibles/aprobados para la cuenta, moneda, país y tipo de negocio.
      payment_method_types: ["card", "klarna", "afterpay_clearpay"],

      line_items,

      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: true,
      },

      success_url: `${origin}/?card=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?card=cancel`,
    });

    if (!session.url) {
      return json(500, {
        ok: false,
        error: "missing_checkout_url",
      });
    }

    return json(200, {
      ok: true,
      url: session.url,
      id: session.id,
    });
  } catch (err) {
    console.error("[card-checkout] error", err);

    const message =
      err instanceof Error
        ? err.message
        : err?.raw?.message || "server_error";

    const code =
      err && typeof err === "object"
        ? err.code || err?.raw?.code || null
        : null;

    return json(500, {
      ok: false,
      error: message,
      code,
    });
  }
}