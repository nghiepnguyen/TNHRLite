import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

const LandingNavbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '#features', key: 'features' },
    { href: '#workflow', key: 'workflow' },
    { href: '#analytics', key: 'analytics' },
    { href: '#faq', key: 'faq' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/20 frosted-glass">
      <nav className="flex justify-between items-center w-full px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-16">
          <span
            className="text-2xl font-black tracking-tighter text-on-surface text-display cursor-pointer flex items-center gap-3"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 editorial-gradient rounded-2xl flex items-center justify-center text-white premium-shadow">
              <span className="material-symbols-outlined !text-[20px]">shield</span>
            </div>
            HR Lite
          </span>
          <div className="hidden md:flex gap-10">
            {navLinks.map(link => (
              <a
                key={link.key}
                className="font-bold text-xs uppercase tracking-widest text-on-surface/60 hover:text-primary transition-all duration-300"
                href={link.href}
              >
                {t(`landing.nav.${link.key}`)}
              </a>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button
            onClick={() => navigate('/login')}
            className="hidden sm:flex editorial-gradient text-white px-8 py-3 rounded-2xl font-display font-bold text-sm hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 premium-shadow"
          >
            {t('landing.nav.getStarted')}
          </button>
          
          <button 
            className="md:hidden p-3 glass-card rounded-xl text-on-surface"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="material-symbols-outlined">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass-card border-b border-surface-container-high shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 z-50">
          <div className="flex flex-col p-8 gap-6">
            {navLinks.map(link => (
              <a
                key={link.key}
                className="font-bold text-lg p-2"
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {t(`landing.nav.${link.key}`)}
              </a>
            ))}
            <hr className="my-2 border-surface-container-high opacity-20" />
            <button
              onClick={() => navigate('/login')}
              className="editorial-gradient text-white px-5 py-4 rounded-2xl font-display font-bold text-center premium-shadow"
            >
              {t('landing.nav.getStarted')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;