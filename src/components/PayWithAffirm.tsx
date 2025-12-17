// src/components/PayWithAffirm.tsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { loadAffirm } from '../lib/affirm';

const toCents = (n: number) => Math.round(Number(n || 0) * 100);

const toAbsUrl = (u?: string) => {
  if (!u) return undefined;
  try {
    return new URL(u, window.location.origin).toString();
  } catch {
    return undefined;
  }
};

export default function PayWithAffirm() {
  const { items, totalUSD } = useCart();
  const [opening, setOpening] = useState(false);

  const normalizeItems = () => {
    const base = items.length ? items : [{ id: 'SMOKE', name: 'Item', price: 50, qty: 1 }];

    return base
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

        // ✅ Solo enviar si es absoluta y válida
        const img = toAbsUrl(it.image);
        if (img) item.item_image_url = img;

        return item;
      })
      // ✅ filtro extra por si algún item quedó inválido
      .filter((it: any) => it.display_name && it.unit_price > 0 && it.qty > 0);
  };

  async function openAffirm() {
    if (!items.length || !totalUSD || totalUSD <= 0) return;

    setOpening(true);
    try {
      const PUBLIC_KEY = import.meta.env.VITE_AFFIRM_PUBLIC_KEY || '';
      await loadAffirm(PUBLIC_KEY);

      const affirm = (window as any).affirm;
      if (!affirm?.checkout) {
        console.error('[Affirm] SDK no disponible');
        setOpening(false);
        return;
      }

      const itemsNorm = normalizeItems();

      // ✅ Total consistente (sum de items) para evitar 400 por mismatch
      const sumItemsCents = itemsNorm.reduce(
        (acc: number, it: any) => acc + (it.unit_price * it.qty),
        0
      );

      // Si querés confiar en totalUSD, podés loguear ambos:
      const totalFromState = toCents(totalUSD);
      const totalCents = sumItemsCents; // ← usamos el consistente con items

      const orderId = 'ORDER-' + Date.now();

      const checkout: any = {
        merchant: {
          user_confirmation_url: `${window.location.origin}/affirm/confirm`,
          user_cancel_url: `${window.location.origin}/affirm/cancel`,
          user_confirmation_url_action: 'GET',
          name: 'ONE POINT MOTORS',
        },
        items: itemsNorm,
        currency: 'USD',
        shipping_amount: 0,
        tax_amount: 0,
        total: totalCents,
        order_id: orderId,
        metadata: { source: 'onepointmotors.com', mode: 'modal' },
      };

      console.group('[Affirm][Checkout Debug]');
      console.log('totalUSD state cents:', totalFromState);
      console.log('sumItemsCents:', sumItemsCents);
      console.table(
        itemsNorm.map((it: any) => ({
          name: it.display_name,
          sku: it.sku,
          unit_price: it.unit_price,
          qty: it.qty,
          item_url: it.item_url,
          item_image_url: it.item_image_url || '(none)',
        }))
      );
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
              alert('Affirm OK, pero el servidor devolvió error. Revisar logs.');
            } else {
              alert('Solicitud enviada con éxito.');
            }
          } catch (e) {
            console.warn('Fallo al confirmar en el backend', e);
            alert('Se aprobó en Affirm, pero no pudimos confirmar en el servidor.');
          } finally {
            setOpening(false);
          }
        },
        onFail: (err: any) => {
          console.warn('[Affirm] onFail:', err);
          setOpening(false);
          alert('No se completó la financiación.');
        },
        onValidationError: (err: any) => {
          console.warn('[Affirm] onValidationError:', err);
          setOpening(false);
          alert('Datos/importe inválidos para Affirm.');
        },
        onClose: () => {
          setOpening(false);
          console.log('[Affirm] cerrado por el usuario');
        },
      });
    } catch (e) {
      console.error('Error al abrir Affirm', e);
      setOpening(false);
    }
  }

  return (
    <button
      onClick={openAffirm}
      disabled={opening || !items.length || !totalUSD}
      className="w-full bg-white text-black px-4 py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-white/90"
      type="button"
    >
      {opening ? 'Abriendo…' : 'Pay with Affirm'}
    </button>
  );
}
