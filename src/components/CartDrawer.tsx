// src/components/CartDrawer.tsx
import React from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import AffirmButton from './AffirmButton';
import { useI18n } from '../i18n/I18nProvider';

const CartDrawer: React.FC = () => {
  const { t, fmtMoney } = useI18n();
  const { items, isOpen, close, removeItem, setQty, totalUSD, clear } = useCart();

  const handleDec = (id: string, qty: number) => setQty(id, Math.max(1, qty - 1));
  const handleInc = (id: string, qty: number) => setQty(id, qty + 1);

  // url actual solo si estamos en el browser (evita warnings en SSR/build)
  const currentUrl =
    typeof window !== 'undefined' ? window.location.href : '/';

  return (
    <div
      className={`fixed inset-0 z-[10000] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={close}
      />

      {/* panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-black text-white border-l border-white/10 shadow-2xl transform transition-transform
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-label={t('cart.title')}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-xl font-black">{t('cart.title')}</h3>
          <button onClick={close} className="p-2 rounded hover:bg-white/10" aria-label={t('modal.close')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {items.length === 0 ? (
            <p className="text-white/70">{t('cart.empty')}</p>
          ) : (
            items.map(it => (
              <div key={it.id} className="flex gap-3 border border-white/10 rounded-lg p-3">
                <img
                  src={it.image || '/fallback.png'}
                  alt={it.name}
                  className="w-20 h-20 object-cover rounded"
                  onError={(e) => {
                    const timg = e.currentTarget as HTMLImageElement;
                    if (!timg.src.endsWith('/fallback.png')) timg.src = '/fallback.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold truncate">{it.name}</p>
                      <p className="text-sm text-white/70">{fmtMoney(Number(it.price))}</p>
                    </div>
                    <button
                      onClick={() => removeItem(it.id)}
                      className="p-2 rounded hover:bg-white/10"
                      title={t('cart.remove')}
                      aria-label={t('cart.remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleDec(it.id, it.qty)}
                      className="p-2 rounded bg-white/10 hover:bg-white/20"
                      aria-label={t('cart.minus')}
                      title={t('cart.minus')}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="px-3 py-1 rounded bg-white/10 font-bold">{it.qty}</span>

                    <button
                      onClick={() => handleInc(it.id, it.qty)}
                      className="p-2 rounded bg-white/10 hover:bg-white/20"
                      aria-label={t('cart.plus')}
                      title={t('cart.plus')}
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <span className="ml-auto font-bold">
                      {fmtMoney(Number(it.price) * Number(it.qty))}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/80">{t('cart.total')}</span>
            <span className="text-xl font-black">{fmtMoney(Number(totalUSD) || 0)}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clear}
              disabled={items.length === 0}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-bold disabled:opacity-50"
            >
              {t('cart.clear')}
            </button>

            {/* Affirm para TODO el carrito */}
            <div className="flex-1">
              {items.length > 0 && (Number(totalUSD) || 0) > 0 ? (
                <AffirmButton
                  cartItems={items.map(it => ({
                    name: it.name,
                    price: Number(it.price),
                    qty: Number(it.qty),
                    sku: String(it.sku || it.id),
                    url: String(it.url || currentUrl),
                    image: it.image,
                  }))}
                  totalUSD={Number(totalUSD)}
                />
              ) : (
                <button
                  disabled
                  className="w-full bg-white/10 text-white px-4 py-3 rounded-lg font-bold opacity-50 cursor-not-allowed"
                >
                  {t('cart.payWithAffirm')}
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CartDrawer;
