// src/components/PayWithAffirm.tsx
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { loadAffirm } from "../lib/affirm";

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

const FALLBACK_NAME = { first: "Online", last: "Customer" };

const FALLBACK_ADDR = {
  line1: "821 NE 79th St",
  city: "Miami",
  state: "FL",
  zipcode: "33138",
  country: "US",
};

export default function PayWithAffirm() {
  const { items, totalUSD } = useCart();
  const [opening, setOpening] = useState(false);

  const normalizeItems = () => {
    return items
      .map((it, i) => {
        const qty = Math.max(1, Math.trunc(Number(it.qty || 1)));
        const unit_price = toCents(it.price);

        const item: any = {
          display_name: String(it.name || `Item ${i + 1}`).slice(0, 120),
          sku: String(it.sku || it.id || `SKU-${i + 1}`)
            .replace(/\s+/g, "-")
            .slice(0, 64),
          unit_price,
          qty,
          item_url: toAbsUrl(it.url) || window.location.href,
        };

        const img = toAbsUrl(it.image);
        if (img) item.item_image_url = img;

        return item;
      })
      .filter((it) => it.display_name && it.unit_price > 0 && it.qty > 0);
  };

  async function openAffirm() {
    if (!items.length || !totalUSD || totalUSD <= 0) return;

    setOpening(true);

    try {
      const PUBLIC_KEY = import.meta.env.VITE_AFFIRM_PUBLIC_KEY || "";

      if (!PUBLIC_KEY) {
        console.error("[Affirm] Missing VITE_AFFIRM_PUBLIC_KEY");
        alert("Payment not available right now.");
        return;
      }

      await loadAffirm(PUBLIC_KEY);

      const affirm = (window as any).affirm;

      if (!affirm || typeof affirm.checkout !== "function") {
        console.error("[Affirm] SDK not ready");
        alert("Payment system not ready.");
        return;
      }

      const itemsNorm = normalizeItems();

      if (!itemsNorm.length) {
        console.error("[Affirm] No valid items");
        alert("Invalid cart data.");
        return;
      }

      const totalCents = itemsNorm.reduce(
        (acc, it) => acc + it.unit_price * it.qty,
        0
      );

      if (totalCents <= 0) {
        console.error("[Affirm] Invalid total");
        alert("Invalid total amount.");
        return;
      }

      const orderId = "ORDER-" + Date.now();

      const checkout: any = {
        merchant: {
          user_confirmation_url: `${window.location.origin}/affirm/confirm.html`,
          user_cancel_url: `${window.location.origin}/affirm/cancel.html`,
          user_confirmation_url_action: "GET",
          name: "ONE POINT MOTORS",
        },
        billing: { name: FALLBACK_NAME, address: FALLBACK_ADDR },
        shipping: { name: FALLBACK_NAME, address: FALLBACK_ADDR },
        items: itemsNorm,
        currency: "USD",
        shipping_amount: 0,
        tax_amount: 0,
        total: totalCents,
        order_id: orderId,
      };

      // Debug útil (no molesta en prod)
      console.group("[Affirm]");
      console.log("Total cents:", totalCents);
      console.log("Items:", itemsNorm);
      console.groupEnd();

      try {
        sessionStorage.setItem("affirm_order_id", orderId);
        sessionStorage.setItem("affirm_order_amount_cents", String(totalCents));
        sessionStorage.setItem("affirm_amount_cents", String(totalCents));
        sessionStorage.removeItem("affirm_captured_order_id");
      } catch {}

      affirm.checkout(checkout);

      affirm.checkout.open({
        onSuccess: (res: { checkout_token: string }) => {
          try {
            sessionStorage.setItem("affirm_checkout_token", res.checkout_token);

            window.location.href =
              `/affirm/confirm.html?checkout_token=` +
              encodeURIComponent(res.checkout_token);
          } catch (e) {
            console.warn("[Affirm] redirect error:", e);
          } finally {
            setOpening(false);
          }
        },

        onFail: (err: any) => {
          console.warn("[Affirm] failed:", err);
          alert("Financing not completed.");
          setOpening(false);
        },

        onValidationError: (err: any) => {
          console.warn("[Affirm] validation error:", err);
          alert("Invalid payment data.");
          setOpening(false);
        },

        onClose: () => {
          console.log("[Affirm] closed");
          setOpening(false);
        },
      });
    } catch (err) {
      console.error("[Affirm] Fatal error:", err);
      alert("Something went wrong with payment.");
      setOpening(false);
    }
  }

  return (
    <button
      type="button"
      onClick={openAffirm}
      disabled={opening || !items.length || totalUSD <= 0}
      className="w-full bg-white text-black px-4 py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-white/90"
    >
      {opening ? "Opening..." : "Pay with Affirm"}
    </button>
  );
}