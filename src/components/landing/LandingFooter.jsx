import React from 'react';
import { useTranslation } from 'react-i18next';

const LandingFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-24 border-t border-on-surface/5 glass-card">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-20">
        <div className="col-span-2 space-y-8">
          <span className="text-3xl font-black text-display flex items-center gap-4">
            <div className="w-12 h-12 editorial-gradient rounded-2xl flex items-center justify-center text-white premium-shadow">
              <span className="material-symbols-outlined !text-[24px]">shield</span>
            </div>
            HR Lite
          </span>
          <p className="text-on-surface-variant font-light text-xl max-w-md leading-relaxed opacity-60">
            {t('landing.footer.description')}
          </p>
        </div>
        <div className="space-y-8">
          <h5 className="font-display font-black text-xs uppercase tracking-[0.3em] opacity-40">{t('landing.footer.product')}</h5>
          <ul className="space-y-4">
            <li><a href="#features" className="font-bold opacity-60 hover:opacity-100 hover:text-primary transition-all">{t('landing.nav.features')}</a></li>
            <li><a href="#workflow" className="font-bold opacity-60 hover:opacity-100 hover:text-primary transition-all">{t('landing.nav.workflow')}</a></li>
            <li><a href="#analytics" className="font-bold opacity-60 hover:opacity-100 hover:text-primary transition-all">{t('landing.nav.analytics')}</a></li>
          </ul>
        </div>
        <div className="space-y-8">
          <h5 className="font-display font-black text-xs uppercase tracking-[0.3em] opacity-40">{t('landing.footer.company')}</h5>
          <ul className="space-y-4">
            <li><a href="/privacy-policy" className="font-bold opacity-60 hover:opacity-100 hover:text-primary transition-all">{t('landing.footer.privacy')}</a></li>
            <li><a href="/terms-of-service" className="font-bold opacity-60 hover:opacity-100 hover:text-primary transition-all">{t('landing.footer.terms')}</a></li>
            <li><a href="/contact-support" className="font-bold opacity-60 hover:opacity-100 hover:text-primary transition-all">Support</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 mt-24 pt-12 border-t border-on-surface/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
        <p className="text-sm font-bold">© {new Date().getFullYear()} HR Lite. Built for high-performance teams.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-primary transition-colors"><span className="material-symbols-outlined">public</span></a>
          <a href="#" className="hover:text-primary transition-colors"><span className="material-symbols-outlined">brand_awareness</span></a>
          <a href="#" className="hover:text-primary transition-colors"><span className="material-symbols-outlined">group</span></a>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;