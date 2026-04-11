import React, { useState, useEffect } from 'react';
import { getJobs, getApplicationsByJob, getCandidates, updateApplicationStage } from '../../services/db';
import { User, Layers, Brain, CheckCircle, XCircle } from 'lucide-react';

const STAGES = ['New', 'Reviewed', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];

export default function Pipeline() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applications, setApplications] = useState([]);
  const [candidatesMap, setCandidatesMap] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    async function init() {
      const activeJobs = await getJobs();
      setJobs(activeJobs.filter(j => j.status === 'Active'));

      const candidates = await getCandidates();
      const cMap = {};
      candidates.forEach(c => cMap[c.id] = c);
      setCandidatesMap(cMap);
      
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    async function fetchApps() {
      if (!selectedJob) {
        setApplications([]);
        return;
      }
      setLoading(true);
      const apps = await getApplicationsByJob(selectedJob);
      setApplications(apps);
      setLoading(false);
    }
    fetchApps();
  }, [selectedJob]);

  const handleStageChange = async (appId, newStage) => {
    // Optimistic UI Update
    setApplications(prev => prev.map(app => app.id === appId ? { ...app, stage: newStage } : app));
    if (selectedApp?.id === appId) {
      setSelectedApp(prev => ({ ...prev, stage: newStage }));
    }
    
    // Track pipeline stage change event
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'pipeline_stage_changed', {
        'to_stage': newStage,
        'app_id': appId
      });
    }
    
    await updateApplicationStage(appId, newStage);
  };

  const groupedApps = STAGES.reduce((acc, stage) => {
    acc[stage] = applications.filter(a => a.stage === stage);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      {/* Header & Filter */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Pipeline</h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Organize candidates by progressing their application stage.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label className="text-secondary" style={{ fontWeight: 500, fontSize: '0.875rem' }}>Select Job:</label>
          <select 
            className="form-control" 
            style={{ width: '250px' }}
            value={selectedJob} 
            onChange={e => { setSelectedJob(e.target.value); setSelectedApp(null); }}
          >
            <option value="">-- Choose a Mandate --</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
      </div>

      {!selectedJob && (
         <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Layers size={32} className="text-muted" style={{ margin: '0 auto 1rem' }} />
            <p className="text-secondary">Select an active job from the dropdown above to view its pipeline.</p>
         </div>
      )}

      {selectedJob && (
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', flex: 1, paddingBottom: '1rem' }}>
          {STAGES.map(stage => (
            <div key={stage} style={{ minWidth: '280px', width: '280px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface-card)', padding: '0.75rem 1rem', borderTop: `3px solid ${stage === 'Hired' ? 'var(--color-success)' : stage === 'Rejected' ? 'var(--color-danger)' : 'var(--color-primary)'}`, borderBottom: '1px solid var(--color-surface-border)', borderRight: '1px solid var(--color-surface-border)', borderLeft: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{stage}</h3>
                <span className="badge badge-neutral">{groupedApps[stage].length}</span>
              </div>
              
              <div style={{ flex: 1, backgroundColor: 'var(--color-surface-hover)', padding: '0.75rem', borderLeft: '1px solid var(--color-surface-border)', borderRight: '1px solid var(--color-surface-border)', borderBottom: '1px solid var(--color-surface-border)', borderRadius: '0 0 var(--radius-md) var(--radius-md)', overflowY: 'auto' }}>
                {groupedApps[stage].map(app => {
                  const candidate = candidatesMap[app.candidateId];
                  if (!candidate) return null;
                  
                  return (
                    <div 
                      key={app.id} 
                      className="card" 
                      style={{ padding: '1rem', cursor: 'pointer', marginBottom: '0.75rem', transition: 'border-color 0.2s', borderColor: selectedApp?.id === app.id ? 'var(--color-primary)' : 'var(--color-surface-border)' }}
                      onClick={() => setSelectedApp({ ...app, candidate })}
                    >
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>{candidate.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{candidate.currentTitle}</div>
                      
                      {app.fitScore > 0 && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', backgroundColor: app.fitScore > 75 ? 'var(--color-success-bg)' : 'var(--color-warning-bg)', color: app.fitScore > 75 ? 'var(--color-success)' : 'var(--color-warning)', padding: '0.25rem 0.5rem', borderRadius: '4px', width: 'max-content' }}>
                            <Brain size={12} />
                            <span>Fit Score: {app.fitScore}/100</span>
                         </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Side Panel */}
      {selectedApp && (
         <div style={{ position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh', backgroundColor: 'var(--color-surface-card)', boxShadow: '-4px 0 16px rgba(0,0,0,0.1)', zIndex: 100, display: 'flex', flexDirection: 'column', transition: 'transform 0.3s' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Candidate Evaluation</h2>
               <button onClick={() => setSelectedApp(null)} className="text-muted" style={{ padding: '0.5rem' }}>✕</button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-surface-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={24} className="text-secondary" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{selectedApp.candidate.fullName}</h3>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>{selectedApp.candidate.currentTitle}</div>
                  </div>
               </div>

               <div style={{ marginBottom: '1.5rem' }}>
                 <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Mange Stage</label>
                 <select 
                    className="form-control" 
                    value={selectedApp.stage} 
                    onChange={e => handleStageChange(selectedApp.id, e.target.value)}
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>

               {selectedApp.fitScore > 0 && (
                 <div style={{ backgroundColor: 'var(--color-surface-base)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                     <Brain size={16} className="text-primary" /> AI Match Summary
                   </div>
                   <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                     {selectedApp.aiSummary || 'No summary generated.'}
                   </div>
                 </div>
               )}

               {selectedApp.strengths && selectedApp.strengths.length > 0 && (
                 <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                       <CheckCircle size={16} className="text-success" /> Key Strengths
                    </div>
                    <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                       {selectedApp.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                    </ul>
                 </div>
               )}

               {selectedApp.gaps && selectedApp.gaps.length > 0 && (
                 <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                       <XCircle size={16} className="text-danger" /> Potential Gaps
                    </div>
                    <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                       {selectedApp.gaps.map((gap, idx) => <li key={idx}>{gap}</li>)}
                    </ul>
                 </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
}
