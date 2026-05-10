import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { getJob, deleteJob } from '../../services/db';
import SEO from '../../components/common/SEO';
import { formatDate } from '../../utils/dateUtils';

export default function JobDetail() {
  const { t, i18n } = useTranslation();
  const { workspaceId, id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    async function fetchJob() {
      const fetchedJob = await getJob(id, workspaceId);
      if (fetchedJob) {
        setJob(fetchedJob);
      } else {
        // If not found in mock/real db, back to list
        navigate(`/dashboard/w/${workspaceId}/jobs`);
      }
      setLoading(false);
    }
    fetchJob();
  }, [id, workspaceId, navigate]);

  const handleDelete = async () => {
    if (window.confirm(t('jobsPage.messages.deleteConfirm'))) {
      setIsDeleting(true);
      try {
        await deleteJob(id, workspaceId);
        navigate(`/dashboard/w/${workspaceId}/jobs`);
      } catch (error) {
        console.error(error);
        alert(t('membersPage.messages.removeError', { error: error.message }));
        setIsDeleting(false);
      }
    }
  };


  if (loading) return <div style={{ padding: '2rem' }}>{t('jobsPage.detail.loading')}</div>;
  if (!job) return null;

  return (
    <div>
      <SEO title={`${job.title} | HR Lite`} />
      <div style={{ marginBottom: '2rem' }}>
        <Link to={`/dashboard/w/${workspaceId}/jobs`} className="text-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">arrow_back</span> {t('jobsPage.detail.back')}
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>{job.title}</h1>
              <span className={`badge ${job.status === 'Closed' ? 'badge-neutral' : 'badge-success'}`}>
                {t(`jobsPage.tabs.${(job.status || 'Active').toLowerCase().replace('-', '')}`)}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">business</span> {job.clientName || t('jobsPage.detail.internalDirect')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">location_on</span> {job.location || t('jobsPage.detail.locNotSpecified')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">work</span> {job.employmentType || t('jobsPage.detail.fullTime')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">calendar_month</span> {t('jobsPage.detail.created')} {job.createdAt ? formatDate(job.createdAt) : t('dashboard.justNow')}
              </div>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            <button onClick={handleDelete} className="btn" disabled={isDeleting} style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">{isDeleting ? 'sync' : 'delete'}</span> {isDeleting ? t('jobsPage.detail.deleting') : t('jobsPage.detail.delete')}
            </button>
            <Link to={`/dashboard/w/${workspaceId}/jobs/${job.id}/edit`} className="btn btn-secondary">
              <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">edit</span> {t('jobsPage.detail.editJob')}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid var(--color-surface-border)', paddingBottom: '0.75rem' }}>{t('jobsPage.detail.jdTitle')}</h2>
          <div style={{ whiteSpace: 'pre-line', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
            {job.jdText || t('jobsPage.detail.noDesc')}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-secondary">check_box</span> {t('jobsPage.detail.reqSkills')}
            </h3>
            {job.requiredSkills && job.requiredSkills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {job.requiredSkills.map((skill, index) => (
                  <span key={index} className="badge badge-neutral" style={{ padding: '0.375rem 0.75rem' }}>{skill}</span>
                ))}
              </div>
            ) : (
               <div className="text-muted" style={{ fontSize: '0.875rem' }}>{t('jobsPage.detail.none')}</div>
            )}
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-secondary">check_box</span> {t('jobsPage.detail.optSkills')}
            </h3>
            {job.optionalSkills && job.optionalSkills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {job.optionalSkills.map((skill, index) => (
                  <span key={index} className="badge" style={{ backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-surface-border)', padding: '0.375rem 0.75rem' }}>{skill}</span>
                ))}
              </div>
            ) : (
               <div className="text-muted" style={{ fontSize: '0.875rem' }}>{t('jobsPage.detail.none')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
