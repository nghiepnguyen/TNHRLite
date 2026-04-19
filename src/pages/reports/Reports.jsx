import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getJobs, getAllApplications } from '../../services/db';
import Skeleton from '../../components/Skeleton';


export default function Reports() {
  const { workspaceId } = useParams();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!workspaceId) return;
      setLoading(true);
      const fetchedJobs = await getJobs(workspaceId);
      const fetchedApps = await getAllApplications(workspaceId);
      setJobs(fetchedJobs);
      setApplications(fetchedApps);
      setLoading(false);
      
      // Track report view event
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'report_viewed');
      }
    }
    loadData();
  }, [workspaceId]);

  if (loading) return <ReportsSkeleton />;

  if (!loading && applications.length === 0 && jobs.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Reports &amp; Analytics</h1>
          <p className="text-secondary" style={{ marginTop: '0.25rem' }}>Internal data summaries and hiring volume.</p>
        </div>
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
           <span className="material-symbols-outlined flex-shrink-0 !text-[48px] text-muted" style={{ display: 'block', margin: '0 auto 1rem', opacity: 0.5 }}>leaderboard</span>
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Reports &amp; Analytics</h1>
          <p className="text-secondary" style={{ marginTop: '0.25rem' }}>Internal data summaries and hiring volume.</p>
        </div>
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
           <span className="material-symbols-outlined flex-shrink-0 !text-[48px] text-muted" style={{ display: 'block', margin: '0 auto 1rem', opacity: 0.5 }}>pie_chart</span>
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

  // Stage data for bar chart
  const stages = ['New', 'Reviewed', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];
  const stageColors = {
    Hired: 'var(--color-success)',
    Rejected: 'var(--color-danger)',
    Offer: 'var(--color-warning)',
    default: 'var(--color-primary)',
  };

  // Summary stats for top KPIs
  const totalApps = applications.length;
  const hiredCount = stageCounts['Hired'] || 0;
  const conversionRate = totalApps > 0 ? Math.round((hiredCount / totalApps) * 100) : 0;
  const avgFitScore = applications.filter(a => typeof a.fitScore === 'number').reduce((sum, a, _, arr) => {
    return arr.length ? sum + a.fitScore / arr.length : 0;
  }, 0);

  return (
    <div className="reports-page">
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Reports &amp; Analytics</h1>
        <p className="text-secondary" style={{ marginTop: '0.25rem' }}>Internal data summaries and hiring volume.</p>
      </div>

      {/* KPI Summary Row */}
      <div className="reports-kpi-grid">
        <div className="card reports-kpi-card">
          <div className="reports-kpi-icon" style={{ backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[22px]">layers</span>
          </div>
          <div>
            <div className="reports-kpi-value">{totalApps}</div>
            <div className="reports-kpi-label">Total Applications</div>
          </div>
        </div>

        <div className="card reports-kpi-card">
          <div className="reports-kpi-icon" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[22px]">person_check</span>
          </div>
          <div>
            <div className="reports-kpi-value" style={{ color: 'var(--color-success)' }}>{hiredCount}</div>
            <div className="reports-kpi-label">Total Hired</div>
          </div>
        </div>

        <div className="card reports-kpi-card">
          <div className="reports-kpi-icon" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[22px]">trending_up</span>
          </div>
          <div>
            <div className="reports-kpi-value" style={{ color: 'var(--color-warning)' }}>{conversionRate}%</div>
            <div className="reports-kpi-label">Conversion Rate</div>
          </div>
        </div>

        <div className="card reports-kpi-card">
          <div className="reports-kpi-icon" style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-primary)' }}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[22px]">psychology</span>
          </div>
          <div>
            <div className="reports-kpi-value">{Math.round(avgFitScore)}%</div>
            <div className="reports-kpi-label">Avg AI Fit Score</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="reports-charts-grid">
        
        {/* Bar Chart — Applications by Stage */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 className="reports-card-title">
            <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-primary">leaderboard</span>
            Application Volume by Stage
          </h3>

          {/* Horizontal bar chart (works much better on mobile than vertical bars) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {stages.map(stage => {
              const val = stageCounts[stage] || 0;
              const pct = Math.round((val / (applications.length || 1)) * 100);
              const color = stageColors[stage] || stageColors.default;
              return (
                <div key={stage}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{stage}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {val} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ height: '10px', backgroundColor: 'var(--color-surface-hover)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.max(pct, val > 0 ? 3 : 0)}%`,
                      height: '100%',
                      backgroundColor: color,
                      borderRadius: '5px',
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: 0.85,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Match Quality Distribution */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 className="reports-card-title">
            <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-primary">pie_chart</span>
            AI Match Quality Distribution
          </h3>
          
          {/* Visual donut-like progress bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { label: 'High Match', range: '76–100%', val: dist.High, color: 'var(--color-success)' },
              { label: 'Medium Match', range: '51–75%', val: dist.Medium, color: 'var(--color-warning)' },
              { label: 'Low Match', range: '0–50%', val: dist.Low, color: 'var(--color-surface-border)' },
            ].map(tier => {
              const pct = Math.round((tier.val / totalScored) * 100);
              return (
                <div key={tier.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{tier.label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.375rem' }}>{tier.range}</span>
                    </div>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: tier.color }}>
                      {tier.val} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ height: '12px', width: '100%', backgroundColor: 'var(--color-surface-hover)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: tier.color,
                      borderRadius: '6px',
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unscored note */}
          {applications.filter(a => typeof a.fitScore !== 'number').length > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1.25rem', textAlign: 'center' }}>
              * {applications.filter(a => typeof a.fitScore !== 'number').length} application(s) without an AI score are excluded.
            </p>
          )}
        </div>
      </div>

      {/* Active Jobs Workload Table — Full Width */}
      <div className="card" style={{ padding: '1.75rem', marginTop: '2rem', overflow: 'hidden' }}>
        <h3 className="reports-card-title">
          <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-primary">monitoring</span>
          Active Jobs Workload Overview
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: '480px' }}>
            <thead>
              <tr>
                <th>Job Title</th>
                <th style={{ textAlign: 'center' }}>Client</th>
                <th style={{ textAlign: 'center' }}>In Pipeline</th>
                <th style={{ textAlign: 'center' }}>Offers / Hired</th>
              </tr>
            </thead>
            <tbody>
              {activeJobs.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>No active workloads.</td></tr>
              ) : activeJobs.map(job => {
                const jobApps = applications.filter(a => a.jobId === job.id);
                const offers = jobApps.filter(a => a.stage === 'Offer' || a.stage === 'Hired').length;
                const pipelinePct = Math.round((jobApps.length / (totalApps || 1)) * 100);
                return (
                  <tr key={job.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{job.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                        {pipelinePct}% of total pipeline
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                      {job.clientName || 'Internal'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-neutral">{jobApps.length}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${offers > 0 ? 'badge-success' : 'badge-neutral'}`}>{offers}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .reports-page {
          width: 100%;
        }

        /* KPI summary row: 4 columns desktop */
        .reports-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 1.75rem;
        }

        .reports-kpi-card {
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: var(--transition-smooth);
        }

        .reports-kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .reports-kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .reports-kpi-value {
          font-size: 1.625rem;
          font-weight: 800;
          line-height: 1;
          color: var(--color-text-primary);
        }

        .reports-kpi-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-text-secondary);
          margin-top: 0.25rem;
        }

        /* Charts row: 2 columns desktop */
        .reports-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .reports-card-title {
          font-size: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: var(--color-text-primary);
        }

        /* Tablet: 2→1 KPI, charts stay 2 */
        @media (max-width: 1024px) {
          .reports-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Mobile: everything → 1 column */
        @media (max-width: 768px) {
          .reports-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.875rem;
          }

          .reports-kpi-card {
            padding: 1rem;
            gap: 0.75rem;
          }

          .reports-kpi-value {
            font-size: 1.375rem;
          }

          .reports-kpi-icon {
            width: 40px;
            height: 40px;
          }

          .reports-charts-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }

        @media (max-width: 480px) {
          .reports-kpi-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }

          .reports-kpi-icon {
            display: none; /* More space for value on tiny screens */
          }

          .reports-kpi-card {
            padding: 0.875rem;
          }
        }
      `}} />
    </div>
  );
}

const ReportsSkeleton = () => (
  <div className="reports-page">
    <div style={{ marginBottom: '2rem' }}>
      <Skeleton variant="title" width="280px" height="1.875rem" />
      <Skeleton variant="text" width="350px" style={{ marginTop: '0.25rem' }} />
    </div>

    <div className="reports-kpi-grid">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="card reports-kpi-card">
          <Skeleton variant="rect" width="48px" height="48px" style={{ borderRadius: 'var(--radius-md)' }} />
          <div>
            <Skeleton variant="title" width="60px" />
            <Skeleton variant="text" width="100px" />
          </div>
        </div>
      ))}
    </div>

    <div className="reports-charts-grid">
      <div className="card" style={{ padding: '1.75rem' }}>
        <Skeleton variant="title" width="250px" style={{ marginBottom: '1.5rem' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <Skeleton variant="text" width="60px" />
                <Skeleton variant="text" width="40px" />
              </div>
              <Skeleton variant="rect" height="10px" style={{ borderRadius: '5px' }} />
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding: '1.75rem' }}>
        <Skeleton variant="title" width="250px" style={{ marginBottom: '1.5rem' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <Skeleton variant="text" width="100px" />
                <Skeleton variant="text" width="50px" />
              </div>
              <Skeleton variant="rect" height="12px" style={{ borderRadius: '6px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="card" style={{ padding: '1.75rem', marginTop: '2rem' }}>
      <Skeleton variant="title" width="280px" style={{ marginBottom: '1.5rem' }} />
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--color-surface-border)' }}>
          <div style={{ flex: 1 }}>
            <Skeleton variant="text" width="150px" />
            <Skeleton variant="text" width="100px" style={{ marginTop: '0.25rem' }} />
          </div>
          <Skeleton variant="text" width="100px" />
          <Skeleton variant="text" width="40px" />
        </div>
      ))}
    </div>
  </div>
);
