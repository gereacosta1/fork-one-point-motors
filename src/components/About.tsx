import React, { useState } from 'react';
import { Award, Users, Clock, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import UnderlineGrow from './UnderlineGrow';
import { useI18n } from '../i18n/I18nProvider';

const About: React.FC = () => {
  const { t } = useI18n();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const storeImages = [
    '/IMG/Scooter-electrico (3).jpeg',
    '/IMG/electricBike2.jpeg',
    '/IMG/MOTO-TANK-200.jpeg',
    '/IMG/MOTO-XMT-250.jpeg',
    '/IMG/bici-electric-negra.jpeg',
    '/IMG/ELECTRIC SCOOTER.jpeg',
    '/IMG/scooter-azul.jpeg',
  ];

  const nextImage = () => setCurrentImageIndex((p) => (p + 1) % storeImages.length);
  const prevImage = () => setCurrentImageIndex((p) => (p - 1 + storeImages.length) % storeImages.length);

  const stats = [
    { icon: Award, number: '15+', textKey: 'about.stats.years' },
    { icon: Users, number: '5000+', textKey: 'about.stats.clients' },
    { icon: Clock, number: '24/7', textKey: 'about.stats.support' },
    { icon: Wrench, number: '100%', textKey: 'about.stats.quality' },
  ] as const;

  const services = [
    { id: 'new', icon: '🏍️', titleKey: 'about.services.new.title', descKey: 'about.services.new.desc' },
    { id: 'used', icon: '✅', titleKey: 'about.services.used.title', descKey: 'about.services.used.desc' },
    { id: 'fin', icon: '💳', titleKey: 'about.services.fin.title', descKey: 'about.services.fin.desc' },
    { id: 'tech', icon: '🔧', titleKey: 'about.services.tech.title', descKey: 'about.services.tech.desc' },
  ] as const;

  return (
    <section id="nosotros" className="bg-[#0d0e10] py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="mb-16 max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
            About one point motors
          </p>
          <h2 className="mb-6 text-4xl font-black leading-none text-white md:text-6xl">
            <UnderlineGrow>{t('about.title')}</UnderlineGrow>
          </h2>
          <p className="text-lg font-medium text-white/65 md:text-xl">
            {t('about.subtitle')}
          </p>
        </div>

        <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            >
              <div className="mb-5 inline-flex rounded-2xl border border-brand/20 bg-brand/10 p-3 text-brand">
                <stat.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-3xl font-black text-white md:text-4xl">{stat.number}</h3>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
                {t(stat.textKey)}
              </p>
            </div>
          ))}
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-brand">
                Why choose us
              </p>
              <h3 className="mb-5 text-3xl font-black text-white md:text-5xl">
                {t('about.trust.title')}
              </h3>
              <p className="mb-5 max-w-xl text-lg leading-relaxed text-white/68">
                {t('about.trust.p1')}
              </p>
              <p className="max-w-xl text-lg leading-relaxed text-white/68">
                {t('about.trust.p2')}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white">
                {t('about.chips.quality')}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white">
                {t('about.chips.prices')}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white">
                {t('about.chips.service')}
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#141518]">
            <div className="relative aspect-[16/11] w-full overflow-hidden">
              <img
                src={storeImages[currentImageIndex]}
                alt={t('about.gallery.alt')}
                className="h-full w-full object-cover transition duration-500"
                loading="lazy"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
            </div>

            <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center">
              <button
                onClick={prevImage}
                className="rounded-full border border-white/15 bg-black/55 p-3 text-white backdrop-blur-md transition hover:bg-black/80"
                aria-label={t('about.gallery.prev')}
                title={t('about.gallery.prev')}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center">
              <button
                onClick={nextImage}
                className="rounded-full border border-white/15 bg-black/55 p-3 text-white backdrop-blur-md transition hover:bg-black/80"
                aria-label={t('about.gallery.next')}
                title={t('about.gallery.next')}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {storeImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    index === currentImageIndex ? 'bg-brand' : 'bg-white/35'
                  }`}
                  aria-label={`${t('about.gallery.seeImage')} ${index + 1}`}
                  title={`${t('about.gallery.seeImage')} ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
                What we offer
              </p>
              <h3 className="text-3xl font-black text-white md:text-5xl">
                <UnderlineGrow>{t('about.services.title')}</UnderlineGrow>
              </h3>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map((s) => {
              const serviceTitle = t(s.titleKey);
              return (
                <button
                  key={s.id}
                  onClick={() => alert(`${t('about.services.moreInfo')} ${serviceTitle}`)}
                  className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6 text-left transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="mb-5 text-3xl" aria-hidden="true">
                    {s.icon}
                  </div>
                  <h4 className="mb-3 text-xl font-black text-white">{serviceTitle}</h4>
                  <p className="text-base leading-relaxed text-white/65">{t(s.descKey)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;