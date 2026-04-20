// src/components/PayWithCard.tsx
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { startCardCheckout } from "../lib/cardCheckout";

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

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || items.length === 0}
        className="w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Redirecting to card payment..." : "Pay by card (credit/debit)"}
      </button>

      <p className="text-xs text-slate-500">
        Total: <span className="font-semibold">${totalUSD.toFixed(2)} USD</span>
      </p>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default PayWithCard;