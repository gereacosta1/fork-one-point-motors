// src/components/Catalog.tsx
import React, { useMemo, useState } from 'react';
import { Heart, Eye, Fuel, Gauge, Calendar } from 'lucide-react';
import { Motorcycle } from '../App';
import AffirmButton from './AffirmButton';
import UnderlineGrow from "./UnderlineGrow";

import { useCart } from '../context/CartContext';
import { useI18n } from '../i18n/I18nProvider';

interface CatalogProps {
  onViewDetails: (motorcycle: Motorcycle) => void;
}

/** Toast simple para reemplazar alert() de "Ver más motos" */
function SimpleToast({
  show, text, onClose,
}: { show: boolean; text: string; onClose: () => void }) {
  if (!show) return null;
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/90 text-white border border-white/20 px-4 py-3 rounded-xl shadow-2xl z-[9999] text-sm font-semibold"
      onClick={onClose}
      role="status"
    >
      {text}
    </div>
  );
}

// --- Botón reutilizable con estilos coherentes ---
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  compact?: boolean;
};

const Btn: React.FC<BtnProps> = ({
  variant = "primary",
  compact = true,
  className = "",
  children,
  ...props
}) => {
  const base =
    "w-full inline-flex items-center justify-center gap-2 rounded-xl font-extrabold " +
    "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 " +
    "disabled:opacity-60 disabled:cursor-not-allowed";
  const size = compact ? "px-3 py-2 text-sm" : "px-5 py-3 text-lg";
  const variants = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-700 shadow-lg hover:shadow-brand-500/30 active:scale-[.99]",
    secondary:
      "bg-black text-white border border-white/15 hover:bg-black/90 shadow-lg active:scale-[.99]",
    ghost:
      "bg-transparent text-white/90 border border-white/20 hover:text-white hover:border-white/40",
  } as const;

  return (
    <button className={`${base} ${size} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

/** 🔁 Mapeo: texto ES del array -> clave i18n */
const FEATURE_KEY_BY_ES: Record<string, string> = {
  "Motor eléctrico": "feature.motor",
  "Ligero y ágil": "feature.lightAgile",
  "Batería de alta capacidad": "feature.batteryHigh",
  "Motor eléctrico de alta potencia": "feature.motorHighPower",
  "Pantalla táctil": "feature.touchscreen",
  "Conectividad Bluetooth": "feature.bluetooth",
  "Sistema de navegación GPS": "feature.gps",
  "High-capacity battery": "feature.batteryHigh",
  "Light & agile": "feature.lightAgile",
  "Electric motor": "feature.motor",
};

/** ✅ Traducción robusta de features */
const translateFeature = (
  t: (k: string) => string,
  productId: number,
  featureTextES: string,
  idx: number
) => {
  const keyById = `product.${productId}.feature.${idx}`;
  const v1 = t(keyById);
  if (v1 !== keyById) return v1;

  const genericKey = FEATURE_KEY_BY_ES[featureTextES];
  if (genericKey) {
    const v2 = t(genericKey);
    if (v2 !== genericKey) return v2;
  }

  return featureTextES;
};

const Catalog: React.FC<CatalogProps> = ({ onViewDetails }) => {
  const { t, fmtMoney } = useI18n();

  const [filter, setFilter] = useState<'all' | 'nueva'>('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [toast, setToast] = useState<{ show: boolean; text: string }>({ show: false, text: '' });

  const showToast = (text: string, ms = 2500) => {
    setToast({ show: true, text });
    window.setTimeout(() => setToast({ show: false, text: '' }), ms);
  };

  const { addItem, open } = useCart();

  // 🔄 Catálogo (incluye items "Deposit/Invoice" si los querés dentro del catálogo normal)
  const motorcycles: Motorcycle[] = [
    // --- Deposits / Invoice (los 3 de tu WhatsApp + tus imágenes nuevas)
    {
      id: 9001,
      name: "E-Bike Fat Tire (Black) — Deposit",
      brand: "One Point",
      model: "Invoice / Deposit",
      year: 2025,
      price: 4000,
      image: "/IMG/onepoint-ebike-black-4000.jpeg",
      condition: "Nueva",
      engine: "Electric",
      featured: true,
      description: "Deposit / invoice payment item. Financing available.",
      features: ["Electric motor", "High-capacity battery", "Light & agile"],
    },
    {
      id: 9002,
      name: "E-Bike (Red) — Deposit",
      brand: "One Point",
      model: "Invoice / Deposit",
      year: 2025,
      price: 2800,
      image: "/IMG/onepoint-ebike-red-2800.jpeg",
      condition: "Nueva",
      engine: "Electric",
      featured: true,
      description: "Deposit / invoice payment item. Financing available.",
      features: ["Electric motor", "Light & agile", "High-capacity battery"],
    },
    {
      id: 9003,
      name: "Electric Scooter (RGB) — Deposit",
      brand: "One Point",
      model: "Invoice / Deposit",
      year: 2025,
      price: 500,
      image: "/IMG/onepoint-scooter-rgb-500.jpeg",
      condition: "Nueva",
      engine: "Electric",
      featured: true,
      description: "Deposit / invoice payment item. Financing available.",
      features: ["Electric motor", "Light & agile"],
    },

    // --- Tus productos normales
    {
      id: 5001,
      name: "Electric Cargo Tricycle",
      brand: "MZ",
      model: "E-Cargo",
      year: 2025,
      price: 5000,
      image: "/IMG/triciclo-rojo.jpeg",
      condition: "Nueva",
      engine: "Electric",
      featured: true,
      description:
        "Robust electric cargo tricycle ideal for deliveries and utility tasks. Durable chassis, large rear cargo bed, weather canopy and comfortable seating. Financing available.",
      features: ["Motor eléctrico", "Ligero y ágil", "Batería de alta capacidad"],
      gallery: ["/IMG/triciclo-rojo.jpeg", "/IMG/triciclo-rojo2.jpeg", "/IMG/triciclo-rojo3.jpeg"]
    },
    {
      id: 5,
      name: "Electric Scooter",
      brand: "Scooter",
      model: "Electric Scooter",
      year: 2025,
      price: 1500,
      image: "/IMG/Scooter-electrico(1).jpeg",
      condition: "Nueva",
      engine: "Electric",
      description:
        "Italian excellence in an electric scooter. Power, style and exclusivity in one vehicle.",
      features: ["Motor eléctrico", "Ligero y ágil", "Batería de alta capacidad"]
    },
    {
      id: 8,
      name: "Electric Scooter 2025",
      brand: "Master Sonic",
      model: "Electric Scooter",
      year: 2025,
      price: 1750,
      image: "/IMG/ELECTRIC SCOOTER.jpeg",
      condition: "Nueva",
      engine: "Electric",
      description:
        "Compact, efficient and comfortable for everyday urban mobility.",
      features: ["Motor eléctrico", "Ligero y ágil", "Batería de alta capacidad"]
    },
    {
      id: 11,
      name: "Electric Bike Pro",
      brand: "E-Bike",
      model: "EBike Pro 2025",
      year: 2025,
      price: 1000,
      image: "/IMG/electricBike2.jpeg",
      condition: "Nueva",
      engine: "Electric",
      featured: true,
      description: "High-performance e-bike, ideal for city and long rides.",
      features: ["Motor eléctrico", "Batería de alta capacidad", "Tablero digital"]
    },
    {
      id: 12,
      name: "Urban Electric Bike",
      brand: "E-Bike",
      model: "Scooter Urban 2025",
      year: 2025,
      price: 1000,
      image: "/IMG/electricBike3.jpeg",
      condition: "Nueva",
      engine: "Electric",
      featured: true,
      description: "Urban electric bike, comfortable and efficient for daily use.",
      features: ["Motor eléctrico", "Ligero y ágil", "Batería de alta capacidad"]
    },
    {
      id: 16,
      name: "Premium Electric Bicycle",
      brand: "Universal",
      model: "Scooter Premium 2025",
      year: 2025,
      price: 3500,
      image: "/IMG/bici-electric-negra.jpeg",
      condition: "Nueva",
      engine: "Electric",
      featured: true,
      description:
        "Premium electric bicycle, ideal for long trips and comfortable commuting.",
      features: ["Motor eléctrico", "Batería de alta capacidad", "Diseño ergonómico"]
    },
    {
      id: 17,
      name: "Amazta Electric Scooter",
      brand: "Amazta",
      model: "Amazta 2025",
      year: 2025,
      price: 2500,
      image: "/IMG/scooter-azul-oscuro.jpeg",
      condition: "Nueva",
      engine: "Electric",
      featured: true,
      description:
        "Perfect blend of style and technology. Ideal for urban commuting.",
      features: ["Motor eléctrico", "Diseño moderno", "Batería de larga duración"]
    },
    {
      id: 18,
      name: "Movelito Electric Scooter",
      brand: "Movelito",
      model: "Movelito 2025",
      year: 2025,
      price: 1850,
      image: "/IMG/scooter-azul.jpeg",
      condition: "Nueva",
      engine: "Electric",
      featured: true,
      description:
        "Compact and efficient scooter. Perfect for the city with an attractive design.",
      features: ["Motor eléctrico", "Ligero y ágil", "Batería de alta capacity"]
    },
    {
      id: 19,
      name: "Galaxy Premium Electric Scooter",
      brand: "Galaxy",
      model: "Premium 2025",
      year: 2025,
      price: 2000,
      image: "/IMG/scooter-rojo.jpeg",
      condition: "Nueva",
      engine: "Electric",
      featured: true,
      description:
        "Latest innovation in urban mobility with futuristic design and advanced tech.",
      features: [
        "Motor eléctrico de alta potencia",
        "Pantalla táctil",
        "Conectividad Bluetooth",
        "Sistema de navegación GPS"
      ]
    }
  ];

  const onlyElectric = useMemo(
    () => motorcycles.filter(m => (m.engine && m.engine.toLowerCase() === 'electric')),
    [motorcycles]
  );

  const filteredMotorcycles = useMemo(() => {
    return onlyElectric.filter(moto => {
      if (filter === 'all') return true;
      return moto.condition.toLowerCase() === filter;
    });
  }, [onlyElectric, filter]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(favId => favId !== id)
        : [...prev, id]
    );
  };

  return (
    <section id="catalogo" className="py-16 md:py-20 bg-black">
      <div className="container mx-auto px-4 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
            <UnderlineGrow>{t('catalog.title')}</UnderlineGrow>
          </h2>
          <p className="text-white/90 text-lg md:text-2xl max-w-3xl mx-auto font-bold">
            {t('catalog.subtitle')}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-8">
          <div className="bg-brand-600/90 backdrop-blur-md border border-brand-600/50 rounded-xl p-2 flex space-x-2 shadow-2xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg text-base md:text-lg font-black transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-black/90 text-white shadow-lg'
                  : 'text-white hover:bg-black/30'
              }`}
            >
              {t('catalog.filter.all')}
            </button>
            <button
              onClick={() => setFilter('nueva')}
              className={`px-6 py-2 rounded-lg text-base md:text-lg font-black transition-all duration-200 ${
                filter === 'nueva'
                  ? 'bg-black/90 text-white shadow-lg'
                  : 'text-white hover:bg-black/30'
              }`}
            >
              {t('catalog.filter.new')}
            </button>
          </div>
        </div>

        {/* Grid: más compacto + más columnas en pantallas grandes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMotorcycles.map((moto) => {
            const condLabel = moto.condition === 'Nueva'
              ? t('product.condition.new')
              : t('product.condition.used');

            const priceNum = Number(moto.price);
            const isPriceValid = Number.isFinite(priceNum) && priceNum > 0;

            const features = moto.features || [];
            const shownFeatures = features.slice(0, 3);
            const extraCount = Math.max(0, features.length - shownFeatures.length);

            return (
              <div
                key={moto.id}
                className="bg-brand-600/95 backdrop-blur-md border border-brand-600/30 rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 hover:shadow-brand-500/30"
              >
                {/* Imagen: más protagonista, sin recortes agresivos */}
                <div className="relative bg-white">
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={moto.image || '/fallback.png'}
                      alt={moto.name || t('image.altFallback')}
                      className="w-full h-full object-contain p-2"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.src.endsWith('/fallback.png')) return;
                        target.src = '/fallback.png';
                      }}
                    />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        moto.condition === 'Nueva'
                          ? 'bg-black text-white'
                          : 'bg-white text-black'
                      }`}
                    >
                      {condLabel}
                    </span>

                    {moto.featured && (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-black/90 text-white border border-white/15">
                        {t('product.badge.featured')}
                      </span>
                    )}
                  </div>

                  {/* Favorite */}
                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(moto.id)}
                      className="p-2 rounded-full bg-black/80 hover:bg-black transition-colors border border-white/20"
                      aria-label={favorites.includes(moto.id) ? t('favorites.remove') : t('favorites.add')}
                      title={favorites.includes(moto.id) ? t('favorites.remove') : t('favorites.add')}
                    >
                      <Heart
                        className="w-5 h-5"
                        color={favorites.includes(moto.id) ? '#ff6b00' : '#ffffff'}
                        fill={favorites.includes(moto.id) ? '#ff6b00' : 'none'}
                      />
                    </button>
                  </div>
                </div>

                {/* Contenido: más compacto */}
                <div className="p-4">
                  <h3 className="text-white font-black leading-tight text-lg md:text-xl">
                    {moto.name}
                  </h3>

                  <p className="text-white/90 text-sm font-bold mt-1">
                    {moto.brand} • {moto.model}
                  </p>

                  {/* specs compactos */}
                  <div className="mt-3 flex items-center justify-between text-white/95">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Calendar className="w-4 h-4" />
                      <span>{moto.year}</span>
                    </div>

                    {moto.engine && (
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Fuel className="w-4 h-4" />
                        <span>{moto.engine}</span>
                      </div>
                    )}

                    {moto.mileage && (
                      <div className="hidden md:flex items-center gap-2 text-sm font-bold">
                        <Gauge className="w-4 h-4" />
                        <span>{moto.mileage.toLocaleString()} km</span>
                      </div>
                    )}
                  </div>

                  {/* precio */}
                  {isPriceValid && (
                    <p className="mt-3 text-white font-black text-base md:text-lg">
                      {fmtMoney(priceNum)}
                    </p>
                  )}

                  {/* features: limitado para que no agrande la card */}
                  {shownFeatures.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {shownFeatures.map((f, idx) => {
                        const label = translateFeature(t, moto.id, f, idx);
                        return (
                          <span
                            key={`${moto.id}-feature-${idx}`}
                            className="bg-black/70 border border-white/20 text-white text-[11px] px-2 py-1 rounded-lg font-semibold"
                          >
                            {label}
                          </span>
                        );
                      })}
                      {extraCount > 0 && (
                        <span className="bg-black/70 border border-white/20 text-white text-[11px] px-2 py-1 rounded-lg font-semibold">
                          +{extraCount}
                        </span>
                      )}
                    </div>
                  ) : null}

                  {/* Acciones: compactas y consistentes */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Btn
                      variant="secondary"
                      onClick={() => onViewDetails(moto)}
                      aria-label={`${t('product.viewDetails')} ${moto.name}`}
                      title={t('product.viewDetails')}
                    >
                      <Eye className="w-4 h-4" />
                      {t('product.viewDetails')}
                    </Btn>

                    <Btn
                      variant="primary"
                      type="button"
                      onClick={() => {
                        if (!isPriceValid) return;
                        addItem({
                          id: String(moto.id),
                          name: moto.name,
                          price: priceNum,
                          qty: 1,
                          sku: String(moto.id),
                          image: moto.image,
                          url: window.location.href,
                        });
                        open();
                      }}
                      className="border border-white/70"
                    >
                      {t('cart.add')}
                    </Btn>

                    <div className="col-span-2">
                      {!isPriceValid ? (
                        <button
                          disabled
                          title={t('product.price.toConfirm')}
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded-xl text-sm font-extrabold opacity-60 cursor-not-allowed"
                        >
                          {t('product.price.toConfirm')}
                        </button>
                      ) : (
                        <AffirmButton
                          cartItems={[{
                            name: moto.name,
                            price: priceNum,
                            qty: 1,
                            sku: String(moto.id),
                            url: window.location.href,
                          }]}
                          totalUSD={priceNum}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => showToast(t('catalog.toast.moreSoon'))}
            className="bg-brand-600/90 backdrop-blur-md border border-brand-600/50 text-white px-10 py-4 rounded-xl text-lg md:text-xl font-black hover:bg-brand-700 transition-all duration-200 shadow-2xl"
          >
            {t('catalog.cta.moreBikes')}
          </button>
        </div>
      </div>

      {/* Toast global */}
      <SimpleToast show={toast.show} text={toast.text} onClose={() => setToast({ show: false, text: '' })} />
    </section>
  );
};

export default Catalog;
