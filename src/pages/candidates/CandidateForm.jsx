import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Save } from 'lucide-react';
import { getCandidate, updateCandidate, createCandidate } from '../../services/db';

export default function CandidateForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentTitle: '',
    currentCompany: '',
    yearsExperience: '',
    location: '',
    skills: '',
    education: '',
    certifications: '',
    parsedResume: ''
  });

  useEffect(() => {
    if (isEditing) {
      async function fetchCandidateData() {
        const candidate = await getCandidate(id);
        if (candidate) {
          setFormData({
            fullName: candidate.fullName || '',
            email: candidate.email || '',
            phone: candidate.phone || '',
            currentTitle: candidate.currentTitle || '',
            currentCompany: candidate.currentCompany || '',
            yearsExperience: candidate.yearsExperience || '',
            location: candidate.location || '',
            skills: Array.isArray(candidate.skills) ? candidate.skills.join(', ') : '',
            education: candidate.education || '',
            certifications: candidate.certifications || '',
            parsedResume: candidate.parsedResume || ''
          });
        }
        setFetching(false);
      }
      fetchCandidateData();
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
      yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : 0,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      if (isEditing) {
        await updateCandidate(id, payload);
        navigate(`/candidates/${id}`);
      } else {
        const newId = await createCandidate(payload);
        // Track manual candidate creation event
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'create_candidate', {
            'event_category': 'Engagement',
            'event_label': 'Manual Candidate Created'
          });
        }
        navigate(`/candidates/${newId}`);
      }
    } catch (error) {
      console.error(error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} candidate`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '2rem' }}>Loading candidate data...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to={isEditing ? `/candidates/${id}` : "/candidates"} className="text-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{isEditing ? 'Edit Candidate' : 'Manual Candidate Entry'}</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px', padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Full Name *</label>
              <input type="text" name="fullName" className="form-control" value={formData.fullName} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Current Title</label>
              <input type="text" name="currentTitle" className="form-control" value={formData.currentTitle} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Current Company</label>
              <input type="text" name="currentCompany" className="form-control" value={formData.currentCompany} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Years Experience</label>
              <input type="number" name="yearsExperience" className="form-control" value={formData.yearsExperience} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" name="location" className="form-control" value={formData.location} onChange={handleChange} />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Skills (comma separated)</label>
              <input type="text" name="skills" className="form-control" value={formData.skills} onChange={handleChange} placeholder="e.g. React, Node.js, Python" />
            </div>

            <div className="form-group">
              <label className="form-label">Education</label>
              <input type="text" name="education" className="form-control" value={formData.education} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Certifications</label>
              <input type="text" name="certifications" className="form-control" value={formData.certifications} onChange={handleChange} />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Parsed Resume / Bio Summary</label>
              <textarea name="parsedResume" className="form-control" rows="6" value={formData.parsedResume} onChange={handleChange} placeholder="Full analysis summary..." />
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--color-surface-border)', paddingTop: '1.5rem' }}>
            <Link to={isEditing ? `/candidates/${id}` : "/candidates"} className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Save Candidate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
