import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { getJob, createJob, updateJob } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';

export default function JobForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    location: '',
    employmentType: 'Full-time',
    status: 'Active',
    jdText: '',
    requiredSkills: '',
    optionalSkills: ''
  });

  useEffect(() => {
    if (isEditing) {
      async function fetchJobData() {
        const job = await getJob(id);
        if (job) {
          setFormData({
            title: job.title || '',
            clientName: job.clientName || '',
            location: job.location || '',
            employmentType: job.employmentType || 'Full-time',
            status: job.status || 'Active',
            jdText: job.jdText || '',
            requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '',
            optionalSkills: Array.isArray(job.optionalSkills) ? job.optionalSkills.join(', ') : ''
          });
        }
        setFetching(false);
      }
      fetchJobData();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      optionalSkills: formData.optionalSkills.split(',').map(s => s.trim()).filter(Boolean),
      createdBy: currentUser?.uid || 'anonymous'
    };

    try {
      if (isEditing) {
        await updateJob(id, payload);
        navigate(`/jobs/${id}`);
      } else {
        const newId = await createJob(payload);
        // Track job creation event
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'create_job', {
            'event_category': 'Engagement',
            'event_label': 'New Job Created'
          });
        }
        navigate(`/jobs/${newId}`);
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
        <Link to={isEditing ? `/jobs/${id}` : "/jobs"} className="text-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isEditing ? <Edit size={24} className="text-muted"/> : null}
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
              <label className="form-label">Location</label>
              <input type="text" name="location" className="form-control" value={formData.location} onChange={handleChange} placeholder="e.g. Remote, San Francisco" />
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
            <Link to={isEditing ? `/jobs/${id}` : "/jobs"} className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
