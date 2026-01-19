import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number; // USD (number)
  qty: number;
  sku?: string;
  image?: string;
  url?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  isOpen: boolean;
  totalUSD: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "opm_cart_v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizeItems(items: any): CartItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => ({
      id: String(it?.id ?? ""),
      name: String(it?.name ?? ""),
      price: Number(it?.price ?? 0),
      qty: Math.max(1, Math.trunc(Number(it?.qty ?? 1))),
      sku: it?.sku ? String(it.sku) : undefined,
      image: it?.image ? String(it.image) : undefined,
      url: it?.url ? String(it.url) : undefined,
    }))
    .filter((it) => it.id && it.name && Number.isFinite(it.price) && it.price > 0 && it.qty > 0);
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = safeParse<{ items?: any[] }>(localStorage.getItem(STORAGE_KEY), {});
    setItems(normalizeItems(saved.items));
  }, []);

  // Persist to localStorage
  useEffect(() => {
    const payload = { items };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [items]);

  const addItem = (item: CartItem) => {
    const incoming: CartItem = {
      ...item,
      id: String(item.id),
      name: String(item.name),
      price: Number(item.price),
      qty: Math.max(1, Math.trunc(Number(item.qty || 1))),
    };

    if (!incoming.id || !incoming.name || !Number.isFinite(incoming.price) || incoming.price <= 0) return;

    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === incoming.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + incoming.qty };
        return copy;
      }
      return [...prev, incoming];
    });

    setIsOpen(true);
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  const setQty = (id: string, qty: number) => {
    const q = Math.trunc(Number(qty));
    if (!Number.isFinite(q) || q <= 0) return removeItem(id);
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: q } : p)));
  };

  const clear = () => setItems([]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const totalUSD = useMemo(() => {
    return items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0);
  }, [items]);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    setQty,
    clear,
    open,
    close,
    isOpen,
    totalUSD,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
