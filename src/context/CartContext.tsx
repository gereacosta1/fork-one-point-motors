import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  sku?: string;
  image?: string;
  imageUrl?: string;
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
  itemCount: number;
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

const toNumber = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const toQty = (value: unknown): number => {
  const num = Math.trunc(toNumber(value));
  return Number.isFinite(num) && num > 0 ? num : 1;
};

const cleanText = (value: unknown): string | undefined => {
  const text = String(value || "").trim();
  return text.length > 0 ? text : undefined;
};

function normalizeItems(items: unknown): CartItem[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((it) => {
      const item = it as Partial<CartItem>;

      const id = cleanText(item.id);
      const name = cleanText(item.name);
      const price = toNumber(item.price);
      const qty = toQty(item.qty);
      const sku = cleanText(item.sku);
      const image = cleanText(item.image);
      const imageUrl = cleanText(item.imageUrl);
      const url = cleanText(item.url);

      if (!id || !name || price <= 0) {
        return null;
      }

      return {
        id,
        name,
        price,
        qty,
        ...(sku ? { sku } : {}),
        ...(image ? { image } : {}),
        ...(imageUrl ? { imageUrl } : {}),
        ...(url ? { url } : {}),
      };
    })
    .filter((item): item is CartItem => Boolean(item));
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);

  useEffect(() => {
    try {
      const saved = safeParse<{ items?: unknown[] }>(
        localStorage.getItem(STORAGE_KEY),
        {}
      );

      setItems(normalizeItems(saved.items));
    } catch {
      setItems([]);
    } finally {
      setHasLoadedCart(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedCart) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
    } catch {
      // Ignore storage write failures.
    }
  }, [items, hasLoadedCart]);

  const addItem = (item: CartItem) => {
    const normalized = normalizeItems([item])[0];

    if (!normalized) return;

    setItems((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === normalized.id);

      if (existingIndex >= 0) {
        const next = [...prev];

        next[existingIndex] = {
          ...next[existingIndex],
          ...normalized,
          qty: next[existingIndex].qty + normalized.qty,
        };

        return next;
      }

      return [...prev, normalized];
    });

    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    const normalizedId = String(id || "").trim();

    if (!normalizedId) return;

    setItems((prev) => prev.filter((item) => item.id !== normalizedId));
  };

  const setQty = (id: string, qty: number) => {
    const normalizedId = String(id || "").trim();
    const normalizedQty = Math.trunc(Number(qty));

    if (!normalizedId) return;

    if (!Number.isFinite(normalizedQty) || normalizedQty <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== normalizedId));
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === normalizedId ? { ...item, qty: normalizedQty } : item
      )
    );
  };

  const clear = () => {
    setItems([]);
  };

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const totalUSD = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.qty, 0);
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
      itemCount,
    }),
    [items, isOpen, totalUSD, itemCount]
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