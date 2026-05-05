import React from "react";
import { X, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useI18n } from "../i18n/I18nProvider";
import PayWithAffirm from "./PayWithAffirm";
import PayWithCard from "./PayWithCard";

const QUICK_ITEMS = [
  {
    id: "quick-ebike-black-4000",
    name: "E-Bike Fat Tire (Black)",
    price: 4000,
    image: "/IMG/onepoint-ebike-black-4000.jpeg",
  },
  {
    id: "quick-ebike-red-2800",
    name: "E-Bike (Red)",
    price: 2800,
    image: "/IMG/onepoint-ebike-red-2800.jpeg",
  },
  {
    id: "quick-scooter-rgb-500",
    name: "Electric Scooter (RGB)",
    price: 500,
    image: "/IMG/onepoint-scooter-rgb-500.jpeg",
  },
] as const;

const FALLBACK_IMAGE = "/IMG/fallback.png";

const CartDrawer: React.FC = () => {
  const { t, fmtMoney } = useI18n();

  const {
    items,
    isOpen,
    close,
    removeItem,
    setQty,
    totalUSD,
    clear,
    addItem,
    itemCount,
  } = useCart();

  const handleDec = (id: string, qty: number) => {
    setQty(id, Math.max(1, qty - 1));
  };

  const handleInc = (id: string, qty: number) => {
    setQty(id, qty + 1);
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;

    if (!img.src.includes("fallback")) {
      img.src = FALLBACK_IMAGE;
    }
  };

  const addQuick = (q: (typeof QUICK_ITEMS)[number]) => {
    addItem({
      id: q.id,
      name: q.name,
      price: q.price,
      qty: 1,
      image: q.image,
      imageUrl: q.image,
      sku: q.id,
      url: "/catalog",
    });
  };

  return (
    <div
      className={`fixed inset-0 z-[10000] ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#050505] text-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t("cart.title")}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <h3 className="text-xl font-black">{t("cart.title")}</h3>
            <p className="text-xs text-white/50">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            className="rounded-full p-2 transition hover:bg-white/10"
            aria-label={t("modal.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black">Quick Add</p>
                <p className="text-xs text-white/50">
                  Add popular products fast
                </p>
              </div>

              <ShoppingCart className="h-4 w-4 text-white/40" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {QUICK_ITEMS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => addQuick(q)}
                  className="flex min-w-[165px] items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-2 text-left transition hover:border-white/20 hover:bg-white/5"
                >
                  <img
                    src={q.image}
                    alt={q.name}
                    className="h-12 w-12 rounded-lg bg-white/5 object-cover"
                    onError={handleImageError}
                  />

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{q.name}</p>
                    <p className="text-xs text-white/70">{fmtMoney(q.price)}</p>
                    <p className="text-[11px] text-white/40">Add to cart</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
              <ShoppingCart className="mx-auto mb-3 h-8 w-8 text-white/30" />
              <p className="text-sm text-white/70">{t("cart.empty")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => {
                const image = it.image || it.imageUrl || FALLBACK_IMAGE;
                const lineTotal = it.price * it.qty;

                return (
                  <div
                    key={it.id}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <img
                      src={image}
                      alt={it.name}
                      className="h-20 w-20 rounded-xl bg-white/5 object-cover"
                      onError={handleImageError}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-bold">{it.name}</p>
                          <p className="text-sm text-white/70">
                            {fmtMoney(it.price)}
                          </p>

                          {it.sku && (
                            <p className="mt-0.5 truncate text-[11px] text-white/35">
                              SKU: {it.sku}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(it.id)}
                          className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                          aria-label={t("cart.remove")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDec(it.id, it.qty)}
                          disabled={it.qty <= 1}
                          className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <span className="min-w-9 rounded-lg bg-white/10 px-3 py-1 text-center font-bold">
                          {it.qty}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleInc(it.id, it.qty)}
                          className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>

                        <span className="ml-auto font-black">
                          {fmtMoney(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-white/10 bg-black/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">{t("cart.total")}</span>
            <span className="text-2xl font-black">{fmtMoney(totalUSD)}</span>
          </div>

          <div className="space-y-2">
            <PayWithAffirm />
            <PayWithCard />

            <button
              type="button"
              onClick={clear}
              disabled={items.length === 0}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("cart.clear")}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CartDrawer;