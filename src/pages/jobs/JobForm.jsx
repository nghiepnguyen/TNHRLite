import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import { getJob, createJob, updateJob, logActivity } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export default function JobForm() {
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
      alert(`Failed to ${isEditing ? 'update' : 'create'} job`);
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '2rem' }}>Loading job data...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to={isEditing ? `/dashboard/w/${workspaceId}/jobs/${id}` : `/dashboard/w/${workspaceId}/jobs`} className="text-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">arrow_back</span> Back
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isEditing ? <span className="material-symbols-outlined flex-shrink-0 !text-[24px] text-muted">edit</span> : null}
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isEditing ? 'Edit Job' : 'Create New Job'}</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px', padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Job Title *</label>
              <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} placeholder="e.g. Senior Frontend Engineer" required />
            </div>

            <div className="form-group">
              <label className="form-label">Client Name</label>
              <input type="text" name="clientName" className="form-control" value={formData.clientName} onChange={handleChange} placeholder="Company or Internal" />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input type="text" name="department" className="form-control" value={formData.department} onChange={handleChange} placeholder="e.g. Engineering, Sales" />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" name="location" className="form-control" value={formData.location} onChange={handleChange} placeholder="e.g. Remote, San Francisco" />
            </div>

            <div className="form-group">
              <label className="form-label">Headcount (Total Roles)</label>
              <input type="number" name="totalRoles" className="form-control" value={formData.totalRoles} onChange={handleChange} min="1" />
            </div>

            <div className="form-group">
              <label className="form-label">Submission Deadline</label>
              <input type="date" name="deadline" className="form-control" value={formData.deadline} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Employment Type</label>
              <select name="employmentType" className="form-control" value={formData.employmentType} onChange={handleChange}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-control" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Working Mode</label>
              <select name="workingMode" className="form-control" value={formData.workingMode} onChange={handleChange}>
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Salary Range</label>
              <input type="text" name="salaryRange" className="form-control" value={formData.salaryRange} onChange={handleChange} placeholder="e.g. $5,000 - $8,000" />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">HR Contact Information</label>
              <input type="text" name="hrContact" className="form-control" value={formData.hrContact} onChange={handleChange} placeholder="Name, Email or Phone of the primary recruiter" />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Job Description *</label>
              <textarea name="jdText" className="form-control" rows="8" value={formData.jdText} onChange={handleChange} placeholder="Paste job requirements, responsibilities..." required />
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills</label>
              <input type="text" name="requiredSkills" className="form-control" value={formData.requiredSkills} onChange={handleChange} placeholder="React, Node.js, Typescript (comma separated)" />
            </div>

            <div className="form-group">
              <label className="form-label">Optional Skills</label>
              <input type="text" name="optionalSkills" className="form-control" value={formData.optionalSkills} onChange={handleChange} placeholder="GraphQL, AWS (comma separated)" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--color-surface-border)', paddingTop: '1.5rem' }}>
            <Link to={isEditing ? `/dashboard/w/${workspaceId}/jobs/${id}` : `/dashboard/w/${workspaceId}/jobs`} className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

