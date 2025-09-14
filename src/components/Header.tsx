import React, { useState } from 'react';
import { Menu, X, Phone, MapPin, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

import LangToggle from './LangToggle';
import { useI18n } from '../i18n/I18nProvider';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate }) => {
  const { t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { open, items } = useCart();
  const cartCount = items.reduce((sum, it) => sum + it.qty, 0);

  // IDs de sección iguales a tus anchors; keys de i18n para el label
  const menuItems: { id: string; labelKey: keyof (typeof import('../i18n/dict.es').default) }[] = [
    { id: 'inicio', labelKey: 'nav.home' },
    { id: 'catalogo', labelKey: 'nav.catalog' },
    { id: 'nosotros', labelKey: 'nav.about' },
    { id: 'contacto', labelKey: 'nav.contact' },
  ];

  const handlePhoneCall = () => window.open('tel:+17862530995', '_self');
  const handleLogoClick = () => onNavigate('inicio');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/85 backdrop-blur-md border-b border-brand-600">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
          >
            <div className="bg-brand-600 p-2 rounded-lg">
              <img
                src="/IMG/One_Way_Motors_Logo-1.png"  // coloca tu nuevo logo cuando lo tengas
                alt="SUNRISE STORE"
                className="w-10 h-10 object-contain rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">SUNRISE STORE</h1>
              <p className="text-sm text-brand-300 font-medium">{t('footer.tagline')}</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-lg font-bold transition-all duration-300 hover:text-brand-300 hover:scale-105 ${
                  activeSection === item.id ? 'text-brand-400 border-b-2 border-brand-400' : 'text-white'
                }`}
              >
                {t(item.labelKey)}
              </button>
            ))}

            {/* Botón Carrito (desktop) */}
            <button
              onClick={open}
              className="relative flex items-center gap-2 text-white hover:text-brand-300 transition-colors"
              aria-label={t('nav.cart')}
              title={t('nav.cart')}
            >
              <ShoppingCart className="w-5 h-5 text-brand-400" />
              <span className="text-lg font-semibold">{t('nav.cart')}</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-brand-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Toggle idioma (desktop) */}
            <LangToggle />
          </nav>

          {/* Contact + Info - Desktop */}
          <div className="hidden lg:flex items-center space-x-6 text-white">
            <button
              onClick={handlePhoneCall}
              className="flex items-center space-x-2 hover:text-brand-300 transition-colors duration-300"
            >
              <Phone className="w-4 h-4 text-brand-400" />
              <span className="text-lg font-semibold">+1(786)2530995</span>
            </button>
            <button
              onClick={() => onNavigate('contacto')}
              className="flex items-center space-x-2 hover:text-brand-300 transition-colors duration-300"
            >
              <MapPin className="w-4 h-4 text-brand-400" />
              <span className="text-lg font-semibold">MIAMI</span>
            </button>
          </div>

          {/* Mobile Buttons */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Carrito (mobile) */}
            <button
              onClick={open}
              className="relative text-white hover:text-brand-300 transition-colors"
              aria-label={t('nav.cart')}
              title={t('nav.cart')}
            >
              <ShoppingCart className="w-6 h-6 text-brand-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-brand-600 text-white text-[10px] font-bold rounded-full px-1.5 py-[2px]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Llamar (mobile) */}
            <button
              onClick={handlePhoneCall}
              className="flex items-center space-x-2 text-white hover:text-brand-300 transition-colors duration-300"
            >
              <Phone className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-semibold">{t('contact.call')}</span>
            </button>

            {/* Toggle idioma (mobile) */}
            <LangToggle />

            {/* Menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white hover:text-brand-300 transition-colors"
              aria-label="Abrir menú"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-brand-600">
            <nav className="flex flex-col space-y-2 pt-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`text-left py-3 px-4 text-lg font-bold transition-colors duration-200 hover:text-brand-300 hover:bg-brand-600/20 rounded ${
                    activeSection === item.id ? 'text-brand-400 bg-brand-600/20' : 'text-white'
                  }`}
                >
                  {t(item.labelKey)}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
