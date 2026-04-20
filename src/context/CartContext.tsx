import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
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

function normalizeItems(items: unknown): CartItem[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((it) => {
      const item = it as Partial<CartItem>;

      return {
        id: String(item.id ?? "").trim(),
        name: String(item.name ?? "").trim(),
        price: Number(item.price ?? 0),
        qty: Math.max(1, Math.trunc(Number(item.qty ?? 1))),
        sku: item.sku ? String(item.sku).trim() : undefined,
        image: item.image ? String(item.image).trim() : undefined,
        url: item.url ? String(item.url).trim() : undefined,
      };
    })
    .filter(
      (item) =>
        item.id.length > 0 &&
        item.name.length > 0 &&
        Number.isFinite(item.price) &&
        item.price > 0 &&
        Number.isFinite(item.qty) &&
        item.qty > 0
    );
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = safeParse<{ items?: unknown[] }>(localStorage.getItem(STORAGE_KEY), {});
      setItems(normalizeItems(saved.items));
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
    } catch {
      // ignore storage write failures
    }
  }, [items]);

  const addItem = (item: CartItem) => {
    const normalized = normalizeItems([item])[0];
    if (!normalized) return;

    setItems((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === normalized.id);

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          qty: next[existingIndex].qty + normalized.qty,
        };
        return next;
      }

      return [...prev, normalized];
    });

    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    const normalizedId = String(id).trim();
    setItems((prev) => prev.filter((item) => item.id !== normalizedId));
  };

  const setQty = (id: string, qty: number) => {
    const normalizedId = String(id).trim();
    const normalizedQty = Math.trunc(Number(qty));

    if (!normalizedId) return;

    if (!Number.isFinite(normalizedQty) || normalizedQty <= 0) {
      removeItem(normalizedId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === normalizedId ? { ...item, qty: normalizedQty } : item
      )
    );
  };

  const clear = () => setItems([]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const totalUSD = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [items]);

  const value = useMemo<CartContextType>(
    () => ({
      items,
      addItem,
      removeItem,
      setQty,
      clear,
      open,
      close,
      isOpen,
      totalUSD,
    }),
    [items, isOpen, totalUSD]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }

  return ctx;
};