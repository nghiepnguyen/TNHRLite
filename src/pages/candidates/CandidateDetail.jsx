import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useWorkspace } from '../../contexts/WorkspaceContext';
import SEO from '../../components/common/SEO';
import { useCandidateDetail } from '../../hooks/useCandidateDetail';
import CandidateInfoCard from '../../components/candidates/CandidateInfoCard';
import ApplicationList from '../../components/candidates/ApplicationList';

export default function CandidateDetail() {
  const { t } = useTranslation();
  const { workspaceId, id } = useParams();
  const { userProfile } = useWorkspace();
  
  const {
    candidate,
    jobs,
    allJobs,
    linkedApplications,
    loading,
    savingNotes,
    linking,
    isDeleting,
    handleSaveNotes,
    handleLinkToJob,
    handleDelete
  } = useCandidateDetail(id, workspaceId, userProfile);

  const [selectedJob, setSelectedJob] = useState('');
  const [notes, setNotes] = useState('');
  const [prevCandidateId, setPrevCandidateId] = useState(null);

  const currentId = candidate?.id ?? null;
  if (currentId !== prevCandidateId) {
    setPrevCandidateId(currentId);
    setNotes(candidate?.recruiterNotes || '');
  }

  const onSaveNotes = async () => {
    const result = await handleSaveNotes(notes);
    if (result.success) {
      alert(t('candidateDetail.notesSaved'));
    } else {
      alert(t('candidateDetail.saveNotesFail'));
    }
  };

  const onLinkToJob = async () => {
    const result = await handleLinkToJob(selectedJob);
    if (result.success) {
      alert('Successfully linked! AI generated match score and summary.');
      setSelectedJob('');
    } else if (result.error === 'NO_JOB_SELECTED') {
      alert(t('candidateDetail.selectJobError'));
    } else {
      alert('Failed to link applicant. Try again.');
    }
  };

  const onDeleteCandidate = async () => {
    if (window.confirm('Are you sure you want to permanently delete this candidate? Pipeline history forms will be wiped.')) {
      const result = await handleDelete();
      if (!result.success) {
        alert('Could not delete the candidate.');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Candidate...</div>;
  if (!candidate) return <div style={{ padding: '2rem' }}>Candidate not found.</div>;

  return (
    <div>
      <SEO title={`${candidate.fullName} | HR Lite`} />
      
      {/* Header Section */}
      <div style={{ marginBottom: '2.5rem', padding: '2rem', backgroundColor: 'var(--color-surface-base)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-surface-border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', backgroundColor: 'var(--color-primary-bg)', borderRadius: '50%', opacity: 0.1, zIndex: 0 }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to={`/dashboard/w/${workspaceId}/candidates`} className="text-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">arrow_back</span> {t('candidateDetail.back')}
          </Link>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-primary-bg)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', border: '1px solid var(--color-primary-border)', flexShrink: 0 }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[40px]">person</span>
              </div>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{candidate.fullName}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.125rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>{candidate.currentTitle || t('candidatesPage.na')}</span>
                  <span className="text-secondary" style={{ fontSize: '1rem' }}>{t('candidateForm.company').toLowerCase()}</span>
                  <span style={{ fontSize: '1.125rem', color: 'var(--color-primary)', fontWeight: 600 }}>{candidate.currentCompany || t('candidatesPage.na')}</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to={`/dashboard/w/${workspaceId}/candidates/${id}/edit`} className="btn btn-secondary" style={{ height: '42px' }}>
                 <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">edit</span> {t('candidateDetail.editBtn')}
              </Link>
              <button onClick={onDeleteCandidate} className="btn" disabled={isDeleting} style={{ height: '42px', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">{isDeleting ? 'sync' : 'delete'}</span> {t('candidateDetail.delete')}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <div className="badge badge-primary" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">work</span> {candidate.yearsExperience} {t('candidateForm.exp')}
            </div>
            <div className="badge badge-neutral" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">location_on</span> {candidate.location || t('candidatesPage.na')}
            </div>
            <div className="badge badge-neutral" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">school</span> {candidate.education?.split(',')[0] || t('candidateDetail.education')}
            </div>
            {candidate.cvFileUrl && (
              <a href={candidate.cvFileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginLeft: 'auto', height: '44px' }}>
                <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">open_in_new</span> Full CV
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <CandidateInfoCard candidate={candidate} />
          <ApplicationList applications={linkedApplications} allJobs={allJobs} workspaceId={workspaceId} />
        </div>

        {/* Sidebar: Actions & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-secondary">add_link</span> {t('candidateDetail.linkJob')}
            </h3>
             <select className="form-control" style={{ marginBottom: '1rem' }} value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
                <option value="">{t('candidateDetail.selectJob')}</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title} - {j.clientName}</option>)}
             </select>
             <button className="btn btn-primary" style={{ width: '100%' }} onClick={onLinkToJob} disabled={linking}>
               {linking ? t('candidateDetail.linking') : t('candidateDetail.linkBtn')}
             </button>
          </div>

          <div className="card" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-secondary">description</span> {t('candidateDetail.notes')}
            </h3>
            <textarea 
              className="form-control" 
              style={{ flex: 1, minHeight: '150px', marginBottom: '1rem', resize: 'vertical' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('candidateDetail.notesPlaceholder')}
            />
            <button className="btn btn-secondary" onClick={onSaveNotes} disabled={savingNotes}>
              {savingNotes ? t('candidateForm.saving') : t('candidateDetail.saveNotes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
