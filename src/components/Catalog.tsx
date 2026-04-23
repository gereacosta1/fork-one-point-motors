import React, { useMemo, useState } from 'react';
import { Heart, ArrowUpRight } from 'lucide-react';
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
  'Diseño moderno': 'feature.modernDesign',
  'Batería de larga duración': 'feature.longBattery',
  'Diseño ergonómico': 'feature.ergonomicDesign',
  'ABS': 'feature.abs',
  'Traction control': 'feature.tractionControl',
  'Riding modes': 'feature.ridingModes',
  'Tablero digital': 'feature.digitalDashboard',
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
  const { addItem, open } = useCart();

  const [filter, setFilter] = useState<'all' | 'nueva'>('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [toast, setToast] = useState<{ show: boolean; text: string }>({
    show: false,
    text: '',
  });

  const showToast = (text: string, ms = 2500) => {
    setToast({ show: true, text });
    window.setTimeout(() => setToast({ show: false, text: '' }), ms);
  };

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
      gallery: [
        '/IMG/triciclo-rojo.jpeg',
        '/IMG/triciclo-rojo2.jpeg',
        '/IMG/triciclo-rojo3.jpeg',
      ],
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
      features: ['ABS', 'Traction control', 'Riding modes'],
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
      description:
        'Compact and efficient scooter. Perfect for the city with an attractive design.',
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
      description:
        'Latest innovation in urban mobility with futuristic design and advanced tech.',
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
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  return (
    <section id="catalogo" className="relative overflow-hidden bg-[#0b0b0c] py-24 md:py-32">
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,#39ff14,transparent_22%),radial-gradient(circle_at_bottom_right,#ffffff,transparent_18%)]" />
      </div>

      <div className="relative container mx-auto px-6">
        <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-white/38">
              Electric selection
            </p>

            <h2 className="mb-5 text-4xl font-black leading-none text-white md:text-6xl xl:text-7xl">
              <UnderlineGrow>{t('catalog.title')}</UnderlineGrow>
            </h2>

            <p className="max-w-2xl text-lg font-medium leading-relaxed text-white/58 md:text-xl">
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

        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/32">
            {filteredMotorcycles.length} vehicles available
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {filteredMotorcycles.map((moto, index) => {
            const condLabel =
              moto.condition === 'Nueva'
                ? t('product.condition.new')
                : t('product.condition.used');

            const priceNum = Number(moto.price);
            const isPriceValid = Number.isFinite(priceNum) && priceNum > 0;

            const features = moto.features || [];
            const shownFeatures = features.slice(0, 3);
            const extraCount = Math.max(0, features.length - shownFeatures.length);

            return (
              <article
                key={moto.id}
                className="group overflow-hidden rounded-[34px] border border-white/10 bg-[#101113] transition duration-300 hover:border-white/18"
              >
                <div className="grid items-stretch md:grid-cols-[1.02fr_0.98fr]">
                  <div className="flex flex-col justify-between p-7 md:p-8">
                    <div>
                      <div className="mb-5 flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/70">
                          {moto.featured ? 'Featured' : condLabel}
                        </span>

                        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">
                          {moto.year}
                        </span>

                        {index === 0 && (
                          <span className="rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.24em] text-brand">
                            Top pick
                          </span>
                        )}
                      </div>

                      <h3 className="max-w-xl text-3xl font-black leading-[1] text-white md:text-4xl">
                        {moto.name}
                      </h3>

                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/38">
                        {moto.brand} • {moto.model}
                      </p>

                      {moto.description ? (
                        <p className="mt-6 max-w-lg text-base leading-relaxed text-white/58">
                          {moto.description}
                        </p>
                      ) : null}

                      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/34">
                        <span>{moto.engine}</span>
                        <span>{moto.mileage ? `${moto.mileage.toLocaleString()} km` : 'In stock'}</span>
                        <span>{condLabel}</span>
                      </div>

                      {shownFeatures.length ? (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {shownFeatures.map((f, idx) => {
                            const label = translateFeature(t, moto.id, f, idx);
                            return (
                              <span
                                key={`${moto.id}-feature-${idx}`}
                                className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/62"
                              >
                                {label}
                              </span>
                            );
                          })}
                          {extraCount > 0 && (
                            <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/62">
                              +{extraCount}
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-10">
                      <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">
                            Price
                          </p>
                          <p className="mt-2 text-2xl font-black text-white">
                            {isPriceValid ? fmtMoney(priceNum) : '—'}
                          </p>
                        </div>

                        <button
                          onClick={() => onViewDetails(moto)}
                          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/46 transition hover:text-white"
                          aria-label={`${t('product.viewDetails')} ${moto.name}`}
                          title={t('product.viewDetails')}
                        >
                          {t('product.viewDetails')}
                          <ArrowUpRight className="h-4 w-4 text-brand" />
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
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
                          className="inline-flex h-[56px] items-center justify-center rounded-full border border-white/12 bg-white px-6 text-sm font-extrabold text-black transition hover:bg-brand"
                        >
                          {t('cart.add')}
                        </button>

                        <div className="h-[56px]">
                          {!isPriceValid ? (
                            <button
                              disabled
                              title={t('product.price.toConfirm')}
                              className="h-full w-full cursor-not-allowed rounded-full border border-white/12 bg-white/[0.03] px-4 text-sm font-extrabold text-white/42"
                            >
                              {t('product.price.toConfirm')}
                            </button>
                          ) : (
                            <div className="h-full w-full">
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
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden border-l border-white/8 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_55%)] p-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(57,255,20,0.08),transparent_30%)] opacity-80" />

                    <button
                      type="button"
                      onClick={() => toggleFavorite(moto.id)}
                      className="absolute right-5 top-5 z-20 rounded-full border border-white/10 bg-black/25 p-2.5 opacity-70 backdrop-blur-xl transition hover:opacity-100"
                      aria-label={
                        favorites.includes(moto.id) ? t('favorites.remove') : t('favorites.add')
                      }
                      title={
                        favorites.includes(moto.id) ? t('favorites.remove') : t('favorites.add')
                      }
                    >
                      <Heart
                        className="h-5 w-5"
                        color={favorites.includes(moto.id) ? '#39ff14' : '#ffffff'}
                        fill={favorites.includes(moto.id) ? '#39ff14' : 'none'}
                      />
                    </button>

                    <img
                      src={moto.image || '/fallback.png'}
                      alt={moto.name || t('image.altFallback')}
                      className="relative z-10 h-[260px] w-full object-contain transition duration-500 group-hover:scale-[1.03] md:h-[320px]"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.src.endsWith('/fallback.png')) return;
                        target.src = '/fallback.png';
                      }}
                    />
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

      <SimpleToast
        show={toast.show}
        text={toast.text}
        onClose={() => setToast({ show: false, text: '' })}
      />
    </section>
  );
};

export default Catalog;