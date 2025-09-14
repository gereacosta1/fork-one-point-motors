import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const Footer: React.FC = () => {
  const { t } = useI18n();

  const socialLinks = [
    { id: 'facebook',  icon: Facebook,  href: 'https://facebook.com/motocentral',  labelKey: 'social.facebook' },
    { id: 'instagram', icon: Instagram, href: 'https://instagram.com/motocentral', labelKey: 'social.instagram' },
    { id: 'twitter',   icon: Twitter,   href: 'https://twitter.com/motocentral',   labelKey: 'social.twitter' },
    { id: 'youtube',   icon: Youtube,   href: 'https://youtube.com/motocentral',   labelKey: 'social.youtube' },
  ] as const;

  const quickLinks = [
    { id: 'home',     textKey: 'nav.home',    href: '#inicio' },
    { id: 'catalog',  textKey: 'nav.catalog', href: '#catalogo' },
    { id: 'about',    textKey: 'nav.about',   href: '#nosotros' },
    { id: 'contact',  textKey: 'nav.contact', href: '#contacto' },
  ] as const;

  const services = [
    { id: 'new',       textKey: 'services.new',       href: '#catalogo' },
    { id: 'used',      textKey: 'services.used',      href: '#catalogo' },
    { id: 'finance',   textKey: 'services.finance',   href: '#contacto' },
    { id: 'tech',      textKey: 'services.tech',      href: '#contacto' },
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
    <footer className="bg-black border-top border-t border-brand-600">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center space-x-2 mb-4 hover:scale-105 transition-transform duration-300"
              aria-label="Go to top"
              title="Top"
            >
              <div className="bg-brand-600 p-2 rounded-lg">
                <img
                  src="/IMG/One_Way_Motors_Logo-1.png"
                  alt="Logo de SUNRISE STORE"
                  className="w-10 h-10 object-contain rounded-lg"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-wide">SUNRISE STORE</h3>
                <p className="text-lg text-brand-400 font-bold">{t('footer.tagline')}</p>
              </div>
            </button>

            <p className="text-white text-lg font-bold mb-6 max-w-md">
              {t('footer.desc')}
            </p>

            <div className="flex space-x-4">
              {socialLinks.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSocialClick(s.href)}
                  className="bg-brand-600/90 backdrop-blur-md border border-brand-600/50 p-3 rounded-lg hover:bg-brand-700 transition-all duration-300 transform hover:scale-110 shadow-lg"
                  aria-label={t(s.labelKey)}
                  title={t(s.labelKey)}
                >
                  <s.icon className="w-5 h-5 text-white" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-black text-white mb-4">{t('footer.quickLinks.title')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleLinkClick(link.href)}
                    className="text-white text-lg font-bold hover:text-brand-400 transition-colors"
                  >
                    {t(link.textKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xl font-black text-white mb-4">{t('footer.services.title')}</h4>
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => handleLinkClick(s.href)}
                    className="text-white text-lg font-bold hover:text-brand-400 transition-colors"
                  >
                    {t(s.textKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-600 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white text-lg font-bold">
            © {new Date().getFullYear()} SUNRISE STORE. {t('footer.rights')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button
              onClick={handleTermsClick}
              className="text-white hover:text-brand-400 text-lg font-bold transition-colors"
            >
              {t('footer.legal.terms')}
            </button>
            <button
              onClick={handlePrivacyClick}
              className="text-white hover:text-brand-400 text-lg font-bold transition-colors"
            >
              {t('footer.legal.privacy')}
            </button>
            <button
              onClick={handleCookiesClick}
              className="text-white hover:text-brand-400 text-lg font-bold transition-colors"
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
