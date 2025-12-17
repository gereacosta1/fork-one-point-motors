// src/components/MotorcycleModal.tsx
import React, { useMemo, useState } from 'react';
import { X, Calendar, Fuel, Gauge, Star, Shield, Wrench, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
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
};

const MotorcycleModal: React.FC<MotorcycleModalProps> = ({ motorcycle, onClose, onPhoneCall, onWhatsApp }) => {
  const { t, lang, fmtMoney } = useI18n();

  // helper: intenta traducir una key y si no existe, vuelve al fallback
  const tr = (key: string, fallback?: string) => {
    const val = (t as any)(key);
    return val === key ? (fallback ?? key) : val;
  };

  const handleFinancing = () => {
    const msgEs = `¡Hola! Me interesa información sobre financiamiento para la ${motorcycle.name} ${motorcycle.year}. ¿Qué opciones tienen disponibles?`;
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
    const kByIndex = `product.${pid}.feature.${i}`;
    const viaIndex = tr(kByIndex, '__MISS__');
    if (viaIndex !== '__MISS__') return viaIndex;

    const k = FEATURE_KEY_BY_ES[f];
    return k ? t(k as any) : f;
  });

  // Soporte "images[]" opcional (sin romper tu type actual)
  const gallery: string[] = useMemo(() => {
    const anyMoto: any = motorcycle as any;
    const imgs = Array.isArray(anyMoto.images) ? anyMoto.images.filter(Boolean) : [];
    const main = motorcycle.image ? [motorcycle.image] : [];
    const unique = [...main, ...imgs].filter((v, i, a) => a.indexOf(v) === i);
    return unique.length ? unique : main;
  }, [motorcycle]);

  const [imgIndex, setImgIndex] = useState(0);
  const nextImg = () => setImgIndex((p) => (p + 1) % Math.max(1, gallery.length));
  const prevImg = () => setImgIndex((p) => (p - 1 + Math.max(1, gallery.length)) % Math.max(1, gallery.length));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-black/90 border border-white/10 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white truncate">
              {motorcycle.name}
            </h2>
            <p className="text-white/70 text-sm font-semibold">
              {motorcycle.brand} • {motorcycle.model}
            </p>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            aria-label={t('modal.close')}
            title={t('modal.close')}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body (scroll) */}
        <div className="max-h-[84vh] overflow-y-auto">
          <div className="p-5 sm:p-6">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Media */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white shadow-xl">
                  {/* aspect ratio + contain para NO recortar */}
                  <div className="relative w-full aspect-[16/10] sm:aspect-[16/9]">
                    <img
                      src={gallery[Math.min(imgIndex, Math.max(0, gallery.length - 1))]}
                      alt={motorcycle.name}
                      className="absolute inset-0 w-full h-full object-contain p-2 sm:p-3"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-black border ${
                        motorcycle.condition === 'Nueva'
                          ? 'bg-black text-white border-white/15'
                          : 'bg-white text-black border-black/10'
                      }`}
                    >
                      {condLabel}
                    </span>

                    {motorcycle.featured && (
                      <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-black bg-brand/90 text-white border border-brand/60">
                        {t('product.badge.featured')}
                      </span>
                    )}
                  </div>

                  {/* Carousel controls (si hay más de 1) */}
                  {gallery.length > 1 && (
                    <>
                      <button
                        onClick={prevImg}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 text-white p-2 rounded-full border border-white/10 hover:bg-black/85 transition"
                        aria-label="Previous image"
                        title="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImg}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 text-white p-2 rounded-full border border-white/10 hover:bg-black/85 transition"
                        aria-label="Next image"
                        title="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                        {gallery.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImgIndex(i)}
                            className={`h-2.5 w-2.5 rounded-full border transition ${
                              i === imgIndex ? 'bg-brand border-brand' : 'bg-black/30 border-black/30'
                            }`}
                            aria-label={`Image ${i + 1}`}
                            title={`Image ${i + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Nota de seguridad visual: fondo blanco en imagen, modal oscuro */}
                <p className="mt-3 text-xs text-white/60 font-semibold">
                  {t('modal.clickOutsideToClose') ?? ''}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-6">
                {/* Description */}
                {desc ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-black text-white mb-2">
                      {t('modal.description') ?? 'Details'}
                    </h3>
                    <p className="text-white/90 text-sm sm:text-base font-semibold leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ) : null}

                {/* Specs */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                  <h4 className="text-base sm:text-lg font-black text-white mb-4">{t('modal.specs') ?? 'Specs'}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-white">
                      <Calendar className="w-5 h-5 text-brand" />
                      <div>
                        <p className="text-xs text-white/70 font-bold">{t('modal.year')}</p>
                        <p className="text-base sm:text-lg font-black">{motorcycle.year}</p>
                      </div>
                    </div>

                    {motorcycle.engine ? (
                      <div className="flex items-center gap-3 text-white">
                        <Fuel className="w-5 h-5 text-brand" />
                        <div>
                          <p className="text-xs text-white/70 font-bold">{t('modal.engine')}</p>
                          <p className="text-base sm:text-lg font-black">{motorcycle.engine}</p>
                        </div>
                      </div>
                    ) : null}

                    {motorcycle.mileage ? (
                      <div className="flex items-center gap-3 text-white col-span-2">
                        <Gauge className="w-5 h-5 text-brand" />
                        <div>
                          <p className="text-xs text-white/70 font-bold">{t('modal.mileage')}</p>
                          <p className="text-base sm:text-lg font-black">{motorcycle.mileage.toLocaleString()} km</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Features */}
                {feat.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                    <h4 className="text-base sm:text-lg font-black text-white mb-3">{t('modal.features')}</h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {feat.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-white/90">
                          <Star className="w-4 h-4 text-brand" />
                          <span className="text-sm sm:text-base font-semibold">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price & Actions */}
                <div className="rounded-2xl border border-brand/40 bg-brand/20 p-4 sm:p-5">
                  {Number(motorcycle.price) > 0 && (
                    <p className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4">
                      {fmtMoney(Number(motorcycle.price))}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={onPhoneCall}
                      className="bg-black/70 border border-white/15 text-white px-5 py-3 rounded-xl text-sm sm:text-base font-black hover:bg-white hover:text-black transition flex items-center justify-center gap-2"
                      aria-label={t('modal.contact')}
                      title={t('modal.contact')}
                    >
                      <Phone className="w-5 h-5" />
                      <span>{t('modal.contact')}</span>
                    </button>

                    <button
                      onClick={handleFinancing}
                      className="bg-black/70 border border-white/15 text-white px-5 py-3 rounded-xl text-sm sm:text-base font-black hover:bg-white hover:text-black transition"
                    >
                      {t('modal.financing')}
                    </button>
                  </div>

                  <button
                    onClick={onWhatsApp}
                    className="w-full mt-3 bg-brand text-black px-5 py-3 rounded-xl text-sm sm:text-base font-black hover:bg-brand-hover transition flex items-center justify-center gap-2"
                    aria-label={t('modal.whatsapp')}
                    title={t('modal.whatsapp')}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
                    </svg>
                    <span>{t('modal.whatsapp')}</span>
                  </button>
                </div>

                {/* Guarantees */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl border border-white/10 bg-white/5 py-4">
                    <Shield className="w-7 h-7 mx-auto mb-2 text-brand" />
                    <p className="text-xs sm:text-sm font-bold text-white">{t('guarantee.warranty')}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 py-4">
                    <Wrench className="w-7 h-7 mx-auto mb-2 text-brand" />
                    <p className="text-xs sm:text-sm font-bold text-white">{t('guarantee.service')}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 py-4">
                    <Star className="w-7 h-7 mx-auto mb-2 text-brand" />
                    <p className="text-xs sm:text-sm font-bold text-white">{t('guarantee.quality')}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorcycleModal;
