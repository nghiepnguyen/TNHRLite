import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getJobs, getCandidates, getAllApplications } from '../../services/db';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import Skeleton from '../../components/Skeleton';


export default function Dashboard() {
  const { workspaceId } = useParams();
  const { pendingInvites } = useWorkspace();
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!workspaceId) return;
      setLoading(true);
      const [fetchedJobs, fetchedCands, fetchedApps] = await Promise.all([
        getJobs(workspaceId),
        getCandidates(workspaceId),
        getAllApplications(workspaceId)
      ]);
      setJobs(fetchedJobs);
      setCandidates(fetchedCands);
      setApplications(fetchedApps);
      setLoading(false);
    }
    loadData();

    // Activities real-time listener
    if (workspaceId) {
      const q = query(
        collection(db, 'activities'),
        where('workspaceId', '==', workspaceId)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        // Sort and limit in memory to avoid requiring a composite index in Firestore during dev
        const sortedActivities = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0))
          .slice(0, 5);
        
        setActivities(sortedActivities);
      });
      return () => unsubscribe();
    }
  }, [workspaceId]);

  if (loading) return <DashboardSkeleton />;

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

  const SafeImage = ({ src, name, size = '32px' }) => {
    const [error, setError] = useState(false);
    if (src && !error) {
      return (
        <img 
          src={src} 
          alt="" 
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} 
          onError={() => setError(true)}
        />
      );
    }
    return (
      <div style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%', 
        backgroundColor: 'var(--color-primary-bg)', 
        color: 'var(--color-primary)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '0.75rem', 
        fontWeight: 700 
      }}>
        {name?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  const jobsAttn = activeJobs.filter(job => {
     const appsForJob = applications.filter(a => a.jobId === job.id);
     return appsForJob.length === 0;
  });

  const formatRelativeTime = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return 'Just now';
    const date = timestamp.toDate();
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getActivityMessage = (act) => {
    const name = <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{act.entity?.name}</span>;
    switch (act.action) {
      case 'JOB_CREATED': return <>posted a new job: {name}</>;
      case 'CANDIDATE_CREATED': return <>added candidate: {name}</>;
      case 'CV_UPLOADED': return <>uploaded CV for: {name}</>;
      case 'STAGE_CHANGED': return <>moved {name} to <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{act.details?.newStage}</span></>;
      case 'APPLICATION_CREATED': return <>linked {name} to a job pipeline</>;
      case 'NOTE_ADDED': return <>updated notes for: {name}</>;
      case 'INVITATION_ACCEPTED': return <>accepted the workspace invitation to join as <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{act.details?.role}</span></>;
      case 'INVITATION_DECLINED': return <><span style={{ color: 'var(--color-danger)' }}>declined</span> the workspace invitation</>;
      case 'MEMBER_REMOVED': return <>removed <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{act.entity?.name}</span> from the workspace</>;
      case 'MEMBER_LEFT': return <><span style={{ color: 'var(--color-danger)' }}>left</span> the workspace</>;
      default: return <>action: {act.action}</>;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Recruitment Overview</h1>
        <p className="text-secondary" style={{ marginTop: '0.5rem', fontSize: '1rem' }}>Welcome back. Here is the pulse of your talent pipeline.</p>
      </div>

      {/* Top Metrics Cards */}
      <div className="dashboard-kpi-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="card metric-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'var(--transition-smooth)', cursor: 'default' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary-bg)', borderRadius: 'var(--radius-md)' }}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[24px] text-primary">work</span>
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{activeJobs.length}</h2>
            <p className="text-secondary" style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Jobs</p>
          </div>
        </div>
        
        <div className="card metric-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'var(--transition-smooth)', cursor: 'default' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)' }}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[24px] text-success">description</span>
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{candidates.length}</h2>
            <p className="text-secondary" style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Talent Pool</p>
          </div>
        </div>
        
        <div className="card metric-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'var(--transition-smooth)', cursor: 'default' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-warning-bg)', borderRadius: 'var(--radius-md)' }}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[24px] text-warning">layers</span>
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{stageCounts['New'] || 0}</h2>
            <p className="text-secondary" style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Apps</p>
          </div>
        </div>

        <div className="card metric-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'var(--transition-smooth)', cursor: 'default' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[24px] text-primary">group</span>
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{stageCounts['Interview'] || 0}</h2>
            <p className="text-secondary" style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interviews</p>
          </div>
        </div>
      </div>

      <div className="dashboard-body-grid">
        
        {/* Main Feed: Top Matches & Funnel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-success">check_circle</span> Top AI Matched Candidates
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
                    <Link to={`/dashboard/w/${workspaceId}/pipeline`} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}><span className="material-symbols-outlined flex-shrink-0 !text-[18px]">chevron_right</span></Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-primary">monitoring</span> Active Funnel Preview
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

          {/* Sidebar: Attention & Workspace Activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Needs Attention Card */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', color: 'var(--color-warning)' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">error</span> Needs Attention
              </h3>
              {jobsAttn.length === 0 ? (
                 <p className="text-muted" style={{ fontSize: '0.8125rem' }}>All active jobs have pipeline engagement.</p>
              ) : jobsAttn.map(job => (
                <div key={job.id} style={{ padding: '1rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{job.title}</div>
                  <div className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>0 applications</div>
                  <Link to={`/dashboard/w/${workspaceId}/jobs/${job.id}`} className="text-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', marginTop: '0.75rem', fontWeight: 700 }}>
                    View Mandate <span className="material-symbols-outlined flex-shrink-0 !text-[12px]">chevron_right</span>
                  </Link>
                </div>
              ))}
            </div>

            {/* REAL-TIME ACTIVITY FEED */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-primary">schedule</span> Workspace Activity
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activities.length === 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '3rem 2rem', 
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-surface-hover)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--color-surface-border)'
                  }}>
                    <span className="material-symbols-outlined flex-shrink-0 !text-[40px]" style={{ opacity: 0.2, marginBottom: '1rem' }}>monitoring</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>No recent activity.</p>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.7 }}>Recent workspace updates will appear here.</p>
                  </div>
                ) : (
                  activities.slice(0, 3).map((act, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      gap: '1rem', 
                      marginBottom: '1.25rem', 
                      paddingBottom: idx < activities.length - 1 ? '1.25rem' : 0, 
                      borderBottom: idx < activities.length - 1 ? '1px solid var(--color-surface-border)' : 'none' 
                    }}>
                      <div style={{ flexShrink: 0 }}>
                        <SafeImage src={act.actor?.photoURL} name={act.actor?.name} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{act.actor?.name || 'Someone'}</span> {getActivityMessage(act)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span className="material-symbols-outlined flex-shrink-0 !text-[12px]">schedule</span> {formatRelativeTime(act.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <Link to={`/dashboard/w/${workspaceId}/settings?tab=activity`} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8125rem', fontWeight: 700, marginTop: '0.5rem', justifyContent: 'center' }}>
                View Full Activity
              </Link>
            </div>
          </div>

      </div>
    </div>
  );
}

const DashboardSkeleton = () => (
  <div>
    <div style={{ marginBottom: '2.5rem' }}>
      <Skeleton variant="title" width="40%" height="2.5rem" />
      <Skeleton variant="text" width="60%" style={{ marginTop: '0.5rem' }} />
    </div>

    <div className="dashboard-kpi-grid" style={{ marginBottom: '2.5rem' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Skeleton variant="rect" width="56px" height="56px" style={{ borderRadius: 'var(--radius-md)' }} />
          <div style={{ flex: 1 }}>
            <Skeleton variant="title" width="60px" height="2rem" />
            <Skeleton variant="text" width="80px" />
          </div>
        </div>
      ))}
    </div>

    <div className="dashboard-body-grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <Skeleton variant="title" width="200px" style={{ marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--color-surface-border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ flex: 1 }}>
                  <Skeleton variant="text" width="150px" />
                  <Skeleton variant="text" width="100px" style={{ marginTop: '0.25rem' }} />
                </div>
                <Skeleton variant="rect" width="40px" height="40px" style={{ borderRadius: 'var(--radius-sm)' }} />
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: '2rem' }}>
          <Skeleton variant="title" width="180px" style={{ marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <Skeleton variant="text" width="80px" />
                <Skeleton variant="rect" style={{ flex: 1, height: '8px', borderRadius: 'var(--radius-full)' }} />
                <Skeleton variant="text" width="30px" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', height: '180px' }}>
          <Skeleton variant="text" width="120px" style={{ marginBottom: '1.25rem' }} />
          <Skeleton variant="rect" height="80px" style={{ borderRadius: 'var(--radius-md)' }} />
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <Skeleton variant="text" width="150px" style={{ marginBottom: '1.5rem' }} />
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
              <Skeleton variant="avatar" />
              <div style={{ flex: 1 }}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="40%" style={{ marginTop: '0.375rem' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
