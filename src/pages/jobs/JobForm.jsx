import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getJob, createJob, updateJob, logActivity } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export default function JobForm() {
  const { t } = useTranslation();
  const { workspaceId, id } = useParams();
  const { userProfile } = useWorkspace();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    department: '',
    location: '',
    employmentType: 'Full-time',
    status: 'Active',
    totalRoles: 1,
    deadline: '',
    jdText: '',
    requiredSkills: '',
    optionalSkills: '',
    workingMode: 'On-site',
    salaryRange: '',
    hrContact: ''
  });

  useEffect(() => {
    if (isEditing) {
      async function fetchJobData() {
        const job = await getJob(id, workspaceId);
        if (job) {
          setFormData({
            title: job.title || '',
            clientName: job.clientName || '',
            department: job.department || '',
            location: job.location || '',
            employmentType: job.employmentType || 'Full-time',
            status: job.status || 'Active',
            totalRoles: job.totalRoles || 1,
            deadline: job.deadline ? job.deadline.split('T')[0] : '',
            jdText: job.jdText || '',
            requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '',
            optionalSkills: Array.isArray(job.optionalSkills) ? job.optionalSkills.join(', ') : '',
            workingMode: job.workingMode || 'On-site',
            salaryRange: job.salaryRange || '',
            hrContact: job.hrContact || ''
          });
        }
        setFetching(false);
      }
      fetchJobData();
    }
  }, [id, workspaceId, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      totalRoles: parseInt(formData.totalRoles),
      requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      optionalSkills: formData.optionalSkills.split(',').map(s => s.trim()).filter(Boolean),
      createdBy: currentUser?.uid || 'anonymous'
    };

    try {
      if (isEditing) {
        await updateJob(id, payload);
        navigate(`/dashboard/w/${workspaceId}/jobs/${id}`);
      } else {
        const newId = await createJob(workspaceId, payload);
        
        // Log activity
        await logActivity(workspaceId, userProfile, 'JOB_CREATED', {
          type: 'job',
          id: newId,
          name: payload.title
        }, {
          client: payload.clientName
        });

        // Track job creation event
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'create_job', {
            'event_category': 'Engagement',
            'event_label': 'New Job Created'
          });
        }
        navigate(`/dashboard/w/${workspaceId}/jobs/${newId}`);
      }
    } catch (error) {
      console.error(error);
      alert(t('candidateForm.saveFail'));
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '2rem' }}>{t('common.loading')}</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to={isEditing ? `/dashboard/w/${workspaceId}/jobs/${id}` : `/dashboard/w/${workspaceId}/jobs`} className="text-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">arrow_back</span> {t('common.back')}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isEditing ? <span className="material-symbols-outlined flex-shrink-0 !text-[24px] text-muted">edit</span> : null}
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isEditing ? t('jobsPage.detail.editJob') : t('jobsPage.form.createJob')}</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px', padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">{t('jobsPage.form.title')} *</label>
              <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} placeholder={t('jobsPage.form.placeholder.title')} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('jobsPage.form.client')}</label>
              <input type="text" name="clientName" className="form-control" value={formData.clientName} onChange={handleChange} placeholder={t('jobsPage.form.placeholder.client')} />
            </div>

            <div className="form-group">
              <label className="form-label">{t('jobsPage.form.dept')}</label>
              <input type="text" name="department" className="form-control" value={formData.department} onChange={handleChange} placeholder={t('jobsPage.form.placeholder.dept')} />
            </div>

            <div className="form-group">
              <label className="form-label">{t('jobsPage.form.location')}</label>
              <input type="text" name="location" className="form-control" value={formData.location} onChange={handleChange} placeholder={t('jobsPage.form.placeholder.location')} />
            </div>

            <div className="form-group">
              <label className="form-label">{t('jobsPage.form.headcount')}</label>
              <input type="number" name="totalRoles" className="form-control" value={formData.totalRoles} onChange={handleChange} min="1" />
            </div>

            <div className="form-group">
              <label className="form-label">{t('jobsPage.form.deadline')}</label>
              <input type="date" name="deadline" className="form-control" value={formData.deadline} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">{t('jobsPage.form.type')}</label>
              <select name="employmentType" className="form-control" value={formData.employmentType} onChange={handleChange}>
                <option value="Full-time">{t('jobsPage.form.types.fulltime')}</option>
                <option value="Part-time">{t('jobsPage.form.types.parttime')}</option>
                <option value="Contract">{t('jobsPage.form.types.contract')}</option>
                <option value="Freelance">{t('jobsPage.form.types.freelance')}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('jobsPage.form.status')}</label>
              <select name="status" className="form-control" value={formData.status} onChange={handleChange}>
                <option value="Active">{t('jobsPage.tabs.active')}</option>
                <option value="Closed">{t('jobsPage.tabs.closed')}</option>
                <option value="Draft">{t('jobsPage.tabs.draft')}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('jobsPage.form.mode')}</label>
              <select name="workingMode" className="form-control" value={formData.workingMode} onChange={handleChange}>
                <option value="On-site">{t('jobsPage.form.modes.onsite')}</option>
                <option value="Remote">{t('jobsPage.form.modes.remote')}</option>
                <option value="Hybrid">{t('jobsPage.form.modes.hybrid')}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('jobsPage.form.salary')}</label>
              <input type="text" name="salaryRange" className="form-control" value={formData.salaryRange} onChange={handleChange} placeholder={t('jobsPage.form.placeholder.salary')} />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">{t('jobsPage.form.contact')}</label>
              <input type="text" name="hrContact" className="form-control" value={formData.hrContact} onChange={handleChange} placeholder={t('jobsPage.form.placeholder.contact')} />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">{t('jobsPage.form.jd')} *</label>
              <textarea name="jdText" className="form-control" rows="8" value={formData.jdText} onChange={handleChange} placeholder={t('jobsPage.form.placeholder.jd')} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('jobsPage.form.required')}</label>
              <input type="text" name="requiredSkills" className="form-control" value={formData.requiredSkills} onChange={handleChange} placeholder={t('jobsPage.form.placeholder.required')} />
            </div>

            <div className="form-group">
              <label className="form-label">{t('jobsPage.form.optional')}</label>
              <input type="text" name="optionalSkills" className="form-control" value={formData.optionalSkills} onChange={handleChange} placeholder={t('jobsPage.form.placeholder.optional')} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--color-surface-border)', paddingTop: '1.5rem' }}>
            <Link to={isEditing ? `/dashboard/w/${workspaceId}/jobs/${id}` : `/dashboard/w/${workspaceId}/jobs`} className="btn btn-secondary">{t('common.cancel')}</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('candidateForm.saving') : (isEditing ? t('jobsPage.form.saveChanges') : t('jobsPage.form.createJob'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

