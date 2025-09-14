import React from "react";
import { useI18n } from "../i18n/I18nProvider";

export default function LangToggle() {
  const { lang, setLang } = useI18n();

  const toggle = () => {
    const next = lang === "es" ? "en" : "es";
    setLang(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Change language"
      className="px-3 py-1 rounded-md border border-white/20 text-white hover:bg-white/10"
      title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      {/* Muestra hacia qué cambiaría */}
      {lang === "es" ? "EN" : "ES"}
    </button>
  );
}
