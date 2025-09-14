import React from 'react';
import { X, Calendar, Fuel, Gauge, Star, Shield, Wrench, Phone } from 'lucide-react';
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
    // 1) intento clave por índice, si existe en diccionario
    const kByIndex = `product.${pid}.feature.${i}`;
    const viaIndex = tr(kByIndex, '__MISS__');
    if (viaIndex !== '__MISS__') return viaIndex;

    // 2) si no hay clave por índice, uso el mapeo ES -> key
    const k = FEATURE_KEY_BY_ES[f];
    return k ? t(k as any) : f; // fallback al texto original
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-black/95 backdrop-blur-md border border-red-600/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-red-600/30">
            <h2 className="text-3xl font-black text-white">{motorcycle.name}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40 transition-colors"
              aria-label={t('modal.close')}
              title={t('modal.close')}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Image */}
              <div className="relative">
                <img
                  src={motorcycle.image}
                  alt={motorcycle.name}
                  className="w-full h-80 object-cover rounded-lg"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-4 py-2 rounded-full text-lg font-bold ${
                      motorcycle.condition === 'Nueva' ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  >
                    {condLabel}
                  </span>
                </div>
                {motorcycle.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold">
                      {t('product.badge.featured')}
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">
                    {motorcycle.brand} {motorcycle.model}
                  </h3>
                  {desc && (
                    <p className="text-white text-lg font-bold mb-4">{desc}</p>
                  )}
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 text-white">
                    <Calendar className="w-6 h-6" />
                    <div>
                      <p className="text-lg font-bold">{t('modal.year')}</p>
                      <p className="text-xl font-black">{motorcycle.year}</p>
                    </div>
                  </div>
                  {motorcycle.engine ? (
                    <div className="flex items-center space-x-3 text-white">
                      <Fuel className="w-6 h-6" />
                      <div>
                        <p className="text-lg font-bold">{t('modal.engine')}</p>
                        <p className="text-xl font-black">{motorcycle.engine}</p>
                      </div>
                    </div>
                  ) : null}
                  {motorcycle.mileage ? (
                    <div className="flex items-center space-x-3 text-white col-span-2">
                      <Gauge className="w-6 h-6" />
                      <div>
                        <p className="text-lg font-bold">{t('modal.mileage')}</p>
                        <p className="text-xl font-black">{motorcycle.mileage.toLocaleString()} km</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Features */}
                {feat.length > 0 && (
                  <div>
                    <h4 className="text-xl font-black text-white mb-3">{t('modal.features')}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {feat.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-white">
                          <Star className="w-4 h-4" />
                          <span className="text-lg font-bold">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price & Actions */}
                <div className="bg-red-600/90 backdrop-blur-sm p-6 rounded-lg border border-red-600/50">
                  {Number(motorcycle.price) > 0 && (
                    <p className="text-4xl font-black text-white mb-4">
                      {fmtMoney(Number(motorcycle.price))}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={onPhoneCall}
                      className="bg-black/80 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg text-lg font-black hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center space-x-2"
                      aria-label={t('modal.contact')}
                      title={t('modal.contact')}
                    >
                      <Phone className="w-5 h-5" />
                      <span>{t('modal.contact')}</span>
                    </button>

                    <button
                      onClick={handleFinancing}
                      className="bg-black/80 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg text-lg font-black hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      {t('modal.financing')}
                    </button>
                  </div>

                  <button
                    onClick={onWhatsApp}
                    className="w-full mt-4 bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-black hover:bg-green-700 transition-all duration-300 flex items-center justify-center space-x-2"
                    aria-label={t('modal.whatsapp')}
                    title={t('modal.whatsapp')}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
                    </svg>
                    {t('modal.whatsapp')}
                  </button>
                </div>

                {/* Guarantees */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="text-white">
                    <Shield className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-lg font-bold">{t('guarantee.warranty')}</p>
                  </div>
                  <div className="text-white">
                    <Wrench className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-lg font-bold">{t('guarantee.service')}</p>
                  </div>
                  <div className="text-white">
                    <Star className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-lg font-bold">{t('guarantee.quality')}</p>
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
