// src/components/PayWithCard.tsx
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { startCardCheckout } from "../lib/cardCheckout";

const PayWithCard: React.FC = () => {
  const { items, totalUSD } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      setError(null);

      if (!items.length) {
        setError("Your cart is empty.");
        return;
      }

      setLoading(true);
      await startCardCheckout(items);
      // Stripe hace el redirect
    } catch (e: any) {
      console.error(e);
      setError(
        e?.message || "An error occurred while starting the payment."
      );
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || !items.length}
        className="w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Redirecting to card payment…"
          : "Pay by card (credit/debit)"}
      </button>

      <p className="text-xs text-slate-500">
        Total:{" "}
        <span className="font-semibold">
          ${totalUSD.toFixed(2)} USD
        </span>
      </p>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default PayWithCard;
