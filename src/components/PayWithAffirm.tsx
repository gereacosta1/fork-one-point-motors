// src/components/PayWithAffirm.tsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { loadAffirm } from '../lib/affirm';

const toCents = (n: number) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.round(v * 100));
};

const toAbsUrl = (u?: string) => {
  if (!u) return undefined;
  try {
    return new URL(u, window.location.origin).toString();
  } catch {
    return undefined;
  }
};

const FALLBACK_NAME = { first: 'Online', last: 'Customer' };

// ✅ Nueva dirección
const FALLBACK_ADDR = {
  line1: '821 NE 79th St',
  city: 'Miami',
  state: 'FL',
  zipcode: '33138',
  country: 'US',
};

export default function PayWithAffirm() {
  const { items, totalUSD } = useCart();
  const [opening, setOpening] = useState(false);

  const normalizeItems = () => {
    return (items as any[])
      .map((it: any, i: number) => {
        const qty = Math.max(1, Math.trunc(Number(it.qty || 1)));
        const unit_price = toCents(Number(it.price || 0));

        const item: any = {
          display_name: String(it.name || `Item ${i + 1}`).slice(0, 120),
          sku: String(it.sku || it.id || `SKU-${i + 1}`).replace(/\s+/g, '-').slice(0, 64),
          unit_price,
          qty,
          item_url: toAbsUrl(it.url) || window.location.href,
        };

        const img = toAbsUrl(it.image);
        if (img) item.item_image_url = img;

        return item;
      })
      .filter((it: any) => it.display_name && it.unit_price > 0 && it.qty > 0);
  };

  async function openAffirm() {
    if (!items.length || !totalUSD || totalUSD <= 0) return;

    setOpening(true);
    try {
      const PUBLIC_KEY = import.meta.env.VITE_AFFIRM_PUBLIC_KEY || '';
      if (!PUBLIC_KEY) {
        console.error('[Affirm] Falta VITE_AFFIRM_PUBLIC_KEY');
        setOpening(false);
        return;
      }

      await loadAffirm(PUBLIC_KEY);

      const affirm = (window as any).affirm;
      if (!affirm?.checkout) {
        console.error('[Affirm] SDK no disponible');
        setOpening(false);
        return;
      }

      const itemsNorm = normalizeItems();

      // Total consistente con items
      const sumItemsCents = (arr: any[]) =>
        arr.reduce((acc: number, it: any) => acc + it.unit_price * it.qty, 0);

      const totalCents = sumItemsCents(itemsNorm);

      const orderId = 'ORDER-' + Date.now();

      const billing = { name: FALLBACK_NAME, address: FALLBACK_ADDR };
      const shipping = { name: FALLBACK_NAME, address: FALLBACK_ADDR };

      const checkout: any = {
        merchant: {
          user_confirmation_url: `${window.location.origin}/affirm/confirm.html`,
          user_cancel_url: `${window.location.origin}/affirm/cancel.html`,
          user_confirmation_url_action: 'GET',
          name: 'ONE POINT MOTORS',
        },
        billing,
        shipping,
        items: itemsNorm,
        currency: 'USD',
        shipping_amount: 0,
        tax_amount: 0,
        total: totalCents,
        order_id: orderId,
      };

      console.group('[Affirm][Checkout Debug]');
      console.log('sumItemsCents:', totalCents);
      console.table(
        itemsNorm.map((it: any) => ({
          name: it.display_name,
          sku: it.sku,
          unit_price: it.unit_price,
          qty: it.qty,
          item_url: it.item_url,
          item_image_url: it.item_image_url || '(none)',
        })),
      );
      console.log('billing:', billing);
      console.log('shipping:', shipping);
      console.groupEnd();

      try {
        sessionStorage.setItem('affirm_amount_cents', String(totalCents));
        sessionStorage.setItem('affirm_order_id', orderId);
      } catch {}

      affirm.checkout(checkout);
      affirm.checkout.open({
        onSuccess: async (res: { checkout_token: string }) => {
          try {
            const r = await fetch('/.netlify/functions/affirm-authorize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                checkout_token: res.checkout_token,
                order_id: orderId,
                amount_cents: totalCents,
                capture: true,
              }),
            });

            const data = await r.json().catch(() => ({}));
            console.log('[affirm-authorize] →', data);

            if (!r.ok) {
              alert('Affirm approved, but server returned an error. Check logs.');
            } else {
              alert('Request sent successfully.');
            }
          } catch (e) {
            console.warn('Backend confirm failed', e);
            alert('Affirm approved, but server confirmation failed.');
          } finally {
            setOpening(false);
          }
        },
        onFail: (err: any) => {
          console.warn('[Affirm] onFail:', err);
          setOpening(false);
          alert('Financing not completed.');
        },
        onValidationError: (err: any) => {
          console.warn('[Affirm] onValidationError:', err);
          setOpening(false);
          alert('Invalid data/amount for Affirm.');
        },
        onClose: () => {
          setOpening(false);
          console.log('[Affirm] closed by user');
        },
      });
    } catch (e) {
      console.error('Error opening Affirm', e);
      setOpening(false);
    }
  }

  return (
    <button
      onClick={openAffirm}
      disabled={opening || !items.length || !totalUSD || totalUSD <= 0}
      className="w-full bg-white text-black px-4 py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-white/90"
      type="button"
    >
      {opening ? 'Opening…' : 'Pay with Affirm'}
    </button>
  );
}
