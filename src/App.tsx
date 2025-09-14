import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import MotorcycleModal from './components/MotorcycleModal';
import { I18nProvider } from './i18n/I18nProvider';

// 🛒 carrito
import { CartProvider, useCart } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import { ShoppingCart } from 'lucide-react';

export interface Motorcycle {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  image: string;
  condition: 'Nueva' | 'Usada';
  engine: string;
  mileage?: number;
  featured?: boolean;
  description?: string;
  features?: string[];
}

// Botón flotante para abrir el carrito (usa open() y cuenta total de qty)
function CartFab() {
  const { open, items } = useCart();
  const count = items.reduce((sum, it) => sum + it.qty, 0);

  if (count <= 0) return null;

  return (
    <button
      onClick={open}
      className="fixed right-4 bottom-4 z-[9999] bg-brand-600 text-white rounded-full shadow-2xl px-5 py-3 flex items-center gap-2 hover:bg-brand-700"
      aria-label="Abrir carrito"
    >
      <ShoppingCart className="w-5 h-5" />
      <span className="font-black">{count}</span>
    </button>
  );
}

function AppInner() {
  const [activeSection, setActiveSection] = useState('inicio');
  const [selectedMotorcycle, setSelectedMotorcycle] = useState<Motorcycle | null>(null);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePhoneCall = () => window.open('tel:+1 (786) 253-0995', '_self');

  const handleWhatsApp = () => {
    const message = encodeURIComponent('¡Hola! Me interesa información sobre sus motocicletas. ¿Podrían ayudarme?');
    const whatsappUrl = `https://wa.me/+17862530995?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEmail = () => {
    window.open('mailto:onewaymotors2@gmail.com.mx?subject=Consulta sobre motocicletas', '_self');
  };

  return (
    <div className="min-h-screen bg-black">
      <Header activeSection={activeSection} onNavigate={scrollToSection} />
      <Hero onNavigate={scrollToSection} />

      <Catalog onViewDetails={setSelectedMotorcycle} />
      <About />
      <Contact onPhoneCall={handlePhoneCall} onWhatsApp={handleWhatsApp} onEmail={handleEmail} />
      <Footer />

      {selectedMotorcycle && (
        <MotorcycleModal
          motorcycle={selectedMotorcycle}
          onClose={() => setSelectedMotorcycle(null)}
          onPhoneCall={handlePhoneCall}
          onWhatsApp={handleWhatsApp}
        />
      )}

      {/* Botón flotante + Drawer del carrito */}
      <CartFab />
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <CartProvider>
        <AppInner />
      </CartProvider>
    </I18nProvider>
  );
}
