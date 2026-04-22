import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, ArrowUpRight } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const Footer: React.FC = () => {
  const { t } = useI18n();

  const socialLinks = [
    { id: 'facebook', icon: Facebook, href: 'https://facebook.com/', labelKey: 'social.facebook' },
    { id: 'instagram', icon: Instagram, href: 'https://instagram.com/', labelKey: 'social.instagram' },
    { id: 'twitter', icon: Twitter, href: 'https://twitter.com/', labelKey: 'social.twitter' },
    { id: 'youtube', icon: Youtube, href: 'https://youtube.com/', labelKey: 'social.youtube' },
  ] as const;

  const quickLinks = [
    { id: 'home', textKey: 'nav.home', href: '#inicio' },
    { id: 'catalog', textKey: 'nav.catalog', href: '#catalogo' },
    { id: 'about', textKey: 'nav.about', href: '#nosotros' },
    { id: 'contact', textKey: 'nav.contact', href: '#contacto' },
  ] as const;

  const services = [
    { id: 'new', textKey: 'services.new', href: '#catalogo' },
    { id: 'used', textKey: 'services.used', href: '#catalogo' },
    { id: 'finance', textKey: 'services.finance', href: '#contacto' },
    { id: 'tech', textKey: 'services.tech', href: '#contacto' },
  ] as const;

  const handleSocialClick = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.substring(1));
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const handleTermsClick = () => {
    alert(t('footer.legal.termsMsg'));
  };

  const handlePrivacyClick = () => {
    alert(t('footer.legal.privacyMsg'));
  };

  const handleCookiesClick = () => {
    alert(t('footer.legal.cookiesMsg'));
  };

  return (
    <footer className="border-t border-white/8 bg-[#09090a]">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mb-6 flex items-center gap-3 text-left"
              aria-label="Go to top"
              title="Top"
            >
              <img
                src="/IMG/One_Point_Motors_Logo.png"
                alt="Logo de ONE POINT MOTORS"
                className="h-11 w-11 rounded-xl object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/IMG/One_Way_Motors_Logo-1.png';
                }}
              />
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">ONE POINT MOTORS</h3>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                  {t('footer.tagline')}
                </p>
              </div>
            </button>

            <p className="max-w-xl text-lg leading-relaxed text-white/62">{t('footer.desc')}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {socialLinks.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSocialClick(s.href)}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white transition hover:border-white/20 hover:bg-white/[0.06]"
                  aria-label={t(s.labelKey)}
                  title={t(s.labelKey)}
                >
                  <s.icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-white/45">
              {t('footer.quickLinks.title')}
            </p>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="text-base font-semibold text-white/70 transition hover:text-white"
                  >
                    {t(link.textKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-white/45">
              {t('footer.services.title')}
            </p>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => handleLinkClick(s.href)}
                    className="inline-flex items-center gap-2 text-base font-semibold text-white/70 transition hover:text-white"
                  >
                    {t(s.textKey)}
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-white/8 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-white/45">
            © {new Date().getFullYear()} ONE POINT MOTORS. {t('footer.rights')}
          </p>

          <div className="flex flex-wrap gap-5">
            <button
              onClick={handleTermsClick}
              className="text-sm font-semibold text-white/50 transition hover:text-white"
            >
              {t('footer.legal.terms')}
            </button>
            <button
              onClick={handlePrivacyClick}
              className="text-sm font-semibold text-white/50 transition hover:text-white"
            >
              {t('footer.legal.privacy')}
            </button>
            <button
              onClick={handleCookiesClick}
              className="text-sm font-semibold text-white/50 transition hover:text-white"
            >
              {t('footer.legal.cookies')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;