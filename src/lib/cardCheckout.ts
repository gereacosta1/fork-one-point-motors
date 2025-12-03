// src/lib/cardCheckout.ts

export interface CardItem {
  id?: string;
  name: string;
  price: number;
  qty: number;
}

export async function startCardCheckout(items: CardItem[]) {
  if (!items || !items.length) {
    throw new Error("no_items");
  }

  // Llamamos a la función serverless /api/card-checkout
  const res = await fetch("/api/card-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((it) => ({
        name: it.name,
        price: it.price,
        qty: it.qty,
      })),
      origin: window.location.origin,
    }),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // por las dudas
  }

  if (!res.ok || !data?.ok || !data?.url) {
    console.error("[card-checkout] error body:", data);
    throw new Error(data?.error || "card_checkout_failed");
  }

  // Redirigimos a Stripe Checkout
  window.location.href = data.url as string;
}
