import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs, getCandidates, getAllApplications } from '../../services/db';
import { Briefcase, Users, FileText, Activity, Layers, AlertCircle, ChevronRight, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [fetchedJobs, fetchedCands, fetchedApps] = await Promise.all([
        getJobs(),
        getCandidates(),
        getAllApplications()
      ]);
      setJobs(fetchedJobs);
      setCandidates(fetchedCands);
      setApplications(fetchedApps);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading dashboard metrics...</div>;

  const activeJobs = jobs.filter(j => j.status === 'Active');
  
  // Stages breakdown
  const stageCounts = applications.reduce((acc, app) => {
    acc[app.stage] = (acc[app.stage] || 0) + 1;
    return acc;
  }, {});

  // Top Matched Candidates (highest fitScore across all pipeline apps)
  const topMatches = [...applications]
    .filter(a => typeof a.fitScore === 'number')
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 4)
    .map(app => {
      const cand = candidates.find(c => c.id === app.candidateId);
      const job = jobs.find(j => j.id === app.jobId);
      return { ...app, candidateInfo: cand, jobInfo: job };
    });

  // Recent Activity (Approximated by returning latest sorted applications/candidates)
  const recentActivity = [...candidates].slice(0, 3);

  // Jobs Needing Attention (Active jobs with 0 New/Review applications)
  const jobsAttn = activeJobs.filter(job => {
     const appsForJob = applications.filter(a => a.jobId === job.id);
     return appsForJob.length === 0;
  });

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Recruitment Overview</h1>
        <p className="text-secondary" style={{ marginTop: '0.5rem', fontSize: '1rem' }}>Welcome back. Here is the pulse of your talent pipeline.</p>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card metric-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'var(--transition-smooth)', cursor: 'default' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary-bg)', borderRadius: 'var(--radius-md)' }}>
            <Briefcase size={24} className="text-primary" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{activeJobs.length}</h2>
            <p className="text-secondary" style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Jobs</p>
          </div>
        </div>
        
        <div className="card metric-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'var(--transition-smooth)', cursor: 'default' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)' }}>
            <FileText size={24} className="text-success" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{candidates.length}</h2>
            <p className="text-secondary" style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Talent Pool</p>
          </div>
        </div>
        
        <div className="card metric-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'var(--transition-smooth)', cursor: 'default' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-warning-bg)', borderRadius: 'var(--radius-md)' }}>
            <Layers size={24} className="text-warning" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{stageCounts['New'] || 0}</h2>
            <p className="text-secondary" style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Apps</p>
          </div>
        </div>

        <div className="card metric-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'var(--transition-smooth)', cursor: 'default' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <Users size={24} className="text-primary" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{stageCounts['Interview'] || 0}</h2>
            <p className="text-secondary" style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interviews</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Main Feed: Top Matches & Funnel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <CheckCircle size={18} className="text-success" /> Top AI Matched Candidates
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topMatches.length === 0 ? (
                <p className="text-muted">No parsed applications matched yet.</p>
              ) : topMatches.map((m, idx) => (
                <div key={idx} className="interactive-row-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-md)', transition: 'var(--transition-smooth)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>{m.candidateInfo?.fullName || 'Unknown Candidate'}</div>
                    <div className="text-secondary" style={{ fontSize: '0.8125rem', marginTop: '0.125rem' }}>{m.jobInfo?.title || 'Unknown Job'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span className="text-success" style={{ fontWeight: 800, fontSize: '1.125rem' }}>{m.fitScore}%</span>
                      <span className="badge badge-neutral" style={{ marginTop: '0.25rem', fontSize: '0.6875rem' }}>{m.stage}</span>
                    </div>
                    <Link to={`/dashboard/pipeline`} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><ChevronRight size={18} /></Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Activity size={18} className="text-primary" /> Active Funnel Preview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {['New', 'Reviewed', 'Interview', 'Offer', 'Hired'].map(stage => {
                const count = stageCounts[stage] || 0;
                const total = applications.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '80px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right', textTransform: 'uppercase' }}>{stage}</div>
                    <div style={{ flex: 1, backgroundColor: 'var(--color-surface-hover)', height: '8px', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, backgroundColor: 'var(--color-brand-primary-container)', height: '100%', borderRadius: 'inherit', transition: 'width 1s ease-out' }}></div>
                    </div>
                    <div style={{ width: '32px', fontSize: '0.875rem', fontWeight: 800, textAlign: 'left', color: 'var(--color-text-primary)' }}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar: Attention & Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', color: 'var(--color-warning)' }}>
              <AlertCircle size={18} /> Needs Attention
            </h3>
            {jobsAttn.length === 0 ? (
               <p className="text-muted" style={{ fontSize: '0.8125rem' }}>All active jobs have pipeline engagement.</p>
            ) : jobsAttn.map(job => (
              <div key={job.id} style={{ padding: '1rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', boxShadow: 'var(--shadow-sm)', transition: 'var(--transition-smooth)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{job.title}</div>
                <div className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>0 applications</div>
                <Link to={`/dashboard/jobs/${job.id}`} className="text-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', marginTop: '0.75rem', fontWeight: 700 }}>
                  View Mandate <ChevronRight size={12} />
                </Link>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>Recent CV Uploads</h3>
            {recentActivity.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.8125rem' }}>No recent activity.</p>
            ) : recentActivity.map((cand, idx) => (
               <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', paddingBottom: idx < recentActivity.length - 1 ? '1rem' : 0, borderBottom: idx < recentActivity.length - 1 ? '1px solid var(--color-surface-border)' : 'none' }}>
                 <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <FileText size={16} className="text-muted" />
                 </div>
                 <div>
                   <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{cand.fullName}</div>
                   <div className="text-secondary" style={{ fontSize: '0.75rem' }}>AI Parsing Completed</div>
                 </div>
               </div>
            ))}
            <Link to="/dashboard/candidates" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8125rem', fontWeight: 700, marginTop: '0.5rem' }}>View All Talents</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
