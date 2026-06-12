import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LandingCTA = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-40 px-6">
      <div className="max-w-7xl mx-auto editorial-gradient rounded-[4rem] p-16 md:p-32 text-center text-white premium-shadow relative overflow-hidden reveal reveal-up active">
        <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-10"></div>
        <div className="relative z-10 space-y-12">
          <h2 className="text-display font-black text-5xl md:text-8xl leading-none">{t('landing.cta.title')}</h2>
          <p className="text-white/70 text-xl md:text-3xl font-light max-w-3xl mx-auto leading-relaxed">{t('landing.cta.subtitle')}</p>
          <div className="pt-8">
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-primary px-16 py-8 rounded-[2.5rem] font-display font-black text-2xl hover:shadow-2xl hover:scale-105 transition-all active:scale-95 premium-shadow"
            >
              {t('landing.cta.button')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingCTA;