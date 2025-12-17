// src/components/AffirmButton.tsx
import { useEffect, useState, type ReactNode } from 'react';
import { loadAffirm } from '../lib/affirm';

type CartItem = {
  name: string;
  sku?: string;
  price: number; // USD
  qty: number;
  url?: string;
  image?: string;
};

type Props = {
  cartItems?: CartItem[];
  totalUSD?: number;
  shippingUSD?: number;
  taxUSD?: number;
};

const MIN_TOTAL_CENTS = 5000; // $50 mínimo
const isFiniteNumber = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n);

/* ---------- Toast simple ---------- */
function Toast({
  show,
  type,
  message,
  onClose,
}: {
  show: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}) {
  if (!show) return null;
  const base =
    'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold';
  const palette =
    type === 'success'
      ? 'bg-green-600/95 text-white border-green-400'
      : type === 'error'
      ? 'bg-red-600/95 text-white border-red-400'
      : 'bg-black/90 text-white border-white/20';
  return (
    <div className={`${base} ${palette}`} role="status" onClick={onClose}>
      {message}
    </div>
  );
}

/* ---------- Modal básico ---------- */
function NiceModal({
  open,
  title,
  children,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95%] max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-black text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>
        <div className="text-gray-700 mb-6">{children}</div>
        <div className="flex items-center justify-end gap-3">
          {secondaryLabel ? (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {secondaryLabel}
            </button>
          ) : null}
          {primaryLabel ? (
            <button
              onClick={onPrimary}
              className="px-4 py-2 rounded-lg bg-black text-white font-bold hover:bg-gray-900"
            >
              {primaryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ---------- Botón Affirm (abre modal directo; Affirm pide nombre/apellido) ---------- */
export default function AffirmButton({
  cartItems,
  totalUSD,
  shippingUSD = 0,
  taxUSD = 0,
}: Props) {
  const PUBLIC_KEY = import.meta.env.VITE_AFFIRM_PUBLIC_KEY || '';

  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({ show: false, type: 'info', message: '' });

  const showToast = (type: 'success' | 'error' | 'info', message: string, ms = 2500) => {
    setToast({ show: true, type, message });
    window.setTimeout(() => setToast(s => ({ ...s, show: false })), ms);
  };

  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    body: string;
    retry?: boolean;
  }>({ open: false, title: '', body: '', retry: false });

  const [lastCheckoutPayload, setLastCheckoutPayload] = useState<any>(null);

  const handleRetry = () => {
    setModal({ open: false, title: '', body: '', retry: false });
    if (lastCheckoutPayload) {
      const affirm = (window as any).affirm;
      try {
        affirm.checkout(lastCheckoutPayload);
        affirm.checkout.open(
          getAffirmCallbacks(lastCheckoutPayload.order_id, lastCheckoutPayload.total),
        );
      } catch (e) {
        console.error('Reintento falló:', e);
        showToast('error', 'No se pudo reintentar el pago.');
      }
    }
  };

  useEffect(() => {
    if (!PUBLIC_KEY) {
      console.error('Falta VITE_AFFIRM_PUBLIC_KEY');
      return;
    }
    loadAffirm(PUBLIC_KEY).then(() => setReady(true)).catch(console.error);
  }, [PUBLIC_KEY]);

  // Normaliza items → payload Affirm (sin datos de buyer; Affirm los pedirá)
  const normalizeItems = (itemsIn?: CartItem[]): any[] => {
    if (!itemsIn?.length) {
      return [
        {
          display_name: 'Smoke test item',
          sku: 'SMOKE-001',
          unit_price: 2000,
          qty: 1,
          item_url: window.location.href,
        },
      ];
    }
    return itemsIn.map((it, idx) => {
      const name = (it.name || `Item ${idx + 1}`).toString().slice(0, 120);
      const unit_price = Math.round(Number(it.price) * 100);
      const qty = Math.max(1, Number(it.qty) || 1);
      const sku = (it.sku ?? `SKU-${idx + 1}`).toString().replace(/\s+/g, '-').slice(0, 64);
      const toAbsUrl = (u?: string) => {
        if (!u) return undefined;
        try { return new URL(u, window.location.origin).toString(); }
        catch { return undefined; }
      };

      return {
        display_name: name,
        sku,
        unit_price,
        qty: Math.trunc(qty),                 // qty int
        item_url: toAbsUrl(it.url) || window.location.href,
        item_image_url: toAbsUrl(it.image),   // ✅ nombre correcto en Affirm
      };

    });
  };

  const getAffirmCallbacks = (orderId: string, totalCents: number) => ({
    onSuccess: async (res: { checkout_token: string }) => {
      try {
        const r = await fetch('/api/affirm-authorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkout_token: res.checkout_token,
            order_id: orderId,
            amount_cents: totalCents,
            capture: true,
          }),
        });
        const data = await r.json();
        console.log('affirm-authorize →', data);
        showToast('success', '¡Solicitud enviada con éxito!');
      } catch (e) {
        console.warn('Falló llamada a función:', e);
        setModal({
          open: true,
          title: 'No pudimos confirmar tu solicitud',
          body:
            'Tuvimos un problema al confirmar con nuestro servidor. Intentá nuevamente en unos segundos.',
          retry: true,
        });
      } finally {
        setOpening(false);
      }
    },
    onFail: (err: unknown) => {
      console.warn('Affirm onFail', err);
      setOpening(false);
      setModal({
        open: true,
        title: 'No se completó la financiación',
        body: 'Tu solicitud no pudo completarse. Podés intentarlo de nuevo.',
        retry: true,
      });
    },
    onValidationError: (err: unknown) => {
      console.warn('Affirm onValidationError', err);
      setOpening(false);
      setModal({
        open: true,
        title: 'Datos inválidos',
        body: 'Revisá el precio y el total del producto.',
        retry: false,
      });
    },
    onClose: () => {
      console.log('Affirm modal cerrado por el usuario.');
      setOpening(false);
      setModal({
        open: true,
        title: 'Proceso cancelado',
        body: 'No se realizó ningún cargo. ¿Querés intentarlo de nuevo?',
        retry: true,
      });
    },
  });

  const handleClick = () => {
    const affirm = (window as any).affirm;
    if (!affirm?.checkout) {
      console.error('Affirm no está listo');
      return;
    }

    // 1) Items y costos en centavos
    const items = normalizeItems(cartItems);
    const shippingCents = Math.round((Number(shippingUSD) || 0) * 100);
    const taxCents = Math.round((Number(taxUSD) || 0) * 100);

    // Validación de items
    const invalids = items.filter(
      it =>
        !it.display_name ||
        !isFiniteNumber(it.unit_price) ||
        it.unit_price <= 0 ||
        !isFiniteNumber(it.qty) ||
        it.qty <= 0,
    );
    if (invalids.length) {
      console.warn('Items inválidos para Affirm:', invalids, { items });
      showToast('error', 'Precio o cantidad inválidos. Revisá el producto.');
      return;
    }

    // 2) Total en centavos
    const sumItems = items.reduce((acc, it) => acc + it.unit_price * it.qty, 0);
    const totalCentsFromProp = isFiniteNumber(totalUSD) ? Math.round(totalUSD * 100) : NaN;
    const totalCents = isFiniteNumber(totalCentsFromProp)
      ? totalCentsFromProp
      : sumItems + shippingCents + taxCents;

    if (!isFiniteNumber(totalCents) || totalCents < MIN_TOTAL_CENTS) {
      setModal({
        open: true,
        title: 'Importe no disponible para financiación',
        body: 'El total es demasiado bajo para Affirm.',
        retry: false,
      });
      return;
    }

    const orderId = 'ORDER-' + Date.now();

    // 3) Payload SIN billing/shipping/customer → Affirm pedirá nombre/apellido
    const checkout: any = {
  merchant: {
    user_confirmation_url: `${window.location.origin}/affirm/confirm`,
    user_cancel_url: `${window.location.origin}/affirm/cancel`,
    user_confirmation_url_action: 'GET',
    name: 'ONE POINT MOTORS',
  },
  billing: {
    name: { first: 'Online', last: 'Customer' },
    address: {
      line1: '297 NW 54th St',
      city: 'Miami',
      state: 'FL',
      zipcode: '33127',
      country: 'US',
    },
  },
  shipping: {
    name: { first: 'Online', last: 'Customer' },
    address: {
      line1: '297 NW 54th St',
      city: 'Miami',
      state: 'FL',
      zipcode: '33127',
      country: 'US',
    },
  },
  items,
  currency: 'USD',
  shipping_amount: shippingCents,
  tax_amount: taxCents,
  total: totalCents,
  order_id: orderId,
  metadata: { mode: 'modal' },
};


    console.group('[Affirm][CHECK]');
    console.table(
      items.map((it: any) => ({
        display_name: it.display_name,
        sku: it.sku,
        unit_price_cents: it.unit_price,
        qty: it.qty,
      })),
    );
    console.log('shipping_cents:', shippingCents, 'tax_cents:', taxCents, 'TOTAL:', totalCents);
    console.groupEnd();

    try {
      sessionStorage.setItem('affirm_amount_cents', String(totalCents));
      sessionStorage.setItem('affirm_order_id', orderId);
    } catch {}

    setLastCheckoutPayload({ ...checkout });
    setOpening(true);

    try {
      affirm.checkout(checkout);
      affirm.checkout.open(getAffirmCallbacks(orderId, totalCents));
    } catch (e) {
      console.error('Error al abrir Affirm:', e);
      setOpening(false);
      showToast('error', 'No se pudo abrir Affirm. Intentá nuevamente.');
    }
  };

  if (!ready) {
    return (
      <>
        <button disabled className="bg-gray-600 text-white px-4 py-2 rounded-md">
          Cargando Affirm…
        </button>
        <Toast
          show={toast.show}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(s => ({ ...s, show: false }))}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={opening}
        className="bg-black text-white font-bold px-5 py-3 rounded-xl text-lg 
               border-2 border-white shadow-md 
               hover:bg-neutral-900 hover:border-green-500 hover:scale-105 
               transition-all duration-300"
      >
        {opening ? 'Abriendo…' : 'Pay with Affirm'}
      </button>

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast(s => ({ ...s, show: false }))}
      />

      <NiceModal
        open={modal.open}
        title={modal.title}
        onClose={() => setModal({ open: false, title: '', body: '' })}
        secondaryLabel="Cerrar"
        primaryLabel={modal.retry ? 'Reintentar' : undefined}
        onPrimary={modal.retry ? handleRetry : undefined}
      >
        {modal.body}
      </NiceModal>
    </>
  );
}
