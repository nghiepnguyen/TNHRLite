import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CandidateInfoCard({ candidate }) {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', backgroundColor: 'var(--color-surface-hover)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[16px] text-primary">mail</span> {candidate.email || t('candidatesPage.na')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[16px] text-primary">phone</span> {candidate.phone || t('candidatesPage.na')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">location_on</span> {candidate.location || t('candidatesPage.na')}
        </div>
      </div>

      <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--color-primary)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[20px]" style={{ color: 'var(--color-warning)' }}>bolt</span> AI Execution Summary
        </h2>
        <div style={{ fontSize: '1rem', color: 'var(--color-text-primary)', lineHeight: 1.6, fontWeight: 500, fontStyle: 'italic' }}>
          "{candidate.parsedResume || t('candidateDetail.noResume')}"
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">school</span> {t('candidateDetail.education')}
          </h3>
          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{candidate.education || t('jobsPage.detail.none')}</p>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
            <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">workspace_premium</span> {t('candidateForm.certs')}
          </h3>
          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{candidate.certifications || t('jobsPage.detail.none')}</p>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
         <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid var(--color-surface-border)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <span className="material-symbols-outlined flex-shrink-0 !text-[18px] text-primary">psychology</span> {t('candidateDetail.skills')}
         </h3>
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {candidate.skills && candidate.skills.length > 0 ? candidate.skills.map((s, i) => (
               <span key={i} className="badge badge-primary" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 500 }}>{s}</span>
            )) : <span className="text-muted">{t('jobsPage.detail.none')}</span>}
         </div>
      </div>
    </div>
  );
}
