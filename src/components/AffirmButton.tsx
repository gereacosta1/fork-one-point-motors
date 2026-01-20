import { useEffect, useMemo, useState, type ReactNode } from "react";
import { loadAffirm } from "../lib/affirm";

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

const MIN_TOTAL_CENTS = 5000; // $50

const toCents = (usd: unknown) => {
  const n = Number(usd);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n * 100));
};

const FALLBACK_NAME = { first: "Online", last: "Customer" };

// ✅ Nueva dirección
const FALLBACK_ADDR = {
  line1: "821 NE 79th St",
  city: "Miami",
  state: "FL",
  zipcode: "33138",
  country: "US",
};

const toAbsUrl = (u?: string) => {
  if (!u) return undefined;
  try {
    return new URL(u, window.location.origin).toString();
  } catch {
    return undefined;
  }
};

function Toast({
  show,
  type,
  message,
  onClose,
}: {
  show: boolean;
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
}) {
  if (!show) return null;
  const base =
    "fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold";
  const palette =
    type === "success"
      ? "bg-green-600/95 text-white border-green-400"
      : type === "error"
      ? "bg-red-600/95 text-white border-red-400"
      : "bg-black/90 text-white border-white/20";
  return (
    <div className={`${base} ${palette}`} role="status" onClick={onClose}>
      {message}
    </div>
  );
}

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
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[95%] max-w-md rounded-2xl bg-black/95 border border-brand/40 shadow-2xl p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-black text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition"
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="text-white/90 mb-6 leading-relaxed">{children}</div>

        <div className="flex items-center justify-end gap-3">
          {secondaryLabel ? (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition"
            >
              {secondaryLabel}
            </button>
          ) : null}

          {primaryLabel ? (
            <button
              onClick={onPrimary}
              className="px-4 py-2 rounded-lg bg-brand text-black font-black hover:bg-brand-hover transition"
            >
              {primaryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AffirmButton({ cartItems, totalUSD, shippingUSD = 0, taxUSD = 0 }: Props) {
  const PUBLIC_KEY = import.meta.env.VITE_AFFIRM_PUBLIC_KEY || "";

  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);

  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string }>({
    show: false,
    type: "info",
    message: "",
  });

  const showToast = (type: "success" | "error" | "info", message: string, ms = 2500) => {
    setToast({ show: true, type, message });
    window.setTimeout(() => setToast((s) => ({ ...s, show: false })), ms);
  };

  const [modal, setModal] = useState<{ open: boolean; title: string; body: string; retry?: boolean }>({
    open: false,
    title: "",
    body: "",
    retry: false,
  });

  const [lastCheckoutPayload, setLastCheckoutPayload] = useState<any>(null);
  const [lastTotalCents, setLastTotalCents] = useState<number>(0);

  useEffect(() => {
    if (!PUBLIC_KEY) {
      console.error("Falta VITE_AFFIRM_PUBLIC_KEY");
      return;
    }
    loadAffirm(PUBLIC_KEY)
      .then(() => setReady(true))
      .catch((e) => {
        console.error("loadAffirm error:", e);
        setReady(false);
      });
  }, [PUBLIC_KEY]);

  const normalizeItems = (itemsIn?: CartItem[]) => {
    if (!itemsIn?.length) {
      return [
        {
          display_name: "Smoke test item",
          sku: "SMOKE-001",
          unit_price: 2000,
          qty: 1,
          item_url: window.location.href,
        },
      ];
    }

    return itemsIn
      .map((it, idx) => {
        const display_name = (it.name || `Item ${idx + 1}`).toString().slice(0, 120);
        const unit_price = toCents(it.price); // cents ✅ consistente
        const qty = Math.max(1, Math.trunc(Number(it.qty) || 1));
        const sku = (it.sku ?? `SKU-${idx + 1}`).toString().replace(/\s+/g, "-").slice(0, 64);

        const item: any = {
          display_name,
          sku,
          unit_price,
          qty,
          item_url: toAbsUrl(it.url) || window.location.href,
        };

        const img = toAbsUrl(it.image);
        if (img) item.item_image_url = img;

        return item;
      })
      .filter(
        (x) =>
          x.display_name &&
          Number.isFinite(x.unit_price) &&
          x.unit_price > 0 &&
          Number.isFinite(x.qty) &&
          x.qty > 0
      );
  };

  const merchantBase = useMemo(() => window.location.origin, []);

  const getAffirmCallbacks = (orderId: string, totalCents: number) => ({
    onSuccess: async (res: { checkout_token: string }) => {
      try {
        // Guardamos para fallback (confirm.html) si Affirm redirige
        try {
          sessionStorage.setItem("affirm_order_id", orderId);
          sessionStorage.setItem("affirm_order_amount_cents", String(totalCents));
          sessionStorage.setItem("affirm_checkout_token", res.checkout_token);
        } catch {}

        const r = await fetch("/.netlify/functions/affirm-authorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            checkout_token: res.checkout_token,
            order_id: orderId,
            amount_cents: totalCents,
            capture: true,
          }),
        });

        const t = await r.text();
        let data: any;
        try {
          data = t ? JSON.parse(t) : null;
        } catch {
          data = { raw: t };
        }

        console.log("affirm-authorize →", { ok: r.ok, status: r.status, data });

        if (!r.ok || !data?.ok) {
          setModal({
            open: true,
            title: "Affirm aprobó, pero no se pudo cerrar el pago",
            body: "El cliente fue aprobado, pero el servidor devolvió error en authorize/capture. Revisá Netlify Functions logs.",
            retry: false,
          });
          return;
        }

        // Marcamos que ya capturó (para que confirm.html NO capture de nuevo)
        try {
          sessionStorage.setItem("affirm_captured_order_id", orderId);
        } catch {}

        showToast("success", "Listo: aprobado y cobrado.");

        // Limpieza
        try {
          sessionStorage.removeItem("affirm_checkout_token");
          // Dejamos order_id/amount por un ratito por si el usuario refresca confirm.html
          // y se limpia solo al final del confirm.html si entra.
        } catch {}
      } catch (e) {
        console.warn("Falló llamada a función:", e);
        setModal({
          open: true,
          title: "No pudimos confirmar el pago",
          body: "Hubo un problema al confirmar con el servidor. Intentá nuevamente.",
          retry: false,
        });
      } finally {
        setOpening(false);
      }
    },

    onFail: (err: any) => {
      console.warn("Affirm onFail", err);
      setOpening(false);
      setModal({
        open: true,
        title: "No se completó la financiación",
        body: "La solicitud no pudo completarse. Podés intentarlo de nuevo.",
        retry: true,
      });
    },

    onValidationError: (err: any) => {
      console.warn("Affirm onValidationError", err);
      setOpening(false);

      const fields = err?.fields && Array.isArray(err.fields) ? err.fields.join(", ") : null;

      setModal({
        open: true,
        title: "Datos inválidos para Affirm",
        body: fields ? `Affirm rechazó el payload. Missing fields: ${fields}` : "Revisá precio, total y datos mínimos requeridos.",
        retry: false,
      });
    },

    onClose: () => {
      setOpening(false);
      setModal({
        open: true,
        title: "Proceso cancelado",
        body: "No se realizó ningún cargo. Si querés, podés reintentar.",
        retry: true,
      });
    },
  });

  const handleRetry = () => {
    setModal({ open: false, title: "", body: "", retry: false });
    if (!lastCheckoutPayload) return;

    const affirm = (window as any).affirm;
    try {
      affirm.checkout(lastCheckoutPayload);
      affirm.checkout.open(getAffirmCallbacks(lastCheckoutPayload.order_id, lastTotalCents));
    } catch (e) {
      console.error("Reintento falló:", e);
      showToast("error", "No se pudo reintentar el pago.");
    }
  };

  const handleClick = () => {
    const affirm = (window as any).affirm;
    if (!affirm?.checkout) {
      showToast("error", "Affirm todavía no está listo.");
      return;
    }

    const items = normalizeItems(cartItems);
    const shippingCents = toCents(shippingUSD);
    const taxCents = toCents(taxUSD);

    const sumItems = items.reduce((acc: number, it: any) => acc + it.unit_price * it.qty, 0);

    const totalCentsFromProp = Number.isFinite(Number(totalUSD)) ? Math.round(Number(totalUSD) * 100) : NaN;

    const totalCents = Number.isFinite(totalCentsFromProp) ? totalCentsFromProp : sumItems + shippingCents + taxCents;

    if (!Number.isFinite(totalCents) || totalCents < MIN_TOTAL_CENTS) {
      setModal({
        open: true,
        title: "Importe no disponible para financiación",
        body: "El total es demasiado bajo para Affirm.",
        retry: false,
      });
      return;
    }

    const orderId = `ORDER-${Date.now()}`;

    // Guardamos lo mínimo para fallback
    try {
      sessionStorage.setItem("affirm_order_id", orderId);
      sessionStorage.setItem("affirm_order_amount_cents", String(totalCents));
      sessionStorage.removeItem("affirm_captured_order_id");
    } catch {}

    const billing = { name: FALLBACK_NAME, address: FALLBACK_ADDR };
    const shipping = { name: FALLBACK_NAME, address: FALLBACK_ADDR };

    const checkout: any = {
      merchant: {
        user_confirmation_url: `${merchantBase}/affirm/confirm.html`,
        user_cancel_url: `${merchantBase}/affirm/cancel.html`,
        user_confirmation_url_action: "GET",
        name: "ONE POINT MOTORS",
      },
      billing,
      shipping,
      items,
      currency: "USD",
      shipping_amount: shippingCents,
      tax_amount: taxCents,
      total: totalCents,
      order_id: orderId,
    };

    setLastCheckoutPayload(checkout);
    setLastTotalCents(totalCents);

    setOpening(true);

    try {
      affirm.checkout(checkout);
      affirm.checkout.open(getAffirmCallbacks(orderId, totalCents));
    } catch (e) {
      console.error("Error al abrir Affirm:", e);
      setOpening(false);
      showToast("error", "No se pudo abrir Affirm. Intentá nuevamente.");
    }
  };

  if (!ready) {
    return (
      <>
        <button disabled className="bg-black/60 text-white px-5 py-3 rounded-xl border border-white/10">
          Cargando Affirm…
        </button>

        <Toast
          show={toast.show}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast((s) => ({ ...s, show: false }))}
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
        className="bg-white text-black font-black px-5 py-3 rounded-xl text-lg
                   border-2 border-white shadow-md
                   hover:bg-brand hover:border-brand hover:text-black
                   transition-all duration-300
                   disabled:opacity-60
                   disabled:hover:bg-white disabled:hover:border-white disabled:hover:text-black"
      >
        {opening ? "Abriendo…" : "Pay with Affirm"}
      </button>

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((s) => ({ ...s, show: false }))}
      />

      <NiceModal
        open={modal.open}
        title={modal.title}
        onClose={() => setModal({ open: false, title: "", body: "" })}
        secondaryLabel="Cerrar"
        primaryLabel={modal.retry ? "Reintentar" : undefined}
        onPrimary={modal.retry ? handleRetry : undefined}
      >
        {modal.body}
      </NiceModal>
    </>
  );
}
