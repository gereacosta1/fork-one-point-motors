import React, { useState } from 'react';
import {
  Menu,
  X,
  ShoppingCart,
  ArrowUpRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import LangToggle from './LangToggle';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { open, items } = useCart();

  const count = items.reduce((s, i) => s + i.qty, 0);

  const links = [
    { id: 'inicio', label: 'Home' },
    { id: 'catalogo', label: 'Catalog' },
    { id: 'nosotros', label: 'About' },
    { id: 'contacto', label: 'Contact' },
  ];

  return (
    <header className="fixed top-0 z-50 w-full">
      {/* MAIN BAR */}
      <div className="border-b border-white/10 bg-black/55 backdrop-blur-2xl">
        <div className="container mx-auto flex items-center justify-between px-6 py-5">

          {/* LOGO */}
          <button
            onClick={() => onNavigate('inicio')}
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition group-hover:border-brand/40">
              <img
                src="/IMG/One_Way_Motors_Logo-1.png"
                alt="One Point Motors"
                className="h-8 w-8 object-contain"
              />
            </div>

            <div className="text-left">
              <span className="block text-lg font-black tracking-tight text-white md:text-xl">
                ONE POINT
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">
                MOTORS
              </span>
            </div>
          </button>

          {/* NAV DESKTOP */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-semibold">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => onNavigate(l.id)}
                className={`relative transition ${
                  activeSection === l.id
                    ? 'text-white'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {l.label}

                {/* underline minimal */}
                <span
                  className={`absolute -bottom-2 left-1/2 h-[2px] -translate-x-1/2 bg-brand transition-all duration-300 ${
                    activeSection === l.id
                      ? 'w-6 opacity-100'
                      : 'w-0 opacity-0'
                  }`}
                />
              </button>
            ))}
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-3 md:gap-4">

            {/* CART */}
            <button
              onClick={open}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <ShoppingCart className="h-5 w-5" />

              {count > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-white px-1.5 py-[2px] text-center text-[10px] font-black text-black">
                  {count}
                </span>
              )}
            </button>

            {/* LANG */}
            <div className="hidden md:block">
              <LangToggle />
            </div>

            {/* MOBILE BTN */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white transition hover:border-white/20 hover:bg-white/[0.06] md:hidden"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <div className="border-t border-white/8 bg-[#0d0e10]/95 px-6 pb-6 pt-4 backdrop-blur-2xl md:hidden">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/38">
                Navigation
              </span>
              <LangToggle />
            </div>

            <div className="space-y-2">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    onNavigate(l.id);
                    setIsOpen(false);
                  }}
                  className={`block w-full rounded-2xl border px-4 py-3 text-left text-base font-semibold transition ${
                    activeSection === l.id
                      ? 'border-white/18 bg-white/[0.06] text-white'
                      : 'border-white/8 bg-white/[0.02] text-white/75 hover:bg-white/[0.05]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                onNavigate('contacto');
                setIsOpen(false);
              }}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-black"
            >
              Financing
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;