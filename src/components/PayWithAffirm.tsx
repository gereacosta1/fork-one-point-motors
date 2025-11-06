import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { loadAffirm } from '../lib/affirm';

const toCents = (n: number) => Math.round(Number(n) * 100);

export default function PayWithAffirm() {
  const { items, totalUSD } = useCart();
  const [opening, setOpening] = useState(false);

  // Normaliza ítems del carrito al formato Affirm
  const normalizeItems = () =>
    (items.length ? items : [{ id: 'SMOKE', name: 'Item', price: 50, qty: 1 }]).map((it, i) => ({
      display_name: String(it.name || `Item ${i + 1}`).slice(0, 120),
      sku: String(it.sku || it.id || `SKU-${i + 1}`).slice(0, 64),
      unit_price: toCents(it.price || 0),
      qty: Math.max(1, Number(it.qty || 1)),
      item_url: it.url || (typeof window !== 'undefined' ? window.location.href : '/'),
      item_image_url: it.image,
    }));

  async function openAffirm() {
    if (!totalUSD || totalUSD <= 0) return;
    setOpening(true);

    try {
      const PUBLIC_KEY = import.meta.env.VITE_AFFIRM_PUBLIC_KEY || '';
      await loadAffirm(PUBLIC_KEY); // fuerza CDN de prod

      const affirm = (window as any).affirm;
      if (!affirm?.checkout) {
        console.error('Affirm SDK no disponible');
        setOpening(false);
        return;
      }

      const itemsNorm = normalizeItems();
      const totalCents = toCents(totalUSD);
      const orderId = 'ORDER-' + Date.now();

      const checkout = {
        merchant: {
          user_confirmation_url: `${window.location.origin}/affirm/confirm`,
          user_cancel_url: `${window.location.origin}/affirm/cancel`,
          user_confirmation_url_action: 'GET',
          name: 'ONE POINT MOTORS',
        },
        // ⚠️ No enviamos billing/shipping para que Affirm pida y capture
        items: itemsNorm,
        currency: 'USD',
        shipping_amount: 0,
        tax_amount: 0,
        total: totalCents,
        order_id: orderId,
        metadata: { source: 'onepointmotors.com', mode: 'modal' },
      };

      // Guardamos por si se usa en /affirm/confirm
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
            alert('Solicitud enviada con éxito.'); // reemplaza por tu toast
          } catch (e) {
            console.warn('Fallo al confirmar en el backend', e);
            alert('Se aprobó en Affirm, pero no pudimos confirmar en el servidor.');
          } finally {
            setOpening(false);
          }
        },
        onFail: () => {
          setOpening(false);
          alert('No se completó la financiación.'); // reemplaza por toast
        },
        onValidationError: () => {
          setOpening(false);
          alert('Datos/importe inválidos para Affirm.');
        },
        onClose: () => {
          setOpening(false);
          console.log('Affirm cerrado por el usuario');
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
