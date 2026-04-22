import React, { useMemo, useState } from 'react';
import { Heart, Eye, Fuel, Gauge, Calendar, ArrowUpRight } from 'lucide-react';
import { Motorcycle } from '../App';
import AffirmButton from './AffirmButton';
import UnderlineGrow from './UnderlineGrow';
import { useCart } from '../context/CartContext';
import { useI18n } from '../i18n/I18nProvider';

interface CatalogProps {
  onViewDetails: (motorcycle: Motorcycle) => void;
}

function SimpleToast({
  show,
  text,
  onClose,
}: {
  show: boolean;
  text: string;
  onClose: () => void;
}) {
  if (!show) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#101113]/95 px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl"
      onClick={onClose}
      role="status"
    >
      {text}
    </div>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  compact?: boolean;
};

const Btn: React.FC<BtnProps> = ({
  variant = 'primary',
  compact = true,
  className = '',
  children,
  ...props
}) => {
  const base =
    'w-full inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed';
  const size = compact ? 'px-4 py-3 text-sm' : 'px-6 py-4 text-lg';

  const variants = {
    primary:
      'bg-white text-black hover:bg-brand hover:text-black shadow-lg active:scale-[.99]',
    secondary:
      'bg-white/[0.04] text-white border border-white/12 hover:bg-white/[0.08] active:scale-[.99]',
    ghost:
      'bg-transparent text-white/80 border border-white/10 hover:text-white hover:border-white/25',
  } as const;

  return (
    <button className={`${base} ${size} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const FEATURE_KEY_BY_ES: Record<string, string> = {
  'Motor eléctrico': 'feature.motor',
  'Ligero y ágil': 'feature.lightAgile',
  'Batería de alta capacidad': 'feature.batteryHigh',
  'Motor eléctrico de alta potencia': 'feature.motorHighPower',
  'Pantalla táctil': 'feature.touchscreen',
  'Conectividad Bluetooth': 'feature.bluetooth',
  'Sistema de navegación GPS': 'feature.gps',
  'High-capacity battery': 'feature.batteryHigh',
  'Light & agile': 'feature.lightAgile',
  'Electric motor': 'feature.motor',
};

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

  const motorcycles: Motorcycle[] = [
    {
      id: 9001,
      name: 'E-Bike Fat Tire (Black) — Invoice',
      brand: 'One Point',
      model: 'Invoice',
      year: 2025,
      price: 4000,
      image: '/IMG/onepoint-ebike-black-4000.jpeg',
      condition: 'Nueva',
      engine: 'Electric',
      featured: true,
      description: 'Invoice payment item. Financing available.',
      features: ['Electric motor', 'High-capacity battery', 'Light & agile'],
    },
    {
      id: 9002,
      name: 'E-Bike (Red) — Invoice',
      brand: 'One Point',
      model: 'Invoice',
      year: 2025,
      price: 2800,
      image: '/IMG/onepoint-ebike-red-2800.jpeg',
      condition: 'Nueva',
      engine: 'Electric',
      featured: true,
      description: 'Invoice payment item. Financing available.',
      features: ['Electric motor', 'Light & agile', 'High-capacity battery'],
    },
    {
      id: 9003,
      name: 'Electric Scooter (RGB) — Invoice',
      brand: 'One Point',
      model: 'Invoice',
      year: 2025,
      price: 500,
      image: '/IMG/onepoint-scooter-rgb-500.jpeg',
      condition: 'Nueva',
      engine: 'Electric',
      featured: true,
      description: 'Invoice payment item. Financing available.',
      features: ['Electric motor', 'Light & agile'],
    },
    {
      id: 5001,
      name: 'Electric Cargo Tricycle',
      brand: 'MZ',
      model: 'E-Cargo',
      year: 2025,
      price: 5000,
      image: '/IMG/triciclo-rojo.jpeg',
      condition: 'Nueva',
      engine: 'Electric',
      featured: true,
      description:
        'Robust electric cargo tricycle ideal for deliveries and utility tasks. Durable chassis, large rear cargo bed, weather canopy and comfortable seating. Financing available.',
      features: ['Motor eléctrico', 'Ligero y ágil', 'Batería de alta capacidad'],
      gallery: ['/IMG/triciclo-rojo.jpeg', '/IMG/triciclo-rojo2.jpeg', '/IMG/triciclo-rojo3.jpeg'],
    },
    {
      id: 5,
      name: 'Electric Scooter',
      brand: 'Scooter',
      model: 'Electric Scooter',
      year: 2025,
      price: 1500,
      image: '/IMG/Scooter-electrico(1).jpeg',
      condition: 'Nueva',
      engine: 'Electric',
      description:
        'Italian excellence in an electric scooter. Power, style and exclusivity in one vehicle.',
      features: ['Motor eléctrico', 'Ligero y ágil', 'Batería de alta capacidad'],
    },
    {
      id: 8,
      name: 'Electric Scooter 2025',
      brand: 'Master Sonic',
      model: 'Electric Scooter',
      year: 2025,
      price: 1750,
      image: '/IMG/scooter-nuevo.webp',
      condition: 'Nueva',
      engine: 'Electric',
      description: 'Compact, efficient and comfortable for everyday urban mobility.',
      features: ['Motor eléctrico', 'Ligero y ágil', 'Batería de alta capacidad'],
    },
    {
      id: 11,
      name: 'Electric Bike Pro',
      brand: 'E-Bike',
      model: 'EBike Pro 2025',
      year: 2025,
      price: 1000,
      image: '/IMG/electricBike2.jpeg',
      condition: 'Nueva',
      engine: 'Electric',
      featured: true,
      description: 'High-performance e-bike, ideal for city and long rides.',
      features: ['Motor eléctrico', 'Batería de alta capacidad', 'Tablero digital'],
    },
    {
      id: 12,
      name: 'Urban Electric Bike',
      brand: 'E-Bike',
      model: 'Scooter Urban 2025',
      year: 2025,
      price: 1000,
      image: '/IMG/electricBike3.jpeg',
      condition: 'Nueva',
      engine: 'Electric',
      featured: true,
      description: 'Urban electric bike, comfortable and efficient for daily use.',
      features: ['Motor eléctrico', 'Ligero y ágil', 'Batería de alta capacidad'],
    },
    {
      id: 16,
      name: 'Premium Electric Bicycle',
      brand: 'Universal',
      model: 'Scooter Premium 2025',
      year: 2025,
      price: 3500,
      image: '/IMG/bici-electric-negra.jpeg',
      condition: 'Nueva',
      engine: 'Electric',
      featured: true,
      description:
        'Premium electric bicycle, ideal for long trips and comfortable commuting.',
      features: ['Motor eléctrico', 'Batería de alta capacidad', 'Diseño ergonómico'],
    },
    {
      id: 17,
      name: 'Amazta Electric Scooter',
      brand: 'Amazta',
      model: 'Amazta 2025',
      year: 2025,
      price: 2500,
      image: '/IMG/scooter-nuevo2.webp',
      condition: 'Nueva',
      engine: 'Electric',
      featured: true,
      description: 'Perfect blend of style and technology. Ideal for urban commuting.',
      features: ['Motor eléctrico', 'Diseño moderno', 'Batería de larga duración'],
    },
    {
      id: 18,
      name: 'Movelito Electric Scooter',
      brand: 'Movelito',
      model: 'Movelito 2025',
      year: 2025,
      price: 1850,
      image: '/IMG/scooter-nuevo3.webp',
      condition: 'Nueva',
      engine: 'Electric',
      featured: true,
      description: 'Compact and efficient scooter. Perfect for the city with an attractive design.',
      features: ['Motor eléctrico', 'Ligero y ágil', 'Batería de alta capacity'],
    },
    {
      id: 19,
      name: 'Galaxy Premium Electric Scooter',
      brand: 'Galaxy',
      model: 'Premium 2025',
      year: 2025,
      price: 2000,
      image: '/IMG/scooter-nuevo4.webp',
      condition: 'Nueva',
      engine: 'Electric',
      featured: true,
      description: 'Latest innovation in urban mobility with futuristic design and advanced tech.',
      features: [
        'Motor eléctrico de alta potencia',
        'Pantalla táctil',
        'Conectividad Bluetooth',
        'Sistema de navegación GPS',
      ],
    },
  ];

  const onlyElectric = useMemo(
    () => motorcycles.filter((m) => m.engine && m.engine.toLowerCase() === 'electric'),
    [motorcycles]
  );

  const filteredMotorcycles = useMemo(() => {
    return onlyElectric.filter((moto) => {
      if (filter === 'all') return true;
      return moto.condition.toLowerCase() === filter;
    });
  }, [onlyElectric, filter]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]));
  };

  return (
    <section id="catalogo" className="bg-[#0b0b0c] py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
              Electric selection
            </p>
            <h2 className="mb-5 text-4xl font-black leading-none text-white md:text-6xl">
              <UnderlineGrow>{t('catalog.title')}</UnderlineGrow>
            </h2>
            <p className="max-w-2xl text-lg font-medium text-white/65 md:text-xl">
              {t('catalog.subtitle')}
            </p>
          </div>

          <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.03] p-1.5 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition ${
                filter === 'all' ? 'bg-white text-black' : 'text-white/65 hover:text-white'
              }`}
            >
              {t('catalog.filter.all')}
            </button>
            <button
              onClick={() => setFilter('nueva')}
              className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition ${
                filter === 'nueva' ? 'bg-white text-black' : 'text-white/65 hover:text-white'
              }`}
            >
              {t('catalog.filter.new')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredMotorcycles.map((moto) => {
            const condLabel =
              moto.condition === 'Nueva' ? t('product.condition.new') : t('product.condition.used');

            const priceNum = Number(moto.price);
            const isPriceValid = Number.isFinite(priceNum) && priceNum > 0;

            const features = moto.features || [];
            const shownFeatures = features.slice(0, 3);
            const extraCount = Math.max(0, features.length - shownFeatures.length);

            return (
              <article
                key={moto.id}
                className="group overflow-hidden rounded-[28px] border border-white/10 bg-[#121315] shadow-[0_20px_70px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                <div className="relative overflow-hidden border-b border-white/8 bg-[radial-gradient(circle_at_top,#1b1d21,transparent_65%)]">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

                  <div className="aspect-[4/3] w-full overflow-hidden p-5">
                    <img
                      src={moto.image || '/fallback.png'}
                      alt={moto.name || t('image.altFallback')}
                      className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.src.endsWith('/fallback.png')) return;
                        target.src = '/fallback.png';
                      }}
                    />
                  </div>

                  <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white">
                      {condLabel}
                    </span>

                    {moto.featured && (
                      <span className="rounded-full border border-brand/30 bg-brand/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand">
                        {t('product.badge.featured')}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(moto.id)}
                    className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/60 p-2.5 transition hover:bg-black/80"
                    aria-label={favorites.includes(moto.id) ? t('favorites.remove') : t('favorites.add')}
                    title={favorites.includes(moto.id) ? t('favorites.remove') : t('favorites.add')}
                  >
                    <Heart
                      className="h-5 w-5"
                      color={favorites.includes(moto.id) ? '#39ff14' : '#ffffff'}
                      fill={favorites.includes(moto.id) ? '#39ff14' : 'none'}
                    />
                  </button>
                </div>

                <div className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black leading-tight text-white">{moto.name}</h3>
                      <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-white/45">
                        {moto.brand} • {moto.model}
                      </p>
                    </div>

                    {isPriceValid && (
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                          Price
                        </p>
                        <p className="text-xl font-black text-white">{fmtMoney(priceNum)}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-white/70 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <div className="mb-2 flex items-center gap-2 text-white/40">
                        <Calendar className="h-4 w-4" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Year</span>
                      </div>
                      <p className="font-extrabold text-white">{moto.year}</p>
                    </div>

                    {moto.engine && (
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                        <div className="mb-2 flex items-center gap-2 text-white/40">
                          <Fuel className="h-4 w-4" />
                          <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Motor</span>
                        </div>
                        <p className="font-extrabold text-white">{moto.engine}</p>
                      </div>
                    )}

                    {moto.mileage ? (
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                        <div className="mb-2 flex items-center gap-2 text-white/40">
                          <Gauge className="h-4 w-4" />
                          <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Mileage</span>
                        </div>
                        <p className="font-extrabold text-white">{moto.mileage.toLocaleString()} km</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                        <div className="mb-2 flex items-center gap-2 text-white/40">
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Ready</span>
                        </div>
                        <p className="font-extrabold text-white">In stock</p>
                      </div>
                    )}
                  </div>

                  {shownFeatures.length ? (
                    <div className="flex flex-wrap gap-2">
                      {shownFeatures.map((f, idx) => {
                        const label = translateFeature(t, moto.id, f, idx);
                        return (
                          <span
                            key={`${moto.id}-feature-${idx}`}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/75"
                          >
                            {label}
                          </span>
                        );
                      })}
                      {extraCount > 0 && (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/75">
                          +{extraCount}
                        </span>
                      )}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-3">
                    <Btn
                      variant="secondary"
                      onClick={() => onViewDetails(moto)}
                      aria-label={`${t('product.viewDetails')} ${moto.name}`}
                      title={t('product.viewDetails')}
                    >
                      <Eye className="h-4 w-4" />
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
                    >
                      {t('cart.add')}
                    </Btn>

                    <div className="col-span-2">
                      {!isPriceValid ? (
                        <button
                          disabled
                          title={t('product.price.toConfirm')}
                          className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-extrabold text-white/45"
                        >
                          {t('product.price.toConfirm')}
                        </button>
                      ) : (
                        <AffirmButton
                          cartItems={[
                            {
                              name: moto.name,
                              price: priceNum,
                              qty: 1,
                              sku: String(moto.id),
                              url: window.location.href,
                            },
                          ]}
                          totalUSD={priceNum}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => showToast(t('catalog.toast.moreSoon'))}
            className="rounded-full border border-white/12 bg-white/[0.04] px-8 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white transition hover:bg-white/[0.08]"
          >
            {t('catalog.cta.moreBikes')}
          </button>
        </div>
      </div>

      <SimpleToast show={toast.show} text={toast.text} onClose={() => setToast({ show: false, text: '' })} />
    </section>
  );
};

export default Catalog;