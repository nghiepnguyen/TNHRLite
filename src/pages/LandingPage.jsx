import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import LanguageSwitcher from '../components/LanguageSwitcher';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Initialize scroll animations
  useScrollReveal();

  // FAQ local state
  const [openFaq, setOpenFaq] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCTA = () => {
    navigate('/login');
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div
      className="text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden"
      style={{ backgroundColor: 'rgb(250, 249, 246)' }}
    >
      {/* TopAppBar */}
      <header className="bg-[#FAF9F6]/85 dark:bg-[#1F1F1F]/85 backdrop-blur-md fixed top-0 w-full z-50 border-b border-[#1F1F1F]/5">
        <nav className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-12">
            <span
              className="text-xl font-extrabold tracking-tighter text-[#1F1F1F] dark:text-[#FAF9F6] font-headline cursor-pointer flex items-center gap-2"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 editorial-gradient rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined !text-[18px]">shield</span>
              </div>
              HR Lite
            </span>
            <div className="hidden md:flex gap-8">
              <a className="font-semibold text-sm tracking-tight text-[#1F1F1F]/70 dark:text-[#FAF9F6]/70 hover:text-primary transition-colors duration-200" href="#features">{t('landing.nav.features')}</a>
              <a className="font-semibold text-sm tracking-tight text-[#1F1F1F]/70 dark:text-[#FAF9F6]/70 hover:text-primary transition-colors duration-200" href="#workflow">{t('landing.nav.workflow')}</a>
              <a className="font-semibold text-sm tracking-tight text-[#1F1F1F]/70 dark:text-[#FAF9F6]/70 hover:text-primary transition-colors duration-200" href="#analytics">{t('landing.nav.analytics')}</a>
              <a className="font-semibold text-sm tracking-tight text-[#1F1F1F]/70 dark:text-[#FAF9F6]/70 hover:text-primary transition-colors duration-200" href="#faq">{t('landing.nav.faq')}</a>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            <div className="mr-2">
              <LanguageSwitcher />
            </div>
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:block editorial-gradient text-white px-5 py-2.5 rounded-lg font-headline font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
            >
              {t('landing.nav.getStarted')}
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-[#1F1F1F] flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="material-symbols-outlined text-2xl">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-surface-container-high shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col p-6 gap-4">
              <a className="font-bold text-lg p-2" href="#features" onClick={() => setIsMenuOpen(false)}>{t('landing.nav.features')}</a>
              <a className="font-bold text-lg p-2" href="#workflow" onClick={() => setIsMenuOpen(false)}>{t('landing.nav.workflow')}</a>
              <a className="font-bold text-lg p-2" href="#analytics" onClick={() => setIsMenuOpen(false)}>{t('landing.nav.analytics')}</a>
              <a className="font-bold text-lg p-2" href="#faq" onClick={() => setIsMenuOpen(false)}>{t('landing.nav.faq')}</a>
              <hr className="my-2 border-surface-container-high" />
              <button
                onClick={() => navigate('/login')}
                className="editorial-gradient text-white px-5 py-4 rounded-xl font-headline font-bold text-center"
              >
                {t('landing.nav.getStarted')}
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="pt-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-24 md:mb-32">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="space-y-6 md:space-y-8 text-center md:text-left reveal reveal-left">
              <span
                className="inline-block uppercase tracking-[0.1em] font-bold text-[10px] md:text-xs px-3 py-1 rounded-full reveal reveal-up reveal-delay-200"
                style={{ color: 'rgb(79, 70, 229)', backgroundColor: 'rgb(224, 231, 255)' }}
              >
                {t('landing.hero.badge')}
              </span>
              <h1 className="font-headline font-extrabold text-3xl sm:text-5xl lg:text-6xl text-on-surface leading-[1.1] tracking-tight">
                {t('landing.hero.title')}
              </h1>
              <p className="text-on-surface-variant text-sm sm:text-base md:text-lg max-w-md mx-auto md:mx-0 font-light leading-relaxed reveal reveal-up reveal-delay-300">
                {t('landing.hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start reveal reveal-up reveal-delay-400">
                <button
                  onClick={handleCTA}
                  className="editorial-gradient text-white px-10 py-5 rounded-xl font-headline font-bold text-lg hover:opacity-90 transition-opacity w-full sm:w-auto shadow-xl shadow-primary/20"
                >
                  {t('landing.hero.getStarted')}
                </button>
              </div>
            </div>
            <div className="relative mt-12 md:mt-0 reveal reveal-right reveal-delay-300">
              <div className="bg-surface-container-low rounded-2xl p-4 shadow-3xl shadow-on-surface/5 border border-white/50">
                {/* Realistic Dashboard Preview */}
                <div className="bg-white rounded-lg overflow-hidden border border-surface-container-high shadow-sm">
                  <div className="p-4 border-b border-surface-container-high flex justify-between items-center" style={{ backgroundColor: 'rgb(248, 250, 252)' }}>
                    <span className="font-headline font-bold text-sm">{t('landing.hero.preview.jobList')}</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">{t('landing.hero.preview.status.active')}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">{t('landing.hero.preview.status.onHold')}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs reveal reveal-up reveal-delay-400">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">PD</div>
                        <div>
                          <div className="font-bold">{t('landing.hero.preview.job1.title')}</div>
                          <div className="text-on-surface-variant">{t('landing.hero.preview.job1.owner')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{t('landing.hero.preview.job1.deadline')}</div>
                        <div className="text-primary font-bold uppercase text-[10px]">{t('landing.hero.preview.status.active')}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs opacity-60 reveal reveal-up reveal-delay-500">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-tertiary/10 flex items-center justify-center text-tertiary font-bold">FE</div>
                        <div>
                          <div className="font-bold">{t('landing.hero.preview.job2.title')}</div>
                          <div className="text-on-surface-variant">{t('landing.hero.preview.job2.owner')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{t('landing.hero.preview.job2.deadline')}</div>
                        <div className="text-amber-600 font-bold uppercase text-[10px]">{t('landing.hero.preview.status.onHold')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating Stats - Hidden on Small Mobile, Repositioned on Desktop */}
              <div className="hidden sm:block absolute -top-8 -right-4 bg-white p-5 rounded-xl shadow-xl border border-surface-container-high space-y-1 transform transition-transform hover:scale-105 reveal reveal-up reveal-delay-500">
                <span className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{t('landing.hero.stats.activeJobs')}</span>
                <span className="block text-3xl font-headline font-black text-primary">12</span>
              </div>
              <div className="hidden sm:block absolute -bottom-10 -left-6 bg-white p-5 rounded-xl shadow-xl border border-surface-container-high space-y-1 transform transition-transform hover:scale-105 reveal reveal-up reveal-delay-600">
                <span className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{t('landing.hero.stats.matchScore')}</span>
                <span className="block text-3xl font-headline font-black" style={{ color: 'rgb(124, 58, 237)' }}>92%</span>
              </div>
              <div className="hidden lg:flex absolute top-1/2 -right-16 transform -translate-y-1/2 flex-col gap-4 reveal reveal-right reveal-delay-700">
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-surface-container-high">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: 'rgb(79, 70, 229)' }}></div>
                    <div>
                      <span className="block text-[10px] font-bold text-on-surface uppercase pr-4">{t('landing.hero.stats.candidates')}</span>
                      <span className="block text-xl font-headline font-black">84</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-surface-container-high">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: 'rgb(124, 58, 237)' }}></div>
                    <div>
                      <span className="block text-[10px] font-bold text-on-surface uppercase pr-4">{t('landing.hero.stats.progress')}</span>
                      <span className="block text-xl font-headline font-black">45%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24" style={{ backgroundColor: 'rgb(248, 250, 252)' }}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-16 reveal reveal-up">
              <h2 className="font-headline font-extrabold text-3xl mb-4 max-w-lg">{t('landing.painPoints.title')}</h2>
            </div>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-7 bg-white p-10 rounded-2xl flex flex-col justify-between min-h-[300px] shadow-sm transition-shadow hover:shadow-md reveal reveal-left">
                <span className="material-symbols-outlined text-tertiary text-4xl mb-6">scatter_plot</span>
                <div>
                  <h3 className="font-headline font-bold text-3xl mb-4 text-on-surface tracking-tight">{t('landing.painPoints.items.scattered.title')}</h3>
                  <p className="text-on-surface-variant leading-relaxed text-lg">{t('landing.painPoints.items.scattered.desc')}</p>
                </div>
              </div>
              <div
                className="col-span-12 md:col-span-5 p-10 rounded-2xl flex flex-col justify-between hover:bg-surface-container-highest transition-colors reveal reveal-right"
                style={{ backgroundColor: 'rgb(226, 232, 240)' }}
              >
                <span className="material-symbols-outlined text-tertiary text-4xl mb-6">person_search</span>
                <div>
                  <h3 className="font-headline font-bold text-3xl mb-4 text-on-surface tracking-tight">{t('landing.painPoints.items.tracking.title')}</h3>
                  <p className="text-on-surface-variant leading-relaxed text-lg">{t('landing.painPoints.items.tracking.desc')}</p>
                </div>
              </div>
              <div
                className="col-span-12 md:col-span-4 p-10 rounded-2xl shadow-sm reveal reveal-up"
                style={{ backgroundColor: 'rgb(224, 231, 255)' }}
              >
                <span className="material-symbols-outlined text-primary text-4xl mb-6 font-bold">speed</span>
                <h3 className="font-headline font-bold text-xl mb-3 text-on-primary-container tracking-tight">{t('landing.painPoints.items.screening.title')}</h3>
                <p className="text-on-primary-container text-sm leading-relaxed">{t('landing.painPoints.items.screening.desc')}</p>
              </div>
              <div className="col-span-12 md:col-span-4 bg-white p-10 rounded-2xl shadow-sm border border-surface-container-high hover:border-tertiary/20 transition-colors reveal reveal-up reveal-delay-100">
                <span className="material-symbols-outlined text-tertiary text-4xl mb-6">visibility_off</span>
                <h3 className="font-headline font-bold text-xl mb-3 text-on-surface tracking-tight">{t('landing.painPoints.items.pipeline.title')}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{t('landing.painPoints.items.pipeline.desc')}</p>
              </div>
              <div
                className="col-span-12 md:col-span-4 text-white p-10 rounded-2xl shadow-xl shadow-primary/10 transition-transform hover:scale-[1.02] reveal reveal-up reveal-delay-200"
                style={{ backgroundColor: 'rgb(79, 70, 229)' }}
              >
                <span className="material-symbols-outlined text-white text-4xl mb-6">analytics</span>
                <h3 className="font-headline font-bold text-xl mb-3 tracking-tight">{t('landing.painPoints.items.data.title')}</h3>
                <p className="text-white text-sm leading-relaxed font-medium">{t('landing.painPoints.items.data.desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Overview */}
        <section className="py-24 md:py-32 max-w-7xl mx-auto px-6 md:px-8 overflow-hidden" id="workflow">
          <div className="text-center mb-16 md:mb-20 reveal reveal-up">
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl mb-4">{t('landing.workflow.title')}</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto text-sm md:text-base px-4">{t('landing.workflow.subtitle')}</p>
          </div>
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-12 md:gap-8 px-4 md:px-12">
            {/* Connection Lines */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-highest -z-10 hidden md:block"></div>
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-surface-container-highest -z-0 md:hidden opacity-30"></div>

            <div className="flex flex-col items-center group bg-white p-2 md:p-0 rounded-full md:bg-transparent flex-shrink-0 reveal reveal-up">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-md flex items-center justify-center border-4 border-surface group-hover:border-primary transition-all duration-300 flex-shrink-0">
                <span className="material-symbols-outlined text-primary !text-2xl md:!text-3xl">add_circle</span>
              </div>
              <span className="mt-4 font-headline font-bold text-[10px] md:text-sm uppercase tracking-widest text-center">{t('landing.workflow.steps.createJob')}</span>
            </div>
            
            <div className="flex flex-col items-center group bg-white p-2 md:p-0 rounded-full md:bg-transparent flex-shrink-0 reveal reveal-up reveal-delay-100">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-md flex items-center justify-center border-4 border-surface group-hover:border-primary transition-all duration-300 flex-shrink-0">
                <span className="material-symbols-outlined text-primary !text-2xl md:!text-3xl">group_add</span>
              </div>
              <span className="mt-4 font-headline font-bold text-[10px] md:text-sm uppercase tracking-widest text-center">{t('landing.workflow.steps.addCandidate')}</span>
            </div>

            <div className="flex flex-col items-center group bg-white p-4 md:p-0 rounded-full md:bg-transparent relative flex-shrink-0 reveal reveal-up reveal-delay-200">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full editorial-gradient shadow-xl flex items-center justify-center border-8 border-surface md:scale-110 mb-2 md:mb-0 flex-shrink-0 z-10 transition-transform duration-300 group-hover:scale-105">
                <span className="material-symbols-outlined text-white !text-4xl md:!text-5xl">hub</span>
              </div>
              <span className="mt-4 font-headline font-extrabold text-primary text-[10px] md:text-sm uppercase tracking-widest text-center">{t('landing.workflow.steps.matching')}</span>
            </div>

            <div className="flex flex-col items-center group bg-white p-2 md:p-0 rounded-full md:bg-transparent flex-shrink-0 reveal reveal-up reveal-delay-300">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-md flex items-center justify-center border-4 border-surface group-hover:border-primary transition-all duration-300 flex-shrink-0">
                <span className="material-symbols-outlined text-primary !text-2xl md:!text-3xl">view_kanban</span>
              </div>
              <span className="mt-4 font-headline font-bold text-[10px] md:text-sm uppercase tracking-widest text-center">{t('landing.workflow.steps.pipeline')}</span>
            </div>

            <div className="flex flex-col items-center group bg-white p-2 md:p-0 rounded-full md:bg-transparent flex-shrink-0 reveal reveal-up reveal-delay-400">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-md flex items-center justify-center border-4 border-surface group-hover:border-primary transition-all duration-300 flex-shrink-0">
                <span className="material-symbols-outlined text-primary !text-2xl md:!text-3xl">monitoring</span>
              </div>
              <span className="mt-4 font-headline font-bold text-[10px] md:text-sm uppercase tracking-widest text-center">{t('landing.workflow.steps.analytics')}</span>
            </div>
          </div>
        </section>

        {/* Feature Spotlights */}
        <section className="space-y-32 py-20" id="features">
          {/* 1. Job List */}
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1">
              <div className="rounded-lg p-4 sm:p-8 border border-white/50 shadow-sm" style={{ backgroundColor: 'rgb(248, 250, 252)' }}>
                <div className="bg-white rounded-lg p-5 sm:p-6 space-y-4 shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-headline font-bold text-sm sm:text-base">{t('landing.features.jobCenter.preview.title')}</h4>
                    <button className="text-primary text-[10px] sm:text-sm font-bold">{t('landing.features.jobCenter.preview.add')}</button>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-surface-container-low rounded flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-bold">UI/UX Designer</span>
                        <span className="text-[10px] text-on-surface-variant">Due: Nov 30 • Alex D.</span>
                      </div>
                      <span className="text-[8px] sm:text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold uppercase">{t('landing.features.jobCenter.preview.status.active')}</span>
                    </div>
                    <div className="p-3 border border-surface-container-high rounded flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-bold">Backend Dev (Go)</span>
                        <span className="text-[10px] text-on-surface-variant">Due: Dec 15 • UK Ng.</span>
                      </div>
                      <span className="text-[8px] sm:text-[10px] px-2 py-1 bg-indigo-100 text-primary rounded-full font-bold uppercase whitespace-nowrap">{t('landing.features.jobCenter.preview.status.completed')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6 reveal reveal-right">
              <span className="text-tertiary font-headline font-bold uppercase tracking-widest text-xs reveal reveal-up reveal-delay-100">{t('landing.features.jobCenter.tag')}</span>
              <h2 className="font-headline font-extrabold text-3xl sm:text-4xl">{t('landing.features.jobCenter.title')}</h2>
              <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed reveal reveal-up reveal-delay-200">{t('landing.features.jobCenter.desc')}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
                {Array.isArray(t('landing.features.jobCenter.points', { returnObjects: true })) && 
                 t('landing.features.jobCenter.points', { returnObjects: true }).map((point, i) => (
                  <li key={i} className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2. Candidate Cards */}
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center reveal reveal-up">
            <div className="space-y-6 reveal reveal-left">
              <span className="text-primary font-headline font-bold uppercase tracking-widest text-xs reveal reveal-up reveal-delay-100">{t('landing.features.candidateProfile.tag')}</span>
              <h2 className="font-headline font-extrabold text-4xl">{t('landing.features.candidateProfile.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed reveal reveal-up reveal-delay-200">{t('landing.features.candidateProfile.desc')}</p>
              <ul className="space-y-4">
                {Array.isArray(t('landing.features.candidateProfile.points', { returnObjects: true })) && 
                 t('landing.features.candidateProfile.points', { returnObjects: true }).map((point, i) => (
                  <li key={i} className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="rounded-lg p-8 border border-white/50 shadow-sm relative" style={{ backgroundColor: 'rgb(226, 232, 240)' }}>
                <div className="bg-white rounded-lg shadow-lg p-6 border border-surface-container-high">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
                    </div>
                    <div>
                      <h5 className="font-headline font-bold text-xl">Nam Hoang Nguyen</h5>
                      <p className="text-sm text-on-surface-variant">Senior Product Designer</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                    <div>
                      <span className="block opacity-50 uppercase font-bold mb-1">{t('landing.features.candidateProfile.preview.expLabel')}</span>
                      <span className="font-bold">{t('landing.features.candidateProfile.preview.exp')}</span>
                    </div>
                    <div>
                      <span className="block opacity-50 uppercase font-bold mb-1">{t('landing.features.candidateProfile.preview.sourceLabel')}</span>
                      <span className="font-bold">{t('landing.features.candidateProfile.preview.source')}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-surface-container rounded text-[10px] font-bold">Figma</span>
                      <span className="px-2 py-1 bg-surface-container rounded text-[10px] font-bold">Prototyping</span>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-[10px] font-bold">Great Profile</span>
                    </div>
                    <div className="p-3 bg-surface-container-low rounded border-l-4 border-primary italic text-xs">
                      {t('landing.features.candidateProfile.preview.quote')}
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg border border-surface-container-high">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-sm font-bold">{t('landing.features.candidateProfile.preview.recommend')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Match Score */}
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center reveal reveal-up">
            <div className="order-2 md:order-1 reveal reveal-left">
              <div
                className="rounded-lg p-12 border border-primary/10 flex flex-col items-center justify-center min-h-[400px]"
                style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)' }}
              >
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle cx="96" cy="96" fill="transparent" r="88" stroke="rgb(226, 232, 240)" strokeWidth="12"></circle>
                      <circle className="text-primary" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset="44.23" strokeWidth="12"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-headline font-extrabold">92%</span>
                      <span className="text-xs uppercase tracking-widest font-bold opacity-50 text-center px-4">{t('landing.features.matchScore.preview.label')}</span>
                    </div>
                  </div>
                </div>
                <div className="w-full max-w-xs bg-white rounded-lg p-6 shadow-sm border border-surface-container-high space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span>{t('landing.features.matchScore.preview.skills')}</span>
                    <span className="font-bold text-primary">95%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'rgb(241, 245, 249)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: '95%', backgroundColor: 'rgb(79, 70, 229)' }}></div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>{t('landing.features.matchScore.preview.exp')}</span>
                    <span className="font-bold text-primary">88%</span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'rgb(241, 245, 249)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: '88%', backgroundColor: 'rgb(79, 70, 229)' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6 reveal reveal-right">
              <span className="text-tertiary font-headline font-bold uppercase tracking-widest text-xs reveal reveal-up reveal-delay-100">{t('landing.features.matchScore.tag')}</span>
              <h2 className="font-headline font-extrabold text-4xl">{t('landing.features.matchScore.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed reveal reveal-up reveal-delay-200">{t('landing.features.matchScore.desc')}</p>
              <ul className="space-y-4">
                {Array.isArray(t('landing.features.matchScore.points', { returnObjects: true })) && 
                 t('landing.features.matchScore.points', { returnObjects: true }).map((point, i) => (
                  <li key={i} className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-tertiary !text-[18px] flex-shrink-0">check_circle</span>
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4. Kanban Pipeline */}
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center reveal reveal-up">
            <div className="space-y-6 reveal reveal-left">
              <span className="text-primary font-headline font-bold uppercase tracking-widest text-xs">{t('landing.features.visualPipeline.tag')}</span>
              <h2 className="font-headline font-extrabold text-4xl">{t('landing.features.visualPipeline.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t('landing.features.visualPipeline.desc')}</p>
              <ul className="space-y-4">
                {Array.isArray(t('landing.features.visualPipeline.points', { returnObjects: true })) && 
                 t('landing.features.visualPipeline.points', { returnObjects: true }).map((point, i) => (
                  <li key={i} className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-primary !text-[18px] flex-shrink-0">check_circle</span>
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold uppercase opacity-40">{t('landing.features.visualPipeline.preview.screening')}</div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-surface-container-high">
                    <div className="font-bold text-sm">Elena R.</div>
                    <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tight">Full-stack Dev</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-surface-container-high">
                    <div className="font-bold text-sm">Marcus W.</div>
                    <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tight">UI Designer</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-[10px] font-bold uppercase text-primary">{t('landing.features.visualPipeline.preview.interview')}</div>
                  <div className="editorial-gradient text-white p-4 rounded-lg shadow-md">
                    <div className="font-bold text-sm">Sarah K.</div>
                    <div className="text-[10px] text-white/70 uppercase font-black">Product Lead</div>
                  </div>
                  <div className="text-[10px] font-bold uppercase opacity-20">{t('landing.features.visualPipeline.preview.offer')}</div>
                  <div className="bg-surface-container-low/50 border-2 border-dashed border-surface-container-high p-4 rounded-lg h-24 flex items-center justify-center">
                    <span className="material-symbols-outlined opacity-20">add</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Analytics Widgets */}
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center reveal reveal-up" id="analytics">
            <div className="order-2 md:order-1 reveal reveal-left">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-surface-container-high h-44 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase opacity-40">{t('landing.features.dataDriven.preview.conversion')}</span>
                  <span className="text-4xl font-headline font-extrabold text-primary">24%</span>
                  <span className="text-[10px] text-green-600 font-bold">{t('landing.features.dataDriven.preview.trend')}</span>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-surface-container-high h-44 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase opacity-40">{t('landing.features.dataDriven.preview.avgHiring')}</span>
                  <span className="text-4xl font-headline font-extrabold text-tertiary">{t('landing.features.dataDriven.preview.hiringTime')}</span>
                  <span className="text-[10px] opacity-40 italic">{t('landing.features.dataDriven.preview.timeDesc')}</span>
                </div>
                <div className="col-span-2 bg-white p-6 rounded-lg shadow-sm border border-surface-container-high h-48">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase opacity-40">{t('landing.features.dataDriven.preview.workload')}</span>
                    <span className="text-[10px] font-bold text-primary">{t('landing.features.dataDriven.preview.topSource')}</span>
                  </div>
                  <div className="flex items-end justify-between h-24 mt-4 gap-2">
                    <div className="w-full rounded-t-sm" style={{ height: '40%', backgroundColor: 'rgb(226, 232, 240)' }}></div>
                    <div className="w-full rounded-t-sm" style={{ height: '60%', backgroundColor: 'rgb(226, 232, 240)' }}></div>
                    <div className="w-full rounded-t-sm" style={{ height: '90%', backgroundColor: 'rgb(79, 70, 229)' }}></div>
                    <div className="w-full rounded-t-sm" style={{ height: '50%', backgroundColor: 'rgb(226, 232, 240)' }}></div>
                    <div className="w-full rounded-t-sm" style={{ height: '70%', backgroundColor: 'rgb(226, 232, 240)' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <span className="text-tertiary font-headline font-bold uppercase tracking-widest text-xs">{t('landing.features.dataDriven.tag')}</span>
              <h2 className="font-headline font-extrabold text-4xl">{t('landing.features.dataDriven.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t('landing.features.dataDriven.desc')}</p>
              <ul className="space-y-4">
                {Array.isArray(t('landing.features.dataDriven.points', { returnObjects: true })) && 
                 t('landing.features.dataDriven.points', { returnObjects: true }).map((point, i) => (
                  <li key={i} className="flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-secondary !text-[18px] flex-shrink-0">check_circle</span>
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-32 reveal reveal-up" style={{ backgroundColor: 'rgba(226, 232, 240, 0.5)' }}>
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="font-headline font-extrabold text-4xl mb-16 text-center reveal reveal-up">{t('landing.howItWorks.title')}</h2>
            <div className="grid md:grid-cols-3 gap-12">
              {Array.isArray(t('landing.howItWorks.steps', { returnObjects: true })) && 
               t('landing.howItWorks.steps', { returnObjects: true }).map((step, i) => (
                <div key={i} className="space-y-6 reveal reveal-up" style={{ transitionDelay: `${(i+1)*100}ms` }}>
                  <div className="text-6xl font-headline font-extrabold" style={{ color: 'rgb(203, 213, 225)' }}>0{i+1}</div>
                  <h3 className="font-headline font-bold text-xl">{step.title}</h3>
                  <p className="text-on-surface-variant">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-32 max-w-7xl mx-auto px-8 reveal reveal-up">
          <h2 className="font-headline font-extrabold text-3xl mb-12 text-on-surface reveal reveal-up">{t('landing.useCases.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {t('landing.useCases.items', { returnObjects: true }) && typeof t('landing.useCases.items', { returnObjects: true }) === 'object' && 
             Object.entries(t('landing.useCases.items', { returnObjects: true })).map(([key, item], i) => (
              <div key={key} className="bg-white p-8 rounded-lg border border-surface-container-low shadow-sm reveal reveal-up" style={{ transitionDelay: `${(i+1)*100}ms` }}>
                <h3 className="font-headline font-bold text-xl mb-4 text-primary">{item.title}</h3>
                <p className="text-on-surface-variant mb-6 leading-relaxed">{item.desc}</p>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{item.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section
          className="py-24 md:py-32 text-white overflow-hidden relative"
          style={{ backgroundColor: 'rgb(79, 70, 229)' }}
        >
          <div className="absolute top-0 right-0 w-1/3 h-full editorial-gradient opacity-50 transform skew-x-12 translate-x-20"></div>
          <div className="max-w-4xl mx-auto px-6 md:px-8 text-center relative z-10 reveal reveal-up">
            <h2 className="font-headline font-extrabold text-3xl md:text-5xl mb-6 md:mb-8 leading-tight">{t('landing.finalCta.title')}</h2>
            <p className="text-white/80 text-lg md:text-xl mb-10 md:mb-12 font-light reveal reveal-up reveal-delay-200">{t('landing.finalCta.description')}</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 reveal reveal-up reveal-delay-300">
              <button
                onClick={handleCTA}
                className="bg-white text-primary px-10 py-5 rounded-xl font-headline font-extrabold text-lg hover:bg-surface-container-low transition-colors w-full md:w-auto shadow-2xl active:scale-95"
              >
                {t('landing.finalCta.btn')}
              </button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-32 max-w-3xl mx-auto px-8" id="faq">
          <h2 className="font-headline font-extrabold text-3xl mb-16 text-center text-on-surface">{t('landing.faq.title')}</h2>
          <div className="space-y-4">
            {t('landing.faq.items', { returnObjects: true }).map((item, i) => (
              <FaqItem
                key={i}
                id={i}
                question={item.q}
                answer={item.a}
                openFaq={openFaq}
                toggleFaq={toggleFaq}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#F4F3F1] dark:bg-[#1A1C1A] w-full py-12 px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
          <div className="space-y-4 text-center md:text-left">
            <span className="text-xl font-bold text-[#1F1F1F] dark:text-[#FAF9F6] font-headline">HR Lite</span>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#1F1F1F]/50 dark:text-[#FAF9F6]/50">© 2024 HR Lite. {t('landing.footer.desc')}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link className="text-[10px] uppercase tracking-widest text-[#1F1F1F]/50 dark:text-[#FAF9F6]/50 hover:text-primary underline underline-offset-4 transition-all duration-300" to="/privacy-policy">{t('landing.footer.privacy')}</Link>
            <Link className="text-[10px] uppercase tracking-widest text-[#1F1F1F]/50 dark:text-[#FAF9F6]/50 hover:text-primary underline underline-offset-4 transition-all duration-300" to="/terms-of-service">{t('landing.footer.terms')}</Link>
            <Link className="text-[10px] uppercase tracking-widest text-[#1F1F1F]/50 dark:text-[#FAF9F6]/50 hover:text-primary underline underline-offset-4 transition-all duration-300" to="/cookie-policy">{t('landing.footer.cookie')}</Link>
            <Link className="text-[10px] uppercase tracking-widest text-[#1F1F1F]/50 dark:text-[#FAF9F6]/50 hover:text-primary underline underline-offset-4 transition-all duration-300" to="/contact-support">{t('landing.footer.support')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FaqItem = ({ id, question, answer, openFaq, toggleFaq }) => {
  const isOpen = openFaq === id;
  return (
    <div className="group bg-white rounded-lg border border-surface-container-low shadow-sm">
      <button
        onClick={() => toggleFaq(id)}
        className="flex justify-between items-center w-full p-6 cursor-pointer list-none focus:outline-none"
      >
        <span className="font-headline font-bold text-lg text-on-surface text-left leading-tight">{question}</span>
        <span className={`material-symbols-outlined transform transition-transform duration-300 font-bold ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      <div className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'pb-6 max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-on-surface-variant text-sm leading-relaxed font-light">{answer}</p>
      </div>
    </div>
  );
};

export default LandingPage;
