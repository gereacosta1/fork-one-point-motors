// src/components/PayWithCard.tsx
import React, { useState } from "react";
import { CreditCard } from "lucide-react";
import { useCart } from "../context/CartContext";
import { startCardCheckout } from "../lib/cardCheckout";

const getFriendlyError = (message: string): string => {
  const text = message.toLowerCase();

  if (text.includes("missing stripe_secret_key")) {
    return "Stripe is not configured yet. Please try again later.";
  }

  if (
    text.includes("klarna") ||
    text.includes("afterpay") ||
    text.includes("afterpay_clearpay") ||
    text.includes("payment method")
  ) {
    return "This payment method is not available yet. Please try again later or contact us.";
  }

  if (text.includes("no_items") || text.includes("cart")) {
    return "Your cart is empty.";
  }

  if (text.includes("network") || text.includes("failed to fetch")) {
    return "Network error. Please check your connection and try again.";
  }

  return "An error occurred while starting the payment. Please try again.";
};

const PayWithCard: React.FC = () => {
  const { items, totalUSD } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      await startCardCheckout(items);
    } catch (err: unknown) {
      console.error("[Card Checkout]", err);

      const message =
        err instanceof Error
          ? err.message
          : "An error occurred while starting the payment.";

      setError(getFriendlyError(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || items.length === 0}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
      >
        <CreditCard className="h-4 w-4" />
        <span>
          {loading ? "Redirecting to checkout..." : "Pay with card"}
        </span>
      </button>

      <div className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-600">
        <p>
          Total:{" "}
          <span className="font-semibold text-slate-900">
            ${totalUSD.toFixed(2)} USD
          </span>
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Klarna and Afterpay may appear at checkout if available for this order.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default PayWithCard;