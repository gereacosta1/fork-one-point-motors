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
    zip?: string;
    country?: string;
  };
};

const toCents = (usd = 0) => Math.round((usd || 0) * 100);

const FALLBACK_ADDR = {
  line1: '297 NW 54th St',
  city: 'Miami',
  state: 'FL',
  zipcode: '33127',
  country: 'US',
};

function buildNameAndAddress(c?: Customer) {
  const name = {
    first: (c?.firstName || 'Online').trim(),
    last: (c?.lastName || 'Customer').trim(),
  };
  const a = c?.address || {};
  const address = {
    line1: a.line1?.trim() || FALLBACK_ADDR.line1,
    city: a.city?.trim() || FALLBACK_ADDR.city,
    state: a.state?.trim() || FALLBACK_ADDR.state,
    zipcode: a.zip?.trim() || FALLBACK_ADDR.zipcode,
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
  const mapped = items.map((p, idx) => ({
    display_name: p.title || `Item ${idx + 1}`,
    sku: String(p.id),
    unit_price: toCents(p.price),
    qty: Math.max(1, Number(p.qty) || 1),
    item_url: (p.url?.startsWith('http') ? p.url : merchantBase + (p.url || '/')),
    image_url: p.image ? (p.image.startsWith('http') ? p.image : merchantBase + p.image) : undefined,
  }));

  const shippingC = toCents(totals.shippingUSD ?? 0);
  const taxC = toCents(totals.taxUSD ?? 0);
  const subtotalC = mapped.reduce((acc, it) => acc + it.unit_price * it.qty, 0);
  const totalC = subtotalC + shippingC + taxC;

  const { name, address } = buildNameAndAddress(customer);

  const payload = {
    merchant: {
      user_confirmation_url: merchantBase + '/affirm/confirm.html',
      user_cancel_url: merchantBase + '/affirm/cancel.html',
      user_confirmation_url_action: 'GET',
      name: 'ONE POINT MOTORS',
    },
    billing: { name, address },
    shipping: { name, address },
    items: mapped,
    currency: 'USD',
    shipping_amount: shippingC,
    tax_amount: taxC,
    total: totalC,
    metadata: { mode: 'modal' },
  };

  return payload;
}
