// src/context/CartContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number; // USD
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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const idx = prev.findIndex(p => p.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + item.qty };
        return copy;
      }
      return [...prev, item];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(p => p.id !== id));
  const setQty = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setItems(prev => prev.map(p => (p.id === id ? { ...p, qty } : p)));
  };

  const clear = () => setItems([]);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const totalUSD = useMemo(
    () => items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0),
    [items]
  );

  const value: CartContextType = { items, addItem, removeItem, setQty, clear, open, close, isOpen, totalUSD };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
