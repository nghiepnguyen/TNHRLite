import React, { useState, useEffect } from 'react';
import { getJobs, getAllApplications } from '../../services/db';
import { BarChart3, PieChart, Activity } from 'lucide-react';

export default function Reports() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const fetchedJobs = await getJobs();
      const fetchedApps = await getAllApplications();
      setJobs(fetchedJobs);
      setApplications(fetchedApps);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading analytical data...</div>;

  if (!loading && applications.length === 0 && jobs.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Reports & Analytics</h1>
          <p className="text-secondary" style={{ marginTop: '0.25rem' }}>Internal data summaries and hiring volume.</p>
        </div>
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
           <BarChart3 size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
           <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Not Enough Data</h2>
           <p className="text-secondary" style={{ marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 0' }}>
             Create your first mandate and start adding candidates into the pipeline to generate analytical reports!
           </p>
        </div>
      </div>
    );
  }

  if (!loading && applications.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Reports & Analytics</h1>
          <p className="text-secondary" style={{ marginTop: '0.25rem' }}>Internal data summaries and hiring volume.</p>
        </div>
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
           <PieChart size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
           <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>No Applications Yet</h2>
           <p className="text-secondary" style={{ marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 0' }}>
             Start linking structured candidates to your job pipelines to view stage volume matrices and AI fit score distributions.
           </p>
        </div>
      </div>
    );
  }

  const activeJobs = jobs.filter(j => j.status === 'Active');
  
  const stageCounts = applications.reduce((acc, app) => {
    acc[app.stage] = (acc[app.stage] || 0) + 1;
    return acc;
  }, {});

  // Fit score distribution brackets: 0-50 (Low), 51-75 (Medium), 76-100 (High)
  const dist = { Low: 0, Medium: 0, High: 0 };
  applications.forEach(a => {
    if (a.fitScore <= 50) dist.Low++;
    else if (a.fitScore <= 75) dist.Medium++;
    else if (a.fitScore <= 100) dist.High++;
  });

  const totalScored = dist.Low + dist.Medium + dist.High || 1;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Reports & Analytics</h1>
        <p className="text-secondary" style={{ marginTop: '0.25rem' }}>Internal data summaries and hiring volume.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Applications by Stage */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <BarChart3 size={18} className="text-primary" /> Application Volume by Stage
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', height: '200px', paddingBottom: '1rem', borderBottom: '1px solid var(--color-surface-border)' }}>
            {['New', 'Reviewed', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'].map(stage => {
              const val = stageCounts[stage] || 0;
              const max = applications.length || 1;
              const heightPct = Math.max((val / max) * 100, 2); // min 2% to show the bar outline
              return (
                <div key={stage} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{val}</div>
                  <div style={{ width: '100%', height: `${heightPct}%`, backgroundColor: stage === 'Hired' ? 'var(--color-success)' : stage === 'Rejected' ? 'var(--color-danger)' : 'var(--color-primary)', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center', wordBreak: 'break-word', paddingTop: '0.5rem' }}>{stage}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fit Score Distribution */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <PieChart size={18} className="text-primary" /> AI Match Quality Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
               { label: 'High Match (76-100)', val: dist.High, color: 'var(--color-success)' },
               { label: 'Medium Match (51-75)', val: dist.Medium, color: 'var(--color-warning)' },
               { label: 'Low Match (0-50)', val: dist.Low, color: 'var(--color-surface-border)' }
            ].map(tier => (
              <div key={tier.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500 }}>{tier.label}</span>
                  <span className="text-secondary">{tier.val} candidates</span>
                </div>
                <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--color-surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round((tier.val / totalScored) * 100)}%`, height: '100%', backgroundColor: tier.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recruiter Summary Table */}
        <div className="card" style={{ padding: '2rem', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Activity size={18} className="text-primary" /> Active Jobs Workload Overview
          </h3>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-surface-border)' }}>
                <th style={{ padding: '1rem 0', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Job Title</th>
                <th style={{ padding: '1rem 0', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Client</th>
                <th style={{ padding: '1rem 0', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Total in Pipeline</th>
                <th style={{ padding: '1rem 0', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Offers Made</th>
              </tr>
            </thead>
            <tbody>
              {activeJobs.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>No active workloads.</td></tr>
              ) : activeJobs.map(job => {
                const jobApps = applications.filter(a => a.jobId === job.id);
                const offers = jobApps.filter(a => a.stage === 'Offer' || a.stage === 'Hired').length;
                return (
                  <tr key={job.id} style={{ borderBottom: '1px solid var(--color-surface-border)' }}>
                    <td style={{ padding: '1rem 0', fontWeight: 500 }}>{job.title}</td>
                    <td style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{job.clientName || 'Internal'}</td>
                    <td style={{ padding: '1rem 0', textAlign: 'center' }}>
                       <span className="badge badge-neutral">{jobApps.length}</span>
                    </td>
                    <td style={{ padding: '1rem 0', textAlign: 'center' }}>
                       <span className={`badge ${offers > 0 ? 'badge-success' : 'badge-neutral'}`}>{offers}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
