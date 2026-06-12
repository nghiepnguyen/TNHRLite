import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import LandingCTA from '../components/landing/LandingCTA';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useAuth();
  useScrollReveal();

  const [openFaq, setOpenFaq] = useState(null);

  const handleCTA = () => navigate('/login');

  return (
    <div className="text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden premium-mesh-bg">
      <LandingNavbar />

      <main className="pt-48 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 mb-40 relative">
          <div className="flex flex-col items-center text-center space-y-16 reveal reveal-up active">
            <div className="space-y-8 max-w-5xl">
              <span className="inline-block uppercase tracking-[0.3em] font-bold text-[10px] px-5 py-2 rounded-full glass-card text-primary premium-shadow">
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

            {/* Dashboard Mockup */}
            <div className="relative w-full max-w-5xl mt-24 reveal reveal-up active">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
              <div className="w-full aspect-[16/10] bg-white rounded-[3rem] p-4 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] relative border border-on-surface/5 overflow-hidden group">
                <div className="absolute left-4 top-4 bottom-4 w-20 bg-surface-container-low rounded-[2rem] hidden md:flex flex-col items-center py-10 gap-8">
                  <div className="w-10 h-10 editorial-gradient rounded-xl flex items-center justify-center text-white shadow-lg"><span className="material-symbols-outlined !text-[20px]">shield</span></div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined">dashboard</span></div>
                  <div className="w-10 h-10 rounded-xl hover:bg-on-surface/5 flex items-center justify-center text-on-surface/40"><span className="material-symbols-outlined">work</span></div>
                  <div className="w-10 h-10 rounded-xl hover:bg-on-surface/5 flex items-center justify-center text-on-surface/40"><span className="material-symbols-outlined">group</span></div>
                  <div className="w-10 h-10 rounded-xl hover:bg-on-surface/5 flex items-center justify-center text-on-surface/40"><span className="material-symbols-outlined">monitoring</span></div>
                </div>
                <div className="absolute left-28 top-8 right-8 bottom-8 flex flex-col gap-8">
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
                  <div className="grid grid-cols-4 gap-6">
                    {[
                      { icon: 'work', color: 'primary', val: '12', label: 'Active Jobs' },
                      { icon: 'description', color: 'green-500', val: '248', label: 'Talent Pool' },
                      { icon: 'layers', color: 'amber-500', val: '42', label: 'New Apps' },
                      { icon: 'group', color: 'indigo-500', val: '18', label: 'Interviews' },
                    ].map(card => (
                      <div key={card.label} className="bg-white border border-on-surface/5 p-5 rounded-3xl shadow-sm space-y-3">
                        <div className={`w-10 h-10 rounded-xl bg-${card.color}/10 flex items-center justify-center text-${card.color}`}>
                          <span className="material-symbols-outlined">{card.icon}</span>
                        </div>
                        <div className="text-2xl font-black">{card.val}</div>
                        <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{card.label}</div>
                      </div>
                    ))}
                  </div>
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

        {/* Pain Points */}
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
              <div className="md:col-span-5 glass-card p-12 rounded-[2.5rem] flex flex-col justify-between premium-shadow reveal reveal-right active border-white/60">
                <div className="w-16 h-16 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-8">
                  <span className="material-symbols-outlined !text-[32px]">person_search</span>
                </div>
                <div>
                  <h3 className="text-display font-bold text-3xl mb-4 text-on-surface">{t('landing.painPoints.items.tracking.title')}</h3>
                  <p className="text-on-surface-variant leading-relaxed text-lg opacity-70">{t('landing.painPoints.items.tracking.desc')}</p>
                </div>
              </div>
              <PainPointCard icon="speed" titleKey="screening" color="primary" />
              <PainPointCard icon="visibility_off" titleKey="pipeline" color="tertiary" delay={100} />
              <div className="md:col-span-4 editorial-gradient p-10 rounded-[2rem] shadow-2xl shadow-primary/20 reveal reveal-up active border-white/20 reveal-delay-200">
                <span className="material-symbols-outlined text-white text-4xl mb-6 font-black">analytics</span>
                <h3 className="text-display font-bold text-xl mb-3 text-white">{t('landing.painPoints.items.data.title')}</h3>
                <p className="text-white/80 text-sm leading-relaxed font-medium">{t('landing.painPoints.items.data.desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="py-40 relative" id="workflow">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center mb-24 reveal reveal-up active">
              <h2 className="text-display font-extrabold text-4xl md:text-6xl mb-6">{t('landing.workflow.title')}</h2>
            </div>
            <div className="relative grid md:grid-cols-5 gap-12 md:gap-4 px-4">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-on-surface/5 -z-10 hidden md:block -translate-y-12"></div>
              {[
                { icon: 'add_circle', label: t('landing.workflow.steps.createJob') },
                { icon: 'group_add', label: t('landing.workflow.steps.addCandidate') },
                { icon: 'hub', label: t('landing.workflow.steps.matching'), center: true },
                { icon: 'view_kanban', label: t('landing.workflow.steps.pipeline') },
                { icon: 'monitoring', label: t('landing.workflow.steps.analytics') },
              ].map((step, i) => (
                <div key={i} className={`flex flex-col items-center group reveal reveal-up active${i > 0 ? ` reveal-delay-${i * 100}` : ''}`}>
                  <div className={`rounded-3xl glass-card flex items-center justify-center border-white/60 premium-shadow group-hover:border-primary/40 transition-all duration-500 mb-6 ${
                    step.center ? 'w-32 h-32 rounded-[2rem] editorial-gradient group-hover:scale-110 -mt-4' : 'w-24 h-24'
                  }`}>
                    {step.center && <div className="absolute inset-0 bg-white/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                    <span className={`material-symbols-outlined ${step.center ? 'text-white !text-5xl' : 'text-primary !text-4xl'}`}>{step.icon}</span>
                  </div>
                  <h4 className={`font-display text-xs uppercase tracking-[0.2em] text-center opacity-60 group-hover:opacity-100 transition-opacity ${step.center ? 'font-black tracking-[0.3em] text-primary' : 'font-bold'}`}>
                    {step.label}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 space-y-48" id="features">
          <FeatureBlock
            tag={t('landing.features.jobCenter.tag')}
            title={t('landing.features.jobCenter.title')}
            desc={t('landing.features.jobCenter.desc')}
            points={t('landing.features.jobCenter.points', { returnObjects: true })}
            imageRight
            mockContent={
              <div className="space-y-6">
                <div className="h-12 w-1/2 bg-on-surface/5 rounded-2xl"></div>
                {[{ initials: 'UI', role: 'Lead Designer', status: 'Active', statusColor: 'bg-green-500' },
                  { initials: 'GO', role: 'Backend Engineer', status: 'Closed', statusColor: 'bg-on-surface/20', muted: true }
                ].map((item, i) => (
                  <div key={i} className={`p-6 glass-card rounded-3xl border-white/80 shadow-xl flex items-center justify-between ${item.muted ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">{item.initials}</div>
                      <div>
                        <div className="text-sm font-black">{item.role}</div>
                        <div className="text-[10px] opacity-60 font-bold uppercase tracking-widest">{item.status}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] px-3 py-1 text-white rounded-full font-black uppercase ${item.statusColor}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            }
          />
          <FeatureBlock
            tag={t('landing.features.candidateProfile.tag')}
            title={t('landing.features.candidateProfile.title')}
            desc={t('landing.features.candidateProfile.desc')}
            points={t('landing.features.candidateProfile.points', { returnObjects: true })}
            imageRight={false}
            tagColor="tertiary"
            mockContent={
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-[2rem] editorial-gradient flex items-center justify-center text-white premium-shadow">
                  <span className="material-symbols-outlined !text-[40px]">person</span>
                </div>
                <div>
                  <h5 className="text-display font-black text-2xl tracking-tight">Alex Rivera</h5>
                  <p className="text-sm font-bold text-primary tracking-widest uppercase">Senior UI Engineer</p>
                </div>
              </div>
            }
            mockExtra={
              <>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="glass-card p-5 rounded-2xl border-white/80"><span className="block text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Exp.</span><span className="font-black text-lg">8 Years</span></div>
                  <div className="glass-card p-5 rounded-2xl border-white/80"><span className="block text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Source</span><span className="font-black text-lg">Referral</span></div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['React', 'SwiftUI', 'Figma', 'System Design'].map(skill => (
                    <span key={skill} className="px-4 py-2 glass-card rounded-xl text-xs font-black border-white/80">{skill}</span>
                  ))}
                </div>
              </>
            }
          />
          <FeatureBlock
            tag={t('landing.features.matchScore.tag')}
            title={t('landing.features.matchScore.title')}
            desc={t('landing.features.matchScore.desc')}
            points={t('landing.features.matchScore.points', { returnObjects: true })}
            imageRight
            mockContent={
              <div className="relative w-56 h-56 mb-10">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="112" cy="112" r="100" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-on-surface/5"></circle>
                  <circle cx="112" cy="112" r="100" fill="transparent" stroke="url(#matchGradient)" strokeWidth="16" strokeDasharray="628" strokeDashoffset="50" strokeLinecap="round" className="premium-shadow"></circle>
                  <defs>
                    <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4F46E5" /><stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-7xl font-black text-display text-primary">92</span>
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Score</span>
                </div>
              </div>
            }
            mockExtra={
              <div className="w-full space-y-4">
                <div className="flex justify-between items-end"><span className="text-xs font-black opacity-40 uppercase tracking-widest">Skill Alignment</span><span className="text-lg font-black text-primary">98%</span></div>
                <div className="h-2 w-full bg-on-surface/5 rounded-full overflow-hidden"><div className="h-full editorial-gradient w-[98%]"></div></div>
              </div>
            }
          />
          <FeatureBlock
            tag={t('landing.features.dataDriven.tag')}
            title={t('landing.features.dataDriven.title')}
            desc={t('landing.features.dataDriven.desc')}
            points={t('landing.features.dataDriven.points', { returnObjects: true })}
            imageRight={false}
            tagColor="tertiary"
            mockContent={
              <div className="grid grid-cols-2 gap-8">
                {[
                  { label: 'Hiring Speed', value: '14d', trend: '-4.2%', trendIcon: 'trending_down', trendColor: 'text-green-500', color: 'text-tertiary' },
                  { label: 'Efficiency', value: '98%', trend: '+12%', trendIcon: 'trending_up', trendColor: 'text-primary', color: 'text-primary' },
                ].map(stat => (
                  <div key={stat.label} className="glass-card p-8 rounded-[2.5rem] premium-shadow border-white/60 h-56 flex flex-col justify-between">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">{stat.label}</span>
                    <div>
                      <span className={`text-5xl font-black ${stat.color} tracking-tighter`}>{stat.value}</span>
                      <div className={`flex items-center gap-2 mt-2 font-black text-xs ${stat.trendColor}`}>
                        <span className={`material-symbols-outlined !text-sm`}>{stat.trendIcon}</span>{stat.trend}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="col-span-2 glass-card p-10 rounded-[3rem] premium-shadow border-white/60 h-64">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">Candidate Source</span>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div><span className="text-[10px] font-bold opacity-60">Referral</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-on-surface/10"></div><span className="text-[10px] font-bold opacity-60">Job Board</span></div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between h-24 gap-4">
                    {[40, 70, 90, 60, 85, 45, 75].map((h, i) => (
                      <div key={i} className="flex-1 rounded-2xl transition-all duration-700 hover:scale-x-110 cursor-pointer" style={{ height: `${h}%`, backgroundColor: i === 2 ? '#4F46E5' : 'rgba(0,0,0,0.03)' }}></div>
                    ))}
                  </div>
                </div>
              </div>
            }
          />
        </section>

        {/* How it Works */}
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

        {/* FAQ */}
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

        <LandingCTA />
      </main>

      <LandingFooter />
    </div>
  );
};

// Sub-components
const PainPointCard = ({ icon, titleKey, color, delay = 0 }) => {
  const { t } = useTranslation();
  return (
    <div className={`md:col-span-4 glass-card p-10 rounded-[2rem] premium-shadow reveal reveal-up active border-white/60${delay ? ' reveal-delay-' + delay : ''}`}>
      <span className={`material-symbols-outlined text-${color} text-4xl mb-6 font-black`}>{icon}</span>
      <h3 className="text-display font-bold text-xl mb-3 text-on-surface">{t(`landing.painPoints.items.${titleKey}.title`)}</h3>
      <p className="text-on-surface-variant text-sm leading-relaxed opacity-70">{t(`landing.painPoints.items.${titleKey}.desc`)}</p>
    </div>
  );
};

const FeatureBlock = ({ tag, title, desc, points, imageRight, tagColor = 'primary', mockContent, mockExtra }) => (
  <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-20 items-center">
    <div className={`${imageRight ? 'order-2 md:order-1' : ''} relative reveal reveal-left active`}>
      <div className={`absolute inset-0 ${tagColor === 'tertiary' ? 'bg-tertiary/10' : 'editorial-gradient opacity-10'} blur-[100px] -z-10`}></div>
      <div className={`glass-card ${imageRight ? 'p-10 rounded-[3rem]' : 'p-12 rounded-[3.5rem]'} premium-shadow border-white/60 flex flex-col items-center`}>
        {mockContent}
        {mockExtra}
      </div>
    </div>
    <div className={`${imageRight ? 'order-1 md:order-2' : ''} space-y-8 reveal reveal-right active`}>
      <span className={`${tagColor === 'tertiary' ? 'text-tertiary bg-tertiary/10' : 'text-primary bg-primary/10'} font-display font-black uppercase tracking-[0.4em] text-[10px] px-4 py-2 rounded-full`}>{tag}</span>
      <h2 className="text-display font-extrabold text-5xl leading-tight">{title}</h2>
      <p className="text-on-surface-variant text-xl font-light leading-relaxed opacity-70">{desc}</p>
      <ul className="space-y-4">
        {Array.isArray(points) && points.map((point, i) => (
          <li key={i} className="flex items-center gap-4 text-on-surface group">
            <div className={`w-6 h-6 rounded-lg ${tagColor === 'tertiary' ? 'bg-tertiary/10 group-hover:bg-tertiary' : 'bg-primary/10 group-hover:bg-primary'} flex items-center justify-center group-hover:text-white transition-all`}>
              <span className="material-symbols-outlined !text-[14px]">check</span>
            </div>
            <span className="text-sm font-medium opacity-80">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default LandingPage;