// src/lib/cardCheckout.ts

export interface CardItem {
  id?: string;
  name: string;
  price: number;
  qty: number;
  sku?: string;
}

const toNumber = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toInt = (v: any, min = 1) => {
  const n = Math.trunc(toNumber(v));
  return Number.isFinite(n) ? Math.max(min, n) : min;
};

async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // noop
  }

  return { res, data };
}

export async function startCardCheckout(items: CardItem[]) {
  if (!items?.length) throw new Error("no_items");

  const normalized = items
    .map((it) => ({
      name: String(it.name || "").slice(0, 120),
      price: toNumber(it.price),
      qty: toInt(it.qty, 1),
    }))
    .filter((it) => it.name && it.price > 0 && it.qty > 0);

  if (!normalized.length) throw new Error("no_valid_items");

  // ✅ endpoint estable en Netlify
  const endpoints = ["/.netlify/functions/card-checkout", "/api/card-checkout"];

  let lastErr: any = null;

  for (const url of endpoints) {
    const { res, data } = await postJson(url, { items: normalized });

    if (res.ok && data?.ok && data?.url) {
      window.location.href = data.url as string;
      return;
    }

    lastErr = data?.error || data || `status_${res.status}`;
    console.error("[card-checkout] failed:", url, lastErr);
  }

  throw new Error(typeof lastErr === "string" ? lastErr : "card_checkout_failed");
}
