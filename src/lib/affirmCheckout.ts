// src/lib/affirmCheckout.ts
export type CartItem = {
  id: string | number;
  title: string;
  price: number;
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
    zip?: string;
    zipcode?: string;
    country?: string;
  };
};

type AffirmName = {
  first: string;
  last: string;
};

type AffirmAddress = {
  line1: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
};

type AffirmCheckoutItem = {
  display_name: string;
  sku: string;
  unit_price: number;
  qty: number;
  item_url: string;
  item_image_url?: string;
};

export type AffirmCheckoutPayload = {
  merchant: {
    user_confirmation_url: string;
    user_cancel_url: string;
    user_confirmation_url_action: "GET";
    name: string;
  };
  billing: {
    name: AffirmName;
    address: AffirmAddress;
  };
  shipping: {
    name: AffirmName;
    address: AffirmAddress;
  };
  items: AffirmCheckoutItem[];
  currency: "USD";
  shipping_amount: number;
  tax_amount: number;
  total: number;
  metadata: {
    mode: "modal";
  };
};

const toCents = (usd = 0): number => {
  const n = Number(usd);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n * 100));
};

const FALLBACK_ADDR: AffirmAddress = {
  line1: "821 NE 79th St",
  city: "Miami",
  state: "FL",
  zipcode: "33138",
  country: "US",
};

function toAbsUrl(u: string | undefined, base: string): string | undefined {
  if (!u) return undefined;

  try {
    return new URL(u, base).toString();
  } catch {
    return undefined;
  }
}

function buildNameAndAddress(customer?: Customer): {
  name: AffirmName;
  address: AffirmAddress;
} {
  const name: AffirmName = {
    first: (customer?.firstName || "Online").trim(),
    last: (customer?.lastName || "Customer").trim(),
  };

  const addressInput = customer?.address;
  const zipLike = (addressInput?.zipcode ?? addressInput?.zip ?? "").trim();

  const address: AffirmAddress = {
    line1: addressInput?.line1?.trim() || FALLBACK_ADDR.line1,
    city: addressInput?.city?.trim() || FALLBACK_ADDR.city,
    state: addressInput?.state?.trim() || FALLBACK_ADDR.state,
    zipcode: zipLike || FALLBACK_ADDR.zipcode,
    country: addressInput?.country?.trim() || FALLBACK_ADDR.country,
  };

  return { name, address };
}

export function buildAffirmCheckout(
  items: CartItem[],
  totals: Totals,
  customer?: Customer,
  merchantBase?: string
): AffirmCheckoutPayload {
  const base =
    merchantBase && merchantBase.trim()
      ? merchantBase
      : window.location.origin;

  const mapped: AffirmCheckoutItem[] = items
    .map((product, index) => {
      const unitPrice = toCents(product.price);
      const qty = Math.max(1, Math.trunc(Number(product.qty) || 1));

      const item: AffirmCheckoutItem = {
        display_name: String(product.title || `Item ${index + 1}`).trim().slice(0, 120),
        sku: String(product.id || `SKU-${index + 1}`)
          .trim()
          .replace(/\s+/g, "-")
          .slice(0, 64),
        unit_price: unitPrice,
        qty,
        item_url: toAbsUrl(product.url, base) || `${base}/`,
      };

      const img = toAbsUrl(product.image, base);
      if (img) {
        item.item_image_url = img;
      }

      return item;
    })
    .filter((item) => item.display_name && item.unit_price > 0 && item.qty > 0);

  const shippingCents = toCents(totals.shippingUSD ?? 0);
  const taxCents = toCents(totals.taxUSD ?? 0);
  const subtotalCents = mapped.reduce(
    (acc, item) => acc + item.unit_price * item.qty,
    0
  );
  const totalCents = subtotalCents + shippingCents + taxCents;

  const { name, address } = buildNameAndAddress(customer);

  return {
    merchant: {
      user_confirmation_url: `${base}/affirm/confirm.html`,
      user_cancel_url: `${base}/affirm/cancel.html`,
      user_confirmation_url_action: "GET",
      name: "ONE POINT MOTORS",
    },
    billing: { name, address },
    shipping: { name, address },
    items: mapped,
    currency: "USD",
    shipping_amount: shippingCents,
    tax_amount: taxCents,
    total: totalCents,
    metadata: { mode: "modal" },
  };
}