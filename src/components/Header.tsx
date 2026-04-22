import React, { useState } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
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
    <header className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-6 py-5 flex justify-between items-center">

        {/* LOGO */}
        <button onClick={() => onNavigate('inicio')} className="flex items-center gap-3">
          <img src="/IMG/One_Way_Motors_Logo-1.png" className="w-10 h-10" />
          <span className="font-black text-xl tracking-tight">
            ONE POINT MOTORS
          </span>
        </button>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-10 text-sm font-semibold">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => onNavigate(l.id)}
              className={`transition ${
                activeSection === l.id
                  ? "text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          <button onClick={open} className="relative">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-white text-black px-1.5 rounded-full font-bold">
                {count}
              </span>
            )}
          </button>

          <LangToggle />

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE */}
      {isOpen && (
        <div className="md:hidden px-6 pb-6">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => {
                onNavigate(l.id);
                setIsOpen(false);
              }}
              className="block w-full text-left py-3 text-lg text-white/80"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;