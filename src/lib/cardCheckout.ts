// src/lib/cardCheckout.ts

export interface CardItem {
  id?: string;
  name: string;
  price: number;
  qty: number;
  sku?: string;
}

type CheckoutRequestItem = {
  name: string;
  price: number;
  qty: number;
};

type CheckoutResponse = {
  ok?: boolean;
  url?: string;
  error?: string;
};

const toNumber = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const toInt = (value: unknown, min = 1): number => {
  const num = Math.trunc(toNumber(value));
  return Number.isFinite(num) ? Math.max(min, num) : min;
};

async function postJson(
  url: string,
  body: Record<string, unknown>
): Promise<{ res: Response; data: CheckoutResponse }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });

  let data: CheckoutResponse = {};

  try {
    data = (await res.json()) as CheckoutResponse;
  } catch {
    data = {};
  }

  return { res, data };
}

export async function startCardCheckout(items: CardItem[]): Promise<void> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("no_items");
  }

  const normalized: CheckoutRequestItem[] = items
    .map((item) => ({
      name: String(item.name || "").trim().slice(0, 120),
      price: toNumber(item.price),
      qty: toInt(item.qty, 1),
    }))
    .filter((item) => item.name.length > 0 && item.price > 0 && item.qty > 0);

  if (normalized.length === 0) {
    throw new Error("no_valid_items");
  }

  const endpoints = ["/.netlify/functions/card-checkout", "/api/card-checkout"];

  let lastError = "card_checkout_failed";

  for (const url of endpoints) {
    try {
      const { res, data } = await postJson(url, { items: normalized });

      if (res.ok && data.ok && data.url) {
        window.location.assign(data.url);
        return;
      }

      lastError =
        typeof data.error === "string" && data.error.trim()
          ? data.error
          : `status_${res.status}`;

      console.error("[card-checkout] failed:", url, lastError);
    } catch (error) {
      lastError =
        error instanceof Error && error.message
          ? error.message
          : "network_error";

      console.error("[card-checkout] request error:", url, error);
    }
  }

  throw new Error(lastError);
}