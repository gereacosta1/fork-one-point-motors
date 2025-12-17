// src/components/MotorcycleModal.tsx
import React, { useEffect } from "react";
import { X, Calendar, Fuel, Gauge, Star, Shield, Wrench, Phone } from "lucide-react";
import { Motorcycle } from "../App";
import { useI18n } from "../i18n/I18nProvider";

interface MotorcycleModalProps {
  motorcycle: Motorcycle;
  onClose: () => void;
  onPhoneCall: () => void;
  onWhatsApp: () => void;
}

/** 🔁 mismo mapeo que en Catalog (ES -> key) */
const FEATURE_KEY_BY_ES: Record<string, string> = {
  "Motor eléctrico": "feature.motor",
  "Ligero y ágil": "feature.lightAgile",
  "Batería de alta capacidad": "feature.batteryHigh",
  "Motor eléctrico de alta potencia": "feature.motorHighPower",
  "Pantalla táctil": "feature.touchscreen",
  "Conectividad Bluetooth": "feature.bluetooth",
  "Sistema de navegación GPS": "feature.gps",
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

  // ESC para cerrar + lock scroll body
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const condLabel =
    motorcycle.condition === "Nueva"
      ? t("product.condition.new")
      : t("product.condition.used");

  const pid = String(motorcycle.id);
  const desc = tr(`product.${pid}.desc`, motorcycle.description);

  const feat = (motorcycle.features ?? []).map((f, i) => {
    const kByIndex = `product.${pid}.feature.${i}`;
    const viaIndex = tr(kByIndex, "__MISS__");
    if (viaIndex !== "__MISS__") return viaIndex;

    const k = FEATURE_KEY_BY_ES[f];
    return k ? t(k as any) : f;
  });

  const handleFinancing = () => {
    const msgEs = `¡Hola! Me interesa información sobre financiamiento para la ${motorcycle.name} ${motorcycle.year}. ¿Qué opciones tienen disponibles?`;
    const msgEn = `Hi! I'm interested in financing options for the ${motorcycle.name} ${motorcycle.year}. Could you share what's available?`;
    const message = encodeURIComponent(lang === "es" ? msgEs : msgEn);
    const whatsappUrl = `https://wa.me/+17862530995?text=${message}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const priceNum = Number(motorcycle.price || 0);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />

      {/* Card */}
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-brand/35 shadow-2xl bg-black/92">
        {/* Header (sticky) */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-brand/25 bg-black/90 backdrop-blur-md">
          <div className="min-w-0">
            <h2 className="truncate text-lg sm:text-2xl font-black text-white">
              {motorcycle.name}
            </h2>
            <p className="truncate text-xs sm:text-sm text-white/70">
              {motorcycle.brand} · {motorcycle.model}
            </p>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 border border-white/15 bg-white/5 hover:bg-white/10 transition"
            aria-label={t("modal.close")}
            title={t("modal.close")}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body scroll */}
        <div className="max-h-[calc(92vh-72px)] overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="grid lg:grid-cols-2 gap-5 sm:gap-7">
              {/* Image */}
              <div className="relative">
                <div className="rounded-2xl border border-white/10 bg-white overflow-hidden">
                  {/* Aspect ratio: más ancho en desktop */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-[16/10]">
                    <img
                      src={motorcycle.image}
                      alt={motorcycle.name}
                      className="absolute inset-0 w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-black/80 text-white border border-white/15">
                    {condLabel}
                  </span>
                  {motorcycle.featured ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-brand text-black border border-black/30">
                      {t("product.badge.featured")}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-5">
                {/* Description */}
                {desc ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-sm font-black text-white/90 mb-2">
                      {t("modal.description") ?? "Description"}
                    </h3>
                    <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ) : null}

                {/* Specs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-brand" />
                    <div className="min-w-0">
                      <p className="text-xs text-white/70 font-semibold">{t("modal.year")}</p>
                      <p className="text-base sm:text-lg text-white font-black">{motorcycle.year}</p>
                    </div>
                  </div>

                  {motorcycle.engine ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                      <Fuel className="w-5 h-5 text-brand" />
                      <div className="min-w-0">
                        <p className="text-xs text-white/70 font-semibold">{t("modal.engine")}</p>
                        <p className="text-base sm:text-lg text-white font-black truncate">
                          {motorcycle.engine}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                      <Fuel className="w-5 h-5 text-brand" />
                      <div className="min-w-0">
                        <p className="text-xs text-white/70 font-semibold">{t("modal.engine")}</p>
                        <p className="text-base sm:text-lg text-white font-black">—</p>
                      </div>
                    </div>
                  )}

                  {motorcycle.mileage ? (
                    <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                      <Gauge className="w-5 h-5 text-brand" />
                      <div className="min-w-0">
                        <p className="text-xs text-white/70 font-semibold">{t("modal.mileage")}</p>
                        <p className="text-base sm:text-lg text-white font-black">
                          {motorcycle.mileage.toLocaleString()} km
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Features */}
                {feat.length > 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h4 className="text-sm font-black text-white/90 mb-3">
                      {t("modal.features")}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {feat.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                        >
                          <Star className="w-4 h-4 text-brand mt-[2px]" />
                          <span className="text-sm text-white/90 font-semibold leading-snug">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Price + Actions */}
                <div className="rounded-2xl border border-brand/25 bg-gradient-to-b from-brand/20 to-black/40 p-4 sm:p-5">
                  {priceNum > 0 ? (
                    <div className="mb-4">
                      <p className="text-xs text-white/70 font-semibold">{t("modal.price") ?? "Price"}</p>
                      <p className="text-2xl sm:text-3xl font-black text-white">
                        {fmtMoney(priceNum)}
                      </p>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={onPhoneCall}
                      className="rounded-2xl px-4 py-3 font-black border border-white/15 bg-black/70 text-white
                                 hover:border-brand/60 hover:bg-black transition flex items-center justify-center gap-2"
                      aria-label={t("modal.contact")}
                      title={t("modal.contact")}
                    >
                      <Phone className="w-5 h-5 text-brand" />
                      <span>{t("modal.contact")}</span>
                    </button>

                    <button
                      onClick={handleFinancing}
                      className="rounded-2xl px-4 py-3 font-black border border-black/30 bg-brand text-black
                                 hover:brightness-110 transition flex items-center justify-center gap-2"
                    >
                      {t("modal.financing")}
                    </button>
                  </div>

                  <button
                    onClick={onWhatsApp}
                    className="mt-3 w-full rounded-2xl px-4 py-3 font-black border border-white/15 bg-emerald-600 text-white
                               hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                    aria-label={t("modal.whatsapp")}
                    title={t("modal.whatsapp")}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
                    </svg>
                    <span>{t("modal.whatsapp")}</span>
                  </button>
                </div>

                {/* Guarantees */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <Shield className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-1 text-brand" />
                    <p className="text-xs sm:text-sm font-black text-white">{t("guarantee.warranty")}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <Wrench className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-1 text-brand" />
                    <p className="text-xs sm:text-sm font-black text-white">{t("guarantee.service")}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <Star className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-1 text-brand" />
                    <p className="text-xs sm:text-sm font-black text-white">{t("guarantee.quality")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* bottom spacing */}
            <div className="h-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorcycleModal;
