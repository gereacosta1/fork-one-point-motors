import React from 'react';
import { ArrowRight, Star, Shield, Wrench } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

interface HeroProps {
  onNavigate: (section: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { t } = useI18n();

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/60 z-10"></div>
        <img
          src="https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080"
          alt="Motorcycle Hero"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight">
            {t('hero.title.pre')}{' '}
            <span className="text-brand">{t('hero.title.highlight')}</span>
            <br />
            {t('hero.title.post')}
          </h1>

          <p className="text-2xl md:text-3xl lg:text-4xl text-white mb-12 max-w-3xl mx-auto font-bold">
            {t('hero.subtitle')}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button 
              onClick={() => onNavigate('catalogo')}
              className="bg-brand backdrop-blur-md border border-brand/50 text-white px-12 py-4 rounded-lg text-xl font-black hover:bg-brand-hover transition-all duration-300 flex items-center justify-center space-x-3 group transform hover:scale-105 shadow-2xl"
            >
              <span>{t('hero.cta.explore')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => onNavigate('contacto')}
              className="border-2 border-brand/80 bg-black/30 backdrop-blur-md text-brand px-12 py-4 rounded-lg text-xl font-black hover:bg-brand-hover hover:text-white transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              {t('hero.cta.finance')}
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 text-white">
              <Star className="w-8 h-8 text-brand" />
              <span className="text-xl md:text-2xl font-bold">{t('hero.feature.quality')}</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-white">
              <Shield className="w-8 h-8 text-brand" />
              <span className="text-xl md:text-2xl font-bold">{t('hero.feature.warranty')}</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-white">
              <Wrench className="w-8 h-8 text-brand" />
              <span className="text-xl md:text-2xl font-bold">{t('hero.feature.service')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
