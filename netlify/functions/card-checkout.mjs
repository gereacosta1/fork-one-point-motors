// netlify/functions/card-checkout.mjs
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2024-06-20' })
  : null;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const safe = (o) => {
  try {
    return JSON.stringify(o, null, 2).slice(0, 4000);
  } catch {
    return '[unserializable]';
  }
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: 'Method Not Allowed',
    };
  }

  try {
    console.log('[stripe key prefix]', stripeSecret?.slice(0, 8), '...len=', stripeSecret?.length);
    if (!stripe) {
      return json(500, { error: 'Missing STRIPE_SECRET_KEY env var' });
    }

    const body = JSON.parse(event.body || '{}');
    const items = Array.isArray(body.items) ? body.items : [];
    const origin =
      typeof body.origin === 'string' && body.origin.startsWith('http')
        ? body.origin
        : 'https://onewaymotor.com';

    if (!items.length) {
      return json(400, { error: 'items array required' });
    }

    const line_items = items.map((it, index) => {
      const name = (it.name || `Item ${index + 1}`).toString().slice(0, 120);
      const unitAmount = Math.round(Number(it.price || 0) * 100);
      const qty = Math.max(1, Number(it.qty) || 1);

      return {
        price_data: {
          currency: 'usd',
          product_data: { name },
          unit_amount: unitAmount,
        },
        quantity: qty,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: `${origin}/?card=success`,
      cancel_url: `${origin}/?card=cancel`,
    });

    console.log('[stripe checkout session]', safe({ id: session.id, url: session.url }));

    return json(200, { ok: true, url: session.url });
  } catch (err) {
    // ⬇️ AHORA vemos el error real de Stripe en el frontend y en logs
    console.error('[card-checkout] error', err);

    const msg =
      (err && err.message) ||
      (err && err.raw && err.raw.message) ||
      'server_error';

    const code = err && (err.code || (err.raw && err.raw.code));

    return json(500, { error: msg, code: code || null });
  }
}

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  };
}
