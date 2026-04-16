import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { getJob, deleteJob } from '../../services/db';

export default function JobDetail() {
  const { workspaceId, id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

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
    if (window.confirm('Are you sure you want to delete this job? All candidate links in the pipeline will be removed.')) {
      try {
        await deleteJob(id, workspaceId);
        navigate(`/dashboard/w/${workspaceId}/jobs`);
      } catch (error) {
        console.error(error);
        alert('Failed to delete job');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading job details...</div>;
  if (!job) return null;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to={`/dashboard/w/${workspaceId}/jobs`} className="text-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">arrow_back</span> Back to Jobs
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>{job.title}</h1>
              <span className={`badge ${job.status === 'Closed' ? 'badge-neutral' : 'badge-success'}`}>
                {job.status || 'Active'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">business</span> {job.clientName || 'Internal / Direct'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">location_on</span> {job.location || 'Location Not Specified'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">work</span> {job.employmentType || 'Full-time'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">calendar_month</span> Created: {job.createdAt?.toDate ? job.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Just now'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleDelete} className="btn" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">delete</span> Delete
            </button>
            <Link to={`/dashboard/w/${workspaceId}/jobs/${job.id}/edit`} className="btn btn-secondary">
              <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">edit</span> Edit Job
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid var(--color-surface-border)', paddingBottom: '0.75rem' }}>Job Description</h2>
          <div style={{ whiteSpace: 'pre-line', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
            {job.jdText || 'No description provided.'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-secondary">check_box</span> Required Skills
            </h3>
            {job.requiredSkills && job.requiredSkills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {job.requiredSkills.map((skill, index) => (
                  <span key={index} className="badge badge-neutral" style={{ padding: '0.375rem 0.75rem' }}>{skill}</span>
                ))}
              </div>
            ) : (
               <div className="text-muted" style={{ fontSize: '0.875rem' }}>None specified.</div>
            )}
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-secondary">check_box</span> Optional Skills
            </h3>
            {job.optionalSkills && job.optionalSkills.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {job.optionalSkills.map((skill, index) => (
                  <span key={index} className="badge" style={{ backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-surface-border)', padding: '0.375rem 0.75rem' }}>{skill}</span>
                ))}
              </div>
            ) : (
               <div className="text-muted" style={{ fontSize: '0.875rem' }}>None specified.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
