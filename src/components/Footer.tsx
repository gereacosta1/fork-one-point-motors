import React from 'react';
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ArrowUpRight,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const Footer: React.FC = () => {
  const { t } = useI18n();

  const socialLinks = [
    { id: 'facebook', icon: Facebook, href: 'https://facebook.com/' },
    { id: 'instagram', icon: Instagram, href: 'https://instagram.com/' },
    { id: 'twitter', icon: Twitter, href: 'https://twitter.com/' },
    { id: 'youtube', icon: Youtube, href: 'https://youtube.com/' },
  ];

  const quickLinks = [
    { id: 'home', label: 'Home', href: '#inicio' },
    { id: 'catalog', label: 'Catalog', href: '#catalogo' },
    { id: 'about', label: 'About', href: '#nosotros' },
    { id: 'contact', label: 'Contact', href: '#contacto' },
  ];

  const handleLinkClick = (href: string) => {
    const el = document.getElementById(href.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-white/8 bg-[#070708]">

      {/* glow top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
      <div className="absolute left-[20%] top-0 h-[200px] w-[200px] bg-brand/10 blur-[120px]" />

      <div className="relative container mx-auto px-6 py-20">

        {/* TOP */}
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr]">

          {/* BRAND */}
          <div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mb-6 flex items-center gap-4"
            >
              <img
                src="/IMG/One_Way_Motors_Logo-1.png"
                className="h-12 w-12 object-contain"
              />

              <div>
                <h3 className="text-2xl font-black text-white">
                  ONE POINT MOTORS
                </h3>
                <p className="text-[11px] uppercase tracking-[0.25em] text-brand">
                  Electric mobility
                </p>
              </div>
            </button>

            <p className="max-w-xl text-lg leading-relaxed text-white/60">
              Premium electric bikes, scooters and urban vehicles.
              Designed for performance, built for the future.
            </p>

            {/* SOCIAL */}
            <div className="mt-8 flex gap-3">
              {socialLinks.map((s) => (
                <button
                  key={s.id}
                  onClick={() => window.open(s.href, '_blank')}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <s.icon className="h-5 w-5 text-white" />
                </button>
              ))}
            </div>
          </div>

          {/* LINKS */}
          <div className="grid gap-12 sm:grid-cols-2">

            <div>
              <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-white/45">
                Navigation
              </p>

              <ul className="space-y-3">
                {quickLinks.map((l) => (
                  <li key={l.id}>
                    <button
                      onClick={() => handleLinkClick(l.href)}
                      className="flex items-center gap-2 text-white/70 hover:text-white transition"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-white/45">
                Services
              </p>

              <ul className="space-y-3">
                <li>
                  <span className="text-white/70">New vehicles</span>
                </li>
                <li>
                  <span className="text-white/70">Used vehicles</span>
                </li>
                <li>
                  <span className="text-white/70">Financing</span>
                </li>
                <li>
                  <span className="text-white/70">Technical service</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-16 border-t border-white/8 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">

          <p className="text-sm text-white/45">
            © {new Date().getFullYear()} ONE POINT MOTORS. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm text-white/50">
            <button className="hover:text-white">Terms</button>
            <button className="hover:text-white">Privacy</button>
            <button className="hover:text-white">Cookies</button>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;