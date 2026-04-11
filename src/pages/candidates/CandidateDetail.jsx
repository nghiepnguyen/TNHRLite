import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase, ExternalLink, Link as LinkIcon, FileText, Trash2, Edit } from 'lucide-react';
import { getCandidate, updateCandidate, getJobs, createApplication, deleteCandidate } from '../../services/db';
import { compareCandidateToJob } from '../../services/ai';

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const dbCandidate = await getCandidate(id);
      if (dbCandidate) {
        setCandidate(dbCandidate);
        setNotes(dbCandidate.recruiterNotes || '');
      }

      // Fetch active jobs to link candidate
      const activeJobs = await getJobs();
      setJobs(activeJobs.filter(j => j.status === 'Active'));
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateCandidate(id, { recruiterNotes: notes });
      alert('Notes saved!');
    } catch (e) {
      console.error(e);
      alert('Failed to save notes');
    }
    setSavingNotes(false);
  };

  const handleLinkToJob = async () => {
    if (!selectedJob) return alert('Select a job first');
    setLinking(true);
    try {
      const targetJob = jobs.find(j => j.id === selectedJob);
      
      // Hit Proxy Server for GenAI Comparison
      const aiResults = await compareCandidateToJob(candidate, targetJob);

      await createApplication({
        candidateId: id,
        jobId: selectedJob,
        fitScore: aiResults.fitScore || 0,
        strengths: aiResults.strengths || [],
        gaps: aiResults.gaps || [],
        aiSummary: aiResults.aiSummary || '',
      });
      
      // Track candidate matching event
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'candidate_matched', {
          'job_id': selectedJob,
          'fit_score': aiResults.fitScore || 0
        });
      }
      
      alert('Successfully linked! AI generated match score and summary.');
      setSelectedJob('');
    } catch (error) {
      console.error(error);
      alert('Failed to link applicant. Try again.');
    } finally {
      setLinking(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this candidate? Pipeline history forms will be wiped.')) {
      try {
        await deleteCandidate(id);
        navigate('/candidates');
      } catch (error) {
        console.error(error);
        alert('Could not delete the candidate.');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Candidate...</div>;
  if (!candidate) return <div style={{ padding: '2rem' }}>Candidate not found.</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/candidates" className="text-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Talent Pool
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--color-surface-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={32} className="text-secondary" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{candidate.fullName}</h1>
              <p className="text-secondary" style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{candidate.currentTitle} at {candidate.currentCompany}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {candidate.cvFileUrl && (
              <a href={candidate.cvFileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <ExternalLink size={16} /> View Original CV
              </a>
            )}
            <Link to={`/candidates/${id}/edit`} className="btn btn-secondary">
               <Edit size={16} /> Edit
            </Link>
            <button onClick={handleDelete} className="btn" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
              <Trash2 size={16} style={{ marginRight: '0.5rem' }} /> Delete Candidate
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Left Column: Parsed Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              <Mail size={16} /> {candidate.email || 'N/A'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              <Phone size={16} /> {candidate.phone || 'N/A'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              <MapPin size={16} /> {candidate.location || 'N/A'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              <Briefcase size={16} /> {candidate.yearsExperience ? `${candidate.yearsExperience} yrs exp.` : 'Exp N/A'}
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--color-surface-border)', paddingBottom: '0.5rem' }}>Structure Resume Data</h2>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
              {candidate.parsedResume || 'No resume data parsed.'}
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
             <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Extracted Skills</h3>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {candidate.skills && candidate.skills.length > 0 ? candidate.skills.map((s, i) => (
                  <span key={i} className="badge badge-neutral" style={{ padding: '0.375rem 0.75rem' }}>{s}</span>
                )) : <span className="text-muted">None</span>}
             </div>
          </div>
        </div>

        {/* Right Column: Actions & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LinkIcon size={18} className="text-secondary" /> Add to Pipeline
            </h3>
             <select className="form-control" style={{ marginBottom: '1rem' }} value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
                <option value="">Select a Job...</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title} - {j.clientName}</option>)}
             </select>
             <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleLinkToJob} disabled={linking}>
               {linking ? 'Linking...' : 'Link to Job Pipeline'}
             </button>
          </div>

          <div className="card" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} className="text-secondary" /> Recruiter Notes
            </h3>
            <textarea 
              className="form-control" 
              style={{ flex: 1, minHeight: '150px', marginBottom: '1rem', resize: 'vertical' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this candidate..."
            />
            <button className="btn btn-secondary" onClick={handleSaveNotes} disabled={savingNotes}>
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
