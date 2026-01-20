// src/lib/affirmCheckout.ts
export type CartItem = {
  id: string | number;
  title: string;
  price: number; // USD
  qty: number;
  image?: string;
  url?: string;
};

export type Totals = {
  subtotalUSD: number;
  shippingUSD?: number;
  taxUSD?: number;
};

export type Customer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    // soportamos ambos para compatibilidad:
    zip?: string;
    zipcode?: string;
    country?: string;
  };
};

const toCents = (usd = 0) => {
  const n = Number(usd);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n * 100));
};

// ✅ Nueva dirección
const FALLBACK_ADDR = {
  line1: "821 NE 79th St",
  city: "Miami",
  state: "FL",
  zipcode: "33138",
  country: "US",
};

function toAbsUrl(u: string | undefined, base: string) {
  if (!u) return undefined;
  try {
    return new URL(u, base).toString();
  } catch {
    return undefined;
  }
}

function buildNameAndAddress(c?: Customer) {
  const name = {
    first: (c?.firstName || "Online").trim(),
    last: (c?.lastName || "Customer").trim(),
  };

  const a = c?.address || {};
  const zipLike = (a.zipcode ?? a.zip)?.trim();

  const address = {
    line1: a.line1?.trim() || FALLBACK_ADDR.line1,
    city: a.city?.trim() || FALLBACK_ADDR.city,
    state: a.state?.trim() || FALLBACK_ADDR.state,
    zipcode: zipLike || FALLBACK_ADDR.zipcode,
    country: a.country?.trim() || FALLBACK_ADDR.country,
  };

  return { name, address };
}

export function buildAffirmCheckout(
  items: CartItem[],
  totals: Totals,
  customer?: Customer,
  merchantBase = window.location.origin
) {
  const mapped = items
    .map((p, idx) => {
      const unit_price = toCents(p.price);
      const qty = Math.max(1, Math.trunc(Number(p.qty) || 1));

      const item: any = {
        display_name: (p.title || `Item ${idx + 1}`).toString().slice(0, 120),
        sku: String(p.id).slice(0, 64),
        unit_price,
        qty,
        item_url: toAbsUrl(p.url, merchantBase) || `${merchantBase}/`,
      };

      // ✅ nombre correcto en Affirm + URL absoluta
      const img = toAbsUrl(p.image, merchantBase);
      if (img) item.item_image_url = img;

      return item;
    })
    .filter((it) => it.display_name && it.unit_price > 0 && it.qty > 0);

  const shippingC = toCents(totals.shippingUSD ?? 0);
  const taxC = toCents(totals.taxUSD ?? 0);
  const subtotalC = mapped.reduce((acc, it) => acc + it.unit_price * it.qty, 0);
  const totalC = subtotalC + shippingC + taxC;

  const { name, address } = buildNameAndAddress(customer);

  return {
    merchant: {
      user_confirmation_url: `${merchantBase}/affirm/confirm.html`,
      user_cancel_url: `${merchantBase}/affirm/cancel.html`,
      user_confirmation_url_action: "GET",
      name: "ONE POINT MOTORS",
    },
    billing: { name, address },
    shipping: { name, address },
    items: mapped,
    currency: "USD",
    shipping_amount: shippingC,
    tax_amount: taxC,
    total: totalC,
    metadata: { mode: "modal" },
  };
}
