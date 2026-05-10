import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ApplicationList({ applications, allJobs, workspaceId }) {
  const { t } = useTranslation();

  return (
    <div className="card" style={{ padding: '2rem' }}>
       <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-primary">layers</span> {t('candidateDetail.applications')}
       </h3>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>{t('candidateDetail.noApps')}</p>
          ) : applications.map(app => {
            const job = allJobs.find(j => j.id === app.jobId);
            const isJobInactive = job && job.status !== 'Active';
            
            return (
              <div 
                key={app.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1rem', 
                  backgroundColor: isJobInactive ? 'var(--color-surface-base)' : 'var(--color-surface-hover)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--color-surface-border)',
                  opacity: isJobInactive ? 0.75 : 1
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                     <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{job?.title || t('common.unknown')}</span>
                    {job && (
                      <span style={{ 
                        fontSize: '0.65rem', 
                        textTransform: 'uppercase', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        backgroundColor: job.status === 'Active' ? 'var(--color-success-bg)' : job.status === 'Closed' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
                        color: job.status === 'Active' ? 'var(--color-success)' : job.status === 'Closed' ? 'var(--color-danger)' : 'var(--color-warning)',
                        fontWeight: 700
                      }}>
                         {t(`jobsPage.tabs.${job.status.toLowerCase().replace('-', '')}`)}
                      </span>
                    )}
                  </div>
                  <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{job?.clientName || 'Archive'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className={app.fitScore > 75 ? 'text-success' : 'text-warning'} style={{ fontWeight: 700, fontSize: '0.875rem' }}>{app.fitScore}% {t('candidateDetail.match')}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>{app.stage}</div>
                  </div>
                  <Link to={`/dashboard/w/${workspaceId}/pipeline`} className="btn btn-secondary" style={{ padding: '0.375rem' }}>
                    <span className="material-symbols-outlined flex-shrink-0 !text-[14px]">open_in_new</span>
                  </Link>
                </div>
              </div>
            );
          })}
       </div>
    </div>
  );
}
