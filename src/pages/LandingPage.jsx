import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import LanguageSwitcher from '../components/LanguageSwitcher';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useAuth();
  
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
      className="text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden premium-mesh-bg"
    >
      {/* TopAppBar */}
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
              <a className="font-bold text-xs uppercase tracking-widest text-on-surface/60 hover:text-primary transition-all duration-300" href="#features">{t('landing.nav.features')}</a>
              <a className="font-bold text-xs uppercase tracking-widest text-on-surface/60 hover:text-primary transition-all duration-300" href="#workflow">{t('landing.nav.workflow')}</a>
              <a className="font-bold text-xs uppercase tracking-widest text-on-surface/60 hover:text-primary transition-all duration-300" href="#analytics">{t('landing.nav.analytics')}</a>
              <a className="font-bold text-xs uppercase tracking-widest text-on-surface/60 hover:text-primary transition-all duration-300" href="#faq">{t('landing.nav.faq')}</a>
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
        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full glass-card border-b border-surface-container-high shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 z-50">
            <div className="flex flex-col p-8 gap-6">
              <a className="font-bold text-lg p-2" href="#features" onClick={() => setIsMenuOpen(false)}>{t('landing.nav.features')}</a>
              <a className="font-bold text-lg p-2" href="#workflow" onClick={() => setIsMenuOpen(false)}>{t('landing.nav.workflow')}</a>
              <a className="font-bold text-lg p-2" href="#analytics" onClick={() => setIsMenuOpen(false)}>{t('landing.nav.analytics')}</a>
              <a className="font-bold text-lg p-2" href="#faq" onClick={() => setIsMenuOpen(false)}>{t('landing.nav.faq')}</a>
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

      <main className="pt-48 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-40 relative">
          <div className="flex flex-col items-center text-center space-y-16 reveal reveal-up active">
            <div className="space-y-8 max-w-5xl">
              <span
                className="inline-block uppercase tracking-[0.3em] font-bold text-[10px] px-5 py-2 rounded-full glass-card text-primary premium-shadow"
              >
                {t('landing.hero.badge')}
              </span>
              <h1 className="text-display font-extrabold text-5xl sm:text-7xl lg:text-9xl text-on-surface leading-[0.9] tracking-tighter">
                {t('landing.hero.title')}
              </h1>
              <p className="text-on-surface-variant text-lg md:text-2xl max-w-3xl mx-auto font-light leading-relaxed opacity-70">
                {t('landing.hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-8 justify-center pt-6">
                <button
                  onClick={handleCTA}
                  className="editorial-gradient text-white px-14 py-6 rounded-2xl font-display font-bold text-2xl hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-95 premium-shadow"
                >
                  {t('landing.hero.getStarted')}
                </button>
              </div>
            </div>

            {/* High-Fidelity UI Composition (Accurate to Dashboard) */}
            <div className="relative w-full max-w-5xl mt-24 reveal reveal-up active">
               {/* Background Glow */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
               
               <div className="w-full aspect-[16/10] bg-white rounded-[3rem] p-4 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] relative border border-on-surface/5 overflow-hidden group">
                  {/* Mock Sidebar */}
                  <div className="absolute left-4 top-4 bottom-4 w-20 bg-surface-container-low rounded-[2rem] hidden md:flex flex-col items-center py-10 gap-8">
                    <div className="w-10 h-10 editorial-gradient rounded-xl flex items-center justify-center text-white shadow-lg"><span className="material-symbols-outlined !text-[20px]">shield</span></div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined">dashboard</span></div>
                    <div className="w-10 h-10 rounded-xl hover:bg-on-surface/5 flex items-center justify-center text-on-surface/40"><span className="material-symbols-outlined">work</span></div>
                    <div className="w-10 h-10 rounded-xl hover:bg-on-surface/5 flex items-center justify-center text-on-surface/40"><span className="material-symbols-outlined">group</span></div>
                    <div className="w-10 h-10 rounded-xl hover:bg-on-surface/5 flex items-center justify-center text-on-surface/40"><span className="material-symbols-outlined">monitoring</span></div>
                  </div>

                  {/* Mock Main Content */}
                  <div className="absolute left-28 top-8 right-8 bottom-8 flex flex-col gap-8">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                       <div className="space-y-1">
                          <div className="h-8 w-48 bg-on-surface/5 rounded-lg"></div>
                          <div className="h-4 w-32 bg-on-surface/5 rounded-lg opacity-50"></div>
                       </div>
                       <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-on-surface/5"></div>
                          <div className="w-24 h-10 rounded-xl editorial-gradient opacity-10"></div>
                       </div>
                    </div>

                    {/* KPI Grid */}
                    <div className="grid grid-cols-4 gap-6">
                       <div className="bg-white border border-on-surface/5 p-5 rounded-3xl shadow-sm space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined">work</span></div>
                          <div className="text-2xl font-black">12</div>
                          <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Active Jobs</div>
                       </div>
                       <div className="bg-white border border-on-surface/5 p-5 rounded-3xl shadow-sm space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500"><span className="material-symbols-outlined">description</span></div>
                          <div className="text-2xl font-black">248</div>
                          <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Talent Pool</div>
                       </div>
                       <div className="bg-white border border-on-surface/5 p-5 rounded-3xl shadow-sm space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"><span className="material-symbols-outlined">layers</span></div>
                          <div className="text-2xl font-black">42</div>
                          <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">New Apps</div>
                       </div>
                       <div className="bg-white border border-on-surface/5 p-5 rounded-3xl shadow-sm space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500"><span className="material-symbols-outlined">group</span></div>
                          <div className="text-2xl font-black">18</div>
                          <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Interviews</div>
                       </div>
                    </div>

                    {/* Body Preview */}
                    <div className="flex-1 bg-on-surface/5 rounded-[2rem] p-8 flex flex-col gap-6">
                       <div className="h-6 w-1/4 bg-on-surface/10 rounded-lg"></div>
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-4">
                             {[1,2,3].map(i => (
                               <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-on-surface/5 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-full bg-on-surface/5"></div>
                                     <div className="space-y-1">
                                        <div className="h-3 w-24 bg-on-surface/10 rounded"></div>
                                        <div className="h-2 w-16 bg-on-surface/5 rounded"></div>
                                     </div>
                                  </div>
                                  <div className="w-12 h-4 bg-primary/10 rounded-full"></div>
                               </div>
                             ))}
                          </div>
                          <div className="bg-white rounded-3xl p-6 border border-on-surface/5 flex flex-col items-center justify-center gap-4">
                             <div className="w-24 h-24 rounded-full border-[8px] border-on-surface/5 flex items-center justify-center">
                                <span className="text-2xl font-black text-primary">85%</span>
                             </div>
                             <div className="text-center">
                                <div className="text-xs font-bold uppercase tracking-widest">Hiring Velocity</div>
                                <div className="text-[10px] opacity-40">Average 14 days</div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* High-Fidelity Floating Overlays */}
                  <div className="absolute top-[35%] left-[30%] w-72 glass-card p-6 rounded-3xl premium-shadow floating-element border-white/80 shadow-2xl z-20">
                     <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-on-surface/10">
                           <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
                        </div>
                        <div>
                           <div className="text-sm font-black">Sarah Jenkins</div>
                           <div className="text-[10px] text-primary font-black uppercase tracking-widest">Matched 98%</div>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <div className="h-2 w-full bg-on-surface/5 rounded-full overflow-hidden">
                           <div className="h-full editorial-gradient w-[98%]"></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold opacity-60">
                           <span>Skill Alignment</span>
                           <span>High</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 py-24 border-y border-on-surface/5 reveal reveal-up active">
          {[
            { label: t('landing.hero.stats.activeJobs'), value: '420+', icon: 'work' },
            { label: t('landing.hero.stats.matchScore'), value: '98%', icon: 'bolt' },
            { label: t('landing.hero.stats.candidates'), value: '15k+', icon: 'group' },
            { label: t('landing.hero.stats.progress'), value: '2.4x', icon: 'trending_up' }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center md:items-start space-y-4">
               <div className="text-primary opacity-60"><span className="material-symbols-outlined !text-[32px]">{stat.icon}</span></div>
               <div className="text-4xl font-black text-display text-on-surface">{stat.value}</div>
               <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 text-on-surface">{stat.label}</div>
            </div>
          ))}
        </div>

        <section className="py-40 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-20 text-center reveal reveal-up active">
              <h2 className="text-display font-extrabold text-4xl md:text-6xl mb-6">{t('landing.painPoints.title')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-7 glass-card p-12 rounded-[2.5rem] flex flex-col justify-between min-h-[350px] premium-shadow reveal reveal-left active border-white/60">
                <div className="w-16 h-16 rounded-2xl editorial-gradient flex items-center justify-center text-white mb-8 premium-shadow">
                  <span className="material-symbols-outlined !text-[32px]">scatter_plot</span>
                </div>
                <div>
                  <h3 className="text-display font-bold text-3xl mb-4 text-on-surface">{t('landing.painPoints.items.scattered.title')}</h3>
                  <p className="text-on-surface-variant leading-relaxed text-lg opacity-70">{t('landing.painPoints.items.scattered.desc')}</p>
                </div>
              </div>
              <div
                className="md:col-span-5 glass-card p-12 rounded-[2.5rem] flex flex-col justify-between premium-shadow reveal reveal-right active border-white/60"
              >
                <div className="w-16 h-16 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-8">
                  <span className="material-symbols-outlined !text-[32px]">person_search</span>
                </div>
                <div>
                  <h3 className="text-display font-bold text-3xl mb-4 text-on-surface">{t('landing.painPoints.items.tracking.title')}</h3>
                  <p className="text-on-surface-variant leading-relaxed text-lg opacity-70">{t('landing.painPoints.items.tracking.desc')}</p>
                </div>
              </div>
              
              <div className="md:col-span-4 glass-card p-10 rounded-[2rem] premium-shadow reveal reveal-up active border-white/60">
                <span className="material-symbols-outlined text-primary text-4xl mb-6 font-black">speed</span>
                <h3 className="text-display font-bold text-xl mb-3 text-on-surface">{t('landing.painPoints.items.screening.title')}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed opacity-70">{t('landing.painPoints.items.screening.desc')}</p>
              </div>
              <div className="md:col-span-4 glass-card p-10 rounded-[2rem] premium-shadow reveal reveal-up active border-white/60 reveal-delay-100">
                <span className="material-symbols-outlined text-tertiary text-4xl mb-6 font-black">visibility_off</span>
                <h3 className="text-display font-bold text-xl mb-3 text-on-surface">{t('landing.painPoints.items.pipeline.title')}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed opacity-70">{t('landing.painPoints.items.pipeline.desc')}</p>
              </div>
              <div
                className="md:col-span-4 editorial-gradient p-10 rounded-[2rem] shadow-2xl shadow-primary/20 reveal reveal-up active border-white/20 reveal-delay-200"
              >
                <span className="material-symbols-outlined text-white text-4xl mb-6 font-black">analytics</span>
                <h3 className="text-display font-bold text-xl mb-3 text-white">{t('landing.painPoints.items.data.title')}</h3>
                <p className="text-white/80 text-sm leading-relaxed font-medium">{t('landing.painPoints.items.data.desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Overview */}
        <section className="py-40 relative" id="workflow">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center mb-24 reveal reveal-up active">
              <h2 className="text-display font-extrabold text-4xl md:text-6xl mb-6">{t('landing.workflow.title')}</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-lg opacity-70 leading-relaxed">{t('landing.workflow.subtitle')}</p>
            </div>
            
            <div className="relative grid md:grid-cols-5 gap-12 md:gap-4 px-4">
              {/* Desktop Timeline Line */}
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-on-surface/5 -z-10 hidden md:block -translate-y-12"></div>
              
              <div className="flex flex-col items-center group reveal reveal-up active">
                <div className="w-24 h-24 rounded-3xl glass-card flex items-center justify-center border-white/60 premium-shadow group-hover:border-primary/40 transition-all duration-500 mb-6">
                  <span className="material-symbols-outlined text-primary !text-4xl">add_circle</span>
                </div>
                <h4 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-center opacity-60 group-hover:opacity-100 transition-opacity">{t('landing.workflow.steps.createJob')}</h4>
              </div>
              
              <div className="flex flex-col items-center group reveal reveal-up active reveal-delay-100">
                <div className="w-24 h-24 rounded-3xl glass-card flex items-center justify-center border-white/60 premium-shadow group-hover:border-primary/40 transition-all duration-500 mb-6">
                  <span className="material-symbols-outlined text-primary !text-4xl">group_add</span>
                </div>
                <h4 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-center opacity-60 group-hover:opacity-100 transition-opacity">{t('landing.workflow.steps.addCandidate')}</h4>
              </div>

              <div className="flex flex-col items-center group reveal reveal-up active reveal-delay-200">
                <div className="w-32 h-32 rounded-[2rem] editorial-gradient flex items-center justify-center premium-shadow group-hover:scale-110 transition-all duration-500 mb-6 -mt-4 relative">
                  <div className="absolute inset-0 bg-white/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="material-symbols-outlined text-white !text-5xl">hub</span>
                </div>
                <h4 className="font-display font-black text-xs uppercase tracking-[0.3em] text-center text-primary">{t('landing.workflow.steps.matching')}</h4>
              </div>

              <div className="flex flex-col items-center group reveal reveal-up active reveal-delay-300">
                <div className="w-24 h-24 rounded-3xl glass-card flex items-center justify-center border-white/60 premium-shadow group-hover:border-primary/40 transition-all duration-500 mb-6">
                  <span className="material-symbols-outlined text-primary !text-4xl">view_kanban</span>
                </div>
                <h4 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-center opacity-60 group-hover:opacity-100 transition-opacity">{t('landing.workflow.steps.pipeline')}</h4>
              </div>

              <div className="flex flex-col items-center group reveal reveal-up active reveal-delay-400">
                <div className="w-24 h-24 rounded-3xl glass-card flex items-center justify-center border-white/60 premium-shadow group-hover:border-primary/40 transition-all duration-500 mb-6">
                  <span className="material-symbols-outlined text-primary !text-4xl">monitoring</span>
                </div>
                <h4 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-center opacity-60 group-hover:opacity-100 transition-opacity">{t('landing.workflow.steps.analytics')}</h4>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 space-y-48" id="features">
          {/* 1. Job Center */}
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1 relative reveal reveal-left active">
               <div className="absolute inset-0 editorial-gradient opacity-10 blur-[100px] -z-10"></div>
               <div className="glass-card p-10 rounded-[3rem] premium-shadow border-white/60">
                  <div className="space-y-6">
                    <div className="h-12 w-1/2 bg-on-surface/5 rounded-2xl"></div>
                    <div className="p-6 glass-card rounded-3xl border-white/80 shadow-xl flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">UI</div>
                          <div>
                            <div className="text-sm font-black">Lead Designer</div>
                            <div className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Active</div>
                          </div>
                       </div>
                       <span className="text-[10px] px-3 py-1 bg-green-500 text-white rounded-full font-black uppercase">Active</span>
                    </div>
                    <div className="p-6 glass-card rounded-3xl border-white/80 shadow-xl flex items-center justify-between opacity-60">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary font-black">GO</div>
                          <div>
                            <div className="text-sm font-black">Backend Engineer</div>
                            <div className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Closed</div>
                          </div>
                       </div>
                       <span className="text-[10px] px-3 py-1 bg-on-surface/20 text-on-surface/60 rounded-full font-black uppercase">Closed</span>
                    </div>
                  </div>
               </div>
            </div>
            <div className="order-1 md:order-2 space-y-8 reveal reveal-right active">
              <span className="text-primary font-display font-black uppercase tracking-[0.4em] text-[10px] bg-primary/10 px-4 py-2 rounded-full">{t('landing.features.jobCenter.tag')}</span>
              <h2 className="text-display font-extrabold text-5xl leading-tight">{t('landing.features.jobCenter.title')}</h2>
              <p className="text-on-surface-variant text-xl font-light leading-relaxed opacity-70">{t('landing.features.jobCenter.desc')}</p>
              <ul className="space-y-4">
                {Array.isArray(t('landing.features.jobCenter.points', { returnObjects: true })) && 
                 t('landing.features.jobCenter.points', { returnObjects: true }).map((point, i) => (
                  <li key={i} className="flex items-center gap-4 text-on-surface group">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <span className="material-symbols-outlined !text-[14px]">check</span>
                    </div>
                    <span className="text-sm font-medium opacity-80">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2. Candidate Profiles */}
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 reveal reveal-left active">
              <span className="text-tertiary font-display font-black uppercase tracking-[0.4em] text-[10px] bg-tertiary/10 px-4 py-2 rounded-full">{t('landing.features.candidateProfile.tag')}</span>
              <h2 className="text-display font-extrabold text-5xl leading-tight">{t('landing.features.candidateProfile.title')}</h2>
              <p className="text-on-surface-variant text-xl font-light leading-relaxed opacity-70">{t('landing.features.candidateProfile.desc')}</p>
              <ul className="space-y-4">
                {Array.isArray(t('landing.features.candidateProfile.points', { returnObjects: true })) && 
                 t('landing.features.candidateProfile.points', { returnObjects: true }).map((point, i) => (
                  <li key={i} className="flex items-center gap-4 text-on-surface group">
                    <div className="w-6 h-6 rounded-lg bg-tertiary/10 flex items-center justify-center group-hover:bg-tertiary group-hover:text-white transition-all">
                      <span className="material-symbols-outlined !text-[14px]">check</span>
                    </div>
                    <span className="text-sm font-medium opacity-80">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative reveal reveal-right active">
              <div className="absolute inset-0 bg-tertiary/10 blur-[100px] -z-10"></div>
              <div className="glass-card p-10 rounded-[3rem] premium-shadow border-white/60">
                 <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-[2rem] editorial-gradient flex items-center justify-center text-white premium-shadow">
                       <span className="material-symbols-outlined !text-[40px]">person</span>
                    </div>
                    <div>
                       <h5 className="text-display font-black text-2xl tracking-tight">Alex Rivera</h5>
                       <p className="text-sm font-bold text-primary tracking-widest uppercase">Senior UI Engineer</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="glass-card p-5 rounded-2xl border-white/80">
                       <span className="block text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Exp.</span>
                       <span className="font-black text-lg">8 Years</span>
                    </div>
                    <div className="glass-card p-5 rounded-2xl border-white/80">
                       <span className="block text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Source</span>
                       <span className="font-black text-lg">Referral</span>
                    </div>
                 </div>
                 <div className="flex flex-wrap gap-3">
                    {['React', 'SwiftUI', 'Figma', 'System Design'].map(skill => (
                      <span key={skill} className="px-4 py-2 glass-card rounded-xl text-xs font-black border-white/80">{skill}</span>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          {/* 3. Match Score AI */}
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1 relative reveal reveal-left active">
               <div className="absolute inset-0 bg-primary/10 blur-[100px] -z-10"></div>
               <div className="glass-card p-12 rounded-[3.5rem] premium-shadow border-white/60 flex flex-col items-center">
                  <div className="relative w-56 h-56 mb-10">
                     <svg className="w-full h-full -rotate-90">
                        <circle cx="112" cy="112" r="100" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-on-surface/5"></circle>
                        <circle cx="112" cy="112" r="100" fill="transparent" stroke="url(#matchGradient)" strokeWidth="16" strokeDasharray="628" strokeDashoffset="50" strokeLinecap="round" className="premium-shadow"></circle>
                        <defs>
                           <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#4F46E5" />
                              <stop offset="100%" stopColor="#7C3AED" />
                           </linearGradient>
                        </defs>
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-7xl font-black text-display text-primary">92</span>
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Score</span>
                     </div>
                  </div>
                  <div className="w-full space-y-4">
                     <div className="flex justify-between items-end">
                        <span className="text-xs font-black opacity-40 uppercase tracking-widest">Skill Alignment</span>
                        <span className="text-lg font-black text-primary">98%</span>
                     </div>
                     <div className="h-2 w-full bg-on-surface/5 rounded-full overflow-hidden">
                        <div className="h-full editorial-gradient w-[98%]"></div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="order-1 md:order-2 space-y-8 reveal reveal-right active">
              <span className="text-primary font-display font-black uppercase tracking-[0.4em] text-[10px] bg-primary/10 px-4 py-2 rounded-full">{t('landing.features.matchScore.tag')}</span>
              <h2 className="text-display font-extrabold text-5xl leading-tight">{t('landing.features.matchScore.title')}</h2>
              <p className="text-on-surface-variant text-xl font-light leading-relaxed opacity-70">{t('landing.features.matchScore.desc')}</p>
              <ul className="space-y-4">
                {Array.isArray(t('landing.features.matchScore.points', { returnObjects: true })) && 
                 t('landing.features.matchScore.points', { returnObjects: true }).map((point, i) => (
                  <li key={i} className="flex items-center gap-4 text-on-surface group">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <span className="material-symbols-outlined !text-[14px]">check</span>
                    </div>
                    <span className="text-sm font-medium opacity-80">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4. Analytics */}
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center" id="analytics">
            <div className="space-y-8 reveal reveal-left active">
              <span className="text-tertiary font-display font-black uppercase tracking-[0.4em] text-[10px] bg-tertiary/10 px-4 py-2 rounded-full">{t('landing.features.dataDriven.tag')}</span>
              <h2 className="text-display font-extrabold text-5xl leading-tight">{t('landing.features.dataDriven.title')}</h2>
              <p className="text-on-surface-variant text-xl font-light leading-relaxed opacity-70">{t('landing.features.dataDriven.desc')}</p>
              <ul className="space-y-4">
                {Array.isArray(t('landing.features.dataDriven.points', { returnObjects: true })) && 
                 t('landing.features.dataDriven.points', { returnObjects: true }).map((point, i) => (
                  <li key={i} className="flex items-center gap-4 text-on-surface group">
                    <div className="w-6 h-6 rounded-lg bg-tertiary/10 flex items-center justify-center group-hover:bg-tertiary group-hover:text-white transition-all">
                      <span className="material-symbols-outlined !text-[14px]">check</span>
                    </div>
                    <span className="text-sm font-medium opacity-80">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative reveal reveal-right active">
               <div className="absolute inset-0 bg-tertiary/10 blur-[100px] -z-10"></div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="glass-card p-8 rounded-[2.5rem] premium-shadow border-white/60 h-56 flex flex-col justify-between">
                     <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">Hiring Speed</span>
                     <div>
                        <span className="text-5xl font-black text-tertiary tracking-tighter">14d</span>
                        <div className="flex items-center gap-2 mt-2 text-green-500 font-black text-xs">
                           <span className="material-symbols-outlined !text-sm">trending_down</span>
                           -4.2%
                        </div>
                     </div>
                  </div>
                  <div className="glass-card p-8 rounded-[2.5rem] premium-shadow border-white/60 h-56 flex flex-col justify-between">
                     <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">Efficiency</span>
                     <div>
                        <span className="text-5xl font-black text-primary tracking-tighter">98%</span>
                        <div className="flex items-center gap-2 mt-2 text-primary font-black text-xs">
                           <span className="material-symbols-outlined !text-sm">trending_up</span>
                           +12%
                        </div>
                     </div>
                  </div>
                  <div className="col-span-2 glass-card p-10 rounded-[3rem] premium-shadow border-white/60 h-64">
                     <div className="flex justify-between items-center mb-8">
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">Candidate Source</span>
                        <div className="flex gap-4">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              <span className="text-[10px] font-bold opacity-60">Referral</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-on-surface/10"></div>
                              <span className="text-[10px] font-bold opacity-60">Job Board</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-end justify-between h-24 gap-4">
                        {[40, 70, 90, 60, 85, 45, 75].map((h, i) => (
                          <div key={i} className="flex-1 rounded-2xl transition-all duration-700 hover:scale-x-110 cursor-pointer" style={{ height: `${h}%`, backgroundColor: i === 2 ? '#4F46E5' : 'rgba(0,0,0,0.03)' }}></div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* How it Works - Modernized */}
        <section className="py-40 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="text-display font-extrabold text-5xl md:text-7xl mb-24 text-center reveal reveal-up active">{t('landing.howItWorks.title')}</h2>
            <div className="grid md:grid-cols-3 gap-12">
              {Array.isArray(t('landing.howItWorks.steps', { returnObjects: true })) && 
               t('landing.howItWorks.steps', { returnObjects: true }).map((step, i) => (
                <div key={i} className="glass-card p-12 rounded-[3rem] premium-shadow border-white/60 reveal reveal-up active" style={{ transitionDelay: `${(i+1)*100}ms` }}>
                  <div className="text-8xl font-black text-on-surface/5 text-display mb-8 leading-none">0{i+1}</div>
                  <h3 className="text-display font-black text-2xl mb-6">{step.title}</h3>
                  <p className="text-on-surface-variant font-light text-lg opacity-70 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* FAQ Section Refined */}
        <section className="py-40 max-w-4xl mx-auto px-6 reveal reveal-up active" id="faq">
          <h2 className="text-display font-extrabold text-4xl md:text-6xl mb-20 text-center">{t('landing.faq.title')}</h2>
          <div className="space-y-6">
            {Array.isArray(t('landing.faq.questions', { returnObjects: true })) && 
             t('landing.faq.questions', { returnObjects: true }).map((faq, i) => (
              <div key={i} className="glass-card rounded-[2rem] border-white/60 premium-shadow overflow-hidden transition-all duration-300">
                <button
                  className="w-full text-left p-8 flex justify-between items-center group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-display font-black text-lg opacity-80 group-hover:opacity-100 transition-opacity">{faq.q}</span>
                  <span className={`material-symbols-outlined transition-transform duration-500 text-primary ${openFaq === i ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-on-surface-variant font-light leading-relaxed opacity-70">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 px-6">
          <div className="max-w-7xl mx-auto editorial-gradient rounded-[4rem] p-16 md:p-32 text-center text-white premium-shadow relative overflow-hidden reveal reveal-up active">
            <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-10"></div>
            <div className="relative z-10 space-y-12">
              <h2 className="text-display font-black text-5xl md:text-8xl leading-none">{t('landing.cta.title')}</h2>
              <p className="text-white/70 text-xl md:text-3xl font-light max-w-3xl mx-auto leading-relaxed">{t('landing.cta.subtitle')}</p>
              <div className="pt-8">
                 <button
                   onClick={handleCTA}
                   className="bg-white text-primary px-16 py-8 rounded-[2.5rem] font-display font-black text-2xl hover:shadow-2xl hover:scale-105 transition-all active:scale-95 premium-shadow"
                 >
                   {t('landing.cta.button')}
                 </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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
    </div>
  );
}

export default LandingPage;
