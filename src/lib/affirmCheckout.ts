// src/lib/affirmCheckout.ts
export type CartItem = {
  id: string | number;
  title: string;
  price: number;      // USD
  qty: number;
  image?: string;     // /img/xxx.jpg
  url?: string;       // /product/xxx
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
  phone?: string; // E.164 (+1XXXXXXXXXX) — opcional; NO lo enviaremos por defecto
  address?: {
    line1?: string;
    city?: string;
    state?: string;   // "FL"
    zip?: string;     // "33127"
    country?: string; // "US"
  };
};

const toCents = (usd = 0) => Math.round((usd || 0) * 100);

// Validadores mínimos
const isUSState  = (v?: string) => !!v && /^[A-Z]{2}$/.test(v.toUpperCase());
const isUSZip    = (v?: string) => !!v && /^\d{5}(-\d{4})?$/.test(v);
const isCountryUS = (v?: string) => (v || '').toUpperCase() === 'US';

// Dirección USPS REAL para cumplir con name+address y abrir el modal
const FALLBACK_ADDR = {
  line1:  '297 NW 54th St',
  city:   'Miami',
  state:  'FL',
  zipcode:'33127',
  country:'US',
};

function buildNameAndAddress(c?: Customer) {
  const a = c?.address || {};
  const name = {
    first: (c?.firstName || 'Online').trim(),
    last:  (c?.lastName  || 'Customer').trim(),
  };
  const addr = {
    line1:   (a.line1   && a.line1.trim())   || FALLBACK_ADDR.line1,
    city:    (a.city    && a.city.trim())    || FALLBACK_ADDR.city,
    state:    isUSState(a.state)   ? a.state!.trim()   : FALLBACK_ADDR.state,
    zipcode:  isUSZip(a.zip)       ? a.zip!.trim()     : FALLBACK_ADDR.zipcode,
    country:  isCountryUS(a.country)? a.country!.trim(): FALLBACK_ADDR.country,
  };
  return { name, addr };
}

export function buildAffirmCheckout(
  items: CartItem[],
  totals: Totals,
  customer?: Customer,
  merchantBase = window.location.origin
) {
  const mapped = items.map((p, idx) => ({
    display_name: (p.title || `Item ${idx + 1}`).toString().slice(0, 120),
    sku: String(p.id),
    unit_price: toCents(p.price),
    qty: Math.max(1, Number(p.qty) || 1),
    item_url: (p.url?.startsWith('http') ? p.url : merchantBase + (p.url || '/')),
    image_url: p.image ? (p.image.startsWith('http') ? p.image : merchantBase + p.image) : undefined,
  }));

  const shippingC = toCents(totals.shippingUSD ?? 0);
  const taxC      = toCents(totals.taxUSD ?? 0);
  const subtotalC = mapped.reduce((acc, it) => acc + it.unit_price * it.qty, 0);
  const totalC    = subtotalC + shippingC + taxC;

  // Nombre/dirección válidos para billing y shipping (sin teléfono)
  const { name, addr } = buildNameAndAddress(customer);

  const payload: any = {
    merchant: {
      user_confirmation_url: merchantBase + '/affirm/confirm.html',
      user_cancel_url:       merchantBase + '/affirm/cancel.html',
      user_confirmation_url_action: 'GET',
      name: 'ONE WAY MOTORS',
    },
    // Enviamos ambos bloques; shipping = billing
    billing: { name, address: addr },
    shipping:{ name, address: addr },
    items: mapped,
    currency: 'USD',
    shipping_amount: shippingC,
    tax_amount: taxC,
    total: totalC,
    metadata: { mode: 'modal' },
  };

  // No mandamos phone_number para evitar rechazos; Affirm lo pide en el modal si hace falta.
  return payload;
}
