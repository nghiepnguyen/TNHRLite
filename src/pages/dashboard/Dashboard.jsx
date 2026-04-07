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
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Recruitment Overview</h1>
        <p className="text-secondary" style={{ marginTop: '0.25rem' }}>Welcome back. Here is the pulse of your talent pipeline.</p>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }}>
            <Briefcase size={24} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{activeJobs.length}</h2>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Active Jobs</p>
          </div>
        </div>
        
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-success)', borderRadius: 'var(--radius-md)' }}>
            <FileText size={24} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{candidates.length}</h2>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Total Talent Pool</p>
          </div>
        </div>
        
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-warning)', borderRadius: 'var(--radius-md)' }}>
            <Layers size={24} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stageCounts['New'] || 0}</h2>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>New Applications</p>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-text-primary)', borderRadius: 'var(--radius-md)' }}>
            <Users size={24} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stageCounts['Interview'] || 0}</h2>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>In Interviews</p>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topMatches.length === 0 ? (
                <p className="text-muted">No parsed applications matched yet.</p>
              ) : topMatches.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--color-surface-border)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{m.candidateInfo?.fullName || 'Unknown Candidate'}</div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Applying for: {m.jobInfo?.title || 'Unknown Job'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span className="text-success" style={{ fontWeight: 700 }}>{m.fitScore}% Fit</span>
                      <span className="badge badge-neutral" style={{ marginTop: '0.25rem' }}>{m.stage}</span>
                    </div>
                    <Link to={`/pipeline`} className="btn btn-secondary" style={{ padding: '0.25rem' }}><ChevronRight size={18} /></Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Activity size={18} className="text-primary" /> Active Funnel Preview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['New', 'Reviewed', 'Interview', 'Offer', 'Hired'].map(stage => {
                const count = stageCounts[stage] || 0;
                const total = applications.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '80px', fontSize: '0.875rem', color: 'var(--color-text-secondary)', textAlign: 'right' }}>{stage}</div>
                    <div style={{ flex: 1, backgroundColor: 'var(--color-surface-hover)', height: '12px', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, backgroundColor: 'var(--color-primary)', height: '100%', borderRadius: 'inherit' }}></div>
                    </div>
                    <div style={{ width: '40px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'left' }}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar: Attention & Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface-hover)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-warning)' }}>
              <AlertCircle size={18} /> Jobs Needing Attention
            </h3>
            {jobsAttn.length === 0 ? (
               <p className="text-muted" style={{ fontSize: '0.875rem' }}>All active jobs have pipeline engagement.</p>
            ) : jobsAttn.map(job => (
              <div key={job.id} style={{ padding: '1rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{job.title}</div>
                <div className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>0 applications</div>
                <Link to={`/jobs/${job.id}`} className="text-primary" style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 500 }}>View Mandate</Link>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Recent CV Uploads</h3>
            {recentActivity.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>No recent activity.</p>
            ) : recentActivity.map((cand, idx) => (
               <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                 <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <FileText size={14} className="text-muted" />
                 </div>
                 <div>
                   <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{cand.fullName} parsed</div>
                   <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Talent Pool</div>
                 </div>
               </div>
            ))}
            <Link to="/candidates" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.875rem', marginTop: '0.5rem' }}>View All Talents</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
