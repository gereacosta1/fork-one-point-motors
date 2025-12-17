// src/components/MotorcycleModal.tsx
import React, { useEffect } from 'react';
import { X, Calendar, Fuel, Gauge, Star, Shield, Wrench, Phone, MessageCircle } from 'lucide-react';
import { Motorcycle } from '../App';
import { useI18n } from '../i18n/I18nProvider';

interface MotorcycleModalProps {
  motorcycle: Motorcycle;
  onClose: () => void;
  onPhoneCall: () => void;
  onWhatsApp: () => void;
}

/** 🔁 mismo mapeo que en Catalog */
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

const MotorcycleModal: React.FC<MotorcycleModalProps> = ({
  motorcycle,
  onClose,
  onPhoneCall,
  onWhatsApp,
}) => {
  const { t, lang, fmtMoney } = useI18n();

  // helper: intenta traducir una key y si no existe, vuelve al fallback
  const tr = (key: string, fallback?: string) => {
    const val = (t as any)(key);
    return val === key ? (fallback ?? key) : val;
  };

  const handleFinancing = () => {
    const msgEs = `¡Hola! Me interesa info de financiamiento para la ${motorcycle.name} ${motorcycle.year}. ¿Qué opciones tienen disponibles?`;
    const msgEn = `Hi! I'm interested in financing options for the ${motorcycle.name} ${motorcycle.year}. Could you share what's available?`;
    const message = encodeURIComponent(lang === 'es' ? msgEs : msgEn);
    const whatsappUrl = `https://wa.me/+17862530995?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const condLabel =
    motorcycle.condition === 'Nueva'
      ? t('product.condition.new')
      : t('product.condition.used');

  // Descripción y features traducibles
  const pid = String(motorcycle.id);
  const desc = tr(`product.${pid}.desc`, motorcycle.description);

  const feat = (motorcycle.features ?? []).map((f, i) => {
    // 1) intento clave por índice
    const kByIndex = `product.${pid}.feature.${i}`;
    const viaIndex = tr(kByIndex, '__MISS__');
    if (viaIndex !== '__MISS__') return viaIndex;

    // 2) si no hay clave por índice, uso el mapeo ES -> key
    const k = FEATURE_KEY_BY_ES[f];
    return k ? t(k as any) : f;
  });

  const priceNum = Number(motorcycle.price);
  const hasValidPrice = Number.isFinite(priceNum) && priceNum > 0;

  // Cerrar con ESC + bloquear scroll de fondo
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={motorcycle.name}
    >
      {/* Card */}
      <div className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-brand-600/35 shadow-2xl bg-black/95">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-brand-600/25">
          <div className="min-w-0">
            <h2 className="text-white font-black text-xl sm:text-2xl md:text-3xl leading-tight truncate">
              {motorcycle.name}
            </h2>
            <p className="text-white/80 font-bold text-sm sm:text-base truncate">
              {motorcycle.brand} • {motorcycle.model}
            </p>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-xl bg-black/70 border border-white/15 hover:border-white/30 hover:bg-black/90 transition"
            aria-label={t('modal.close')}
            title={t('modal.close')}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="grid lg:grid-cols-2 gap-0 max-h-[calc(92vh-64px)] overflow-y-auto">
          {/* Left: Image */}
          <div className="relative bg-white">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img
                src={motorcycle.image || '/fallback.png'}
                alt={motorcycle.name}
                className="w-full h-full object-contain p-3"
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
                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold ${
                  motorcycle.condition === 'Nueva'
                    ? 'bg-black text-white'
                    : 'bg-white text-black border border-black/10'
                }`}
              >
                {condLabel}
              </span>

              {motorcycle.featured && (
                <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold bg-black/90 text-white border border-white/15">
                  {t('product.badge.featured')}
                </span>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="bg-brand-600/95 p-4 sm:p-6">
            {/* Description */}
            {desc ? (
              <div className="bg-black/35 border border-white/15 rounded-2xl p-4">
                <h3 className="text-white font-black text-lg sm:text-xl mb-2">
                  {t('modal.about')}
                </h3>
                <p className="text-white/95 font-semibold text-sm sm:text-base leading-relaxed">
                  {desc}
                </p>
              </div>
            ) : null}

            {/* Specs */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/35 border border-white/15 p-3 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-black/60 border border-white/10">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/80 text-xs sm:text-sm font-bold">{t('modal.year')}</p>
                  <p className="text-white text-sm sm:text-base font-black">{motorcycle.year}</p>
                </div>
              </div>

              {motorcycle.engine ? (
                <div className="rounded-2xl bg-black/35 border border-white/15 p-3 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-black/60 border border-white/10">
                    <Fuel className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/80 text-xs sm:text-sm font-bold">{t('modal.engine')}</p>
                    <p className="text-white text-sm sm:text-base font-black truncate">{motorcycle.engine}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-black/35 border border-white/15 p-3 flex items-center gap-3 opacity-70">
                  <div className="p-2 rounded-xl bg-black/60 border border-white/10">
                    <Fuel className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/80 text-xs sm:text-sm font-bold">{t('modal.engine')}</p>
                    <p className="text-white text-sm sm:text-base font-black">—</p>
                  </div>
                </div>
              )}

              {motorcycle.mileage ? (
                <div className="col-span-2 rounded-2xl bg-black/35 border border-white/15 p-3 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-black/60 border border-white/10">
                    <Gauge className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/80 text-xs sm:text-sm font-bold">{t('modal.mileage')}</p>
                    <p className="text-white text-sm sm:text-base font-black">
                      {motorcycle.mileage.toLocaleString()} km
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Features */}
            {feat.length > 0 && (
              <div className="mt-4 rounded-2xl bg-black/35 border border-white/15 p-4">
                <h4 className="text-white font-black text-lg sm:text-xl mb-3">
                  {t('modal.features')}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {feat.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-xl bg-black/50 border border-white/10 px-3 py-2"
                    >
                      <Star className="w-4 h-4 text-white" />
                      <span className="text-white font-bold text-sm sm:text-base leading-snug">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price + Actions */}
            <div className="mt-4 rounded-2xl bg-black/45 border border-white/15 p-4">
              {hasValidPrice ? (
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-white font-black text-2xl sm:text-3xl md:text-4xl leading-none">
                    {fmtMoney(priceNum)}
                  </p>
                  <span className="text-white/80 font-bold text-xs sm:text-sm">
                    {t('modal.priceNote')}
                  </span>
                </div>
              ) : (
                <p className="text-white font-black text-lg sm:text-xl">
                  {t('product.price.toConfirm')}
                </p>
              )}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={onPhoneCall}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-extrabold text-sm sm:text-base
                             bg-brand-600 text-white hover:bg-brand-700 shadow-lg hover:shadow-brand-500/30 transition
                             border border-white/30"
                  aria-label={t('modal.contact')}
                  title={t('modal.contact')}
                >
                  <Phone className="w-5 h-5" />
                  {t('modal.contact')}
                </button>

                <button
                  onClick={handleFinancing}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-extrabold text-sm sm:text-base
                             bg-black/70 text-white hover:bg-black/90 transition border border-white/20"
                  aria-label={t('modal.financing')}
                  title={t('modal.financing')}
                >
                  <MessageCircle className="w-5 h-5" />
                  {t('modal.financing')}
                </button>

                <button
                  onClick={onWhatsApp}
                  className="sm:col-span-2 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-extrabold text-sm sm:text-base
                             bg-black/70 text-white hover:bg-black/90 transition border border-white/20"
                  aria-label={t('modal.whatsapp')}
                  title={t('modal.whatsapp')}
                >
                  {/* icon WhatsApp */}
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
                  </svg>
                  {t('modal.whatsapp')}
                </button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-black/35 border border-white/15 p-3 text-center">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 mx-auto text-white mb-2" />
                <p className="text-white font-extrabold text-xs sm:text-sm leading-tight">
                  {t('guarantee.warranty')}
                </p>
              </div>
              <div className="rounded-2xl bg-black/35 border border-white/15 p-3 text-center">
                <Wrench className="w-6 h-6 sm:w-7 sm:h-7 mx-auto text-white mb-2" />
                <p className="text-white font-extrabold text-xs sm:text-sm leading-tight">
                  {t('guarantee.service')}
                </p>
              </div>
              <div className="rounded-2xl bg-black/35 border border-white/15 p-3 text-center">
                <Star className="w-6 h-6 sm:w-7 sm:h-7 mx-auto text-white mb-2" />
                <p className="text-white font-extrabold text-xs sm:text-sm leading-tight">
                  {t('guarantee.quality')}
                </p>
              </div>
            </div>

            {/* Bottom spacing to avoid "cut" feeling on small screens */}
            <div className="h-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorcycleModal;
