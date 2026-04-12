import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase, ExternalLink, Link as LinkIcon, FileText, Trash2, Edit, Layers, GraduationCap, Award, Zap } from 'lucide-react';
import { getCandidate, updateCandidate, getJobs, createApplication, deleteCandidate, getApplicationsByCandidate } from '../../services/db';
import { compareCandidateToJob } from '../../services/ai';

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]); // Store Active jobs for selection
  const [allJobs, setAllJobs] = useState([]); // Store ALL jobs for status resolution
  const [selectedJob, setSelectedJob] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [linkedApplications, setLinkedApplications] = useState([]);
  const [savingNotes, setSavingNotes] = useState(false);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [dbCandidate, activeJobs, dbApps] = await Promise.all([
        getCandidate(id),
        getJobs(),
        getApplicationsByCandidate(id)
      ]);

      if (dbCandidate) {
        setCandidate(dbCandidate);
        setNotes(dbCandidate.recruiterNotes || '');
      }

      setAllJobs(activeJobs);
      setJobs(activeJobs.filter(j => j.status === 'Active'));
      setLinkedApplications(dbApps);
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
      
      // Refresh linked applications list
      const updatedApps = await getApplicationsByCandidate(id);
      setLinkedApplications(updatedApps);
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
      <div style={{ marginBottom: '2.5rem', padding: '2rem', backgroundColor: 'var(--color-surface-base)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-surface-border)', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle Background Decoration */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', backgroundColor: 'var(--color-primary-bg)', borderRadius: '50%', opacity: 0.1, zIndex: 0 }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/candidates" className="text-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Talent Pool
          </Link>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-primary-bg)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', border: '1px solid var(--color-primary-border)' }}>
                <User size={40} />
              </div>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{candidate.fullName}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.125rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>{candidate.currentTitle}</span>
                  <span className="text-secondary" style={{ fontSize: '1rem' }}>at</span>
                  <span style={{ fontSize: '1.125rem', color: 'var(--color-primary)', fontWeight: 600 }}>{candidate.currentCompany}</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to={`/candidates/${id}/edit`} className="btn btn-secondary" style={{ height: '42px' }}>
                 <Edit size={18} /> Edit
              </Link>
              <button onClick={handleDelete} className="btn" style={{ height: '42px', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <div className="badge badge-primary" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <Briefcase size={18} /> {candidate.yearsExperience} Years Exp.
            </div>
            <div className="badge badge-neutral" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <MapPin size={18} /> {candidate.location || 'Remote/TBD'}
            </div>
            <div className="badge badge-neutral" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <GraduationCap size={18} /> {candidate.education?.split(',')[0] || 'Degree N/A'}
            </div>
            {candidate.cvFileUrl && (
              <a href={candidate.cvFileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginLeft: 'auto', height: '44px' }}>
                <ExternalLink size={18} /> Full CV
              </a>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Left Column: Parsed Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', backgroundColor: 'var(--color-surface-hover)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
              <Mail size={16} className="text-primary" /> {candidate.email || 'N/A'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
              <Phone size={16} className="text-primary" /> {candidate.phone || 'N/A'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              <MapPin size={16} /> {candidate.location || 'N/A'}
            </div>
          </div>

          <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--color-primary)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} style={{ color: 'var(--color-warning)' }} /> AI Execution Summary
            </h2>
            <div style={{ fontSize: '1rem', color: 'var(--color-text-primary)', lineHeight: 1.6, fontWeight: 500, fontStyle: 'italic' }}>
              "{candidate.parsedResume || 'No summary available.'}"
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
                <GraduationCap size={18} /> Education
              </h3>
              <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{candidate.education || 'Not specified'}</p>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
                <Award size={18} /> Certifications
              </h3>
              <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{candidate.certifications || 'No certifications detected'}</p>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
             <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid var(--color-surface-border)', paddingBottom: '0.75rem' }}>Technical Skills & Expertise</h3>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {candidate.skills && candidate.skills.length > 0 ? candidate.skills.map((s, i) => (
                  <span key={i} className="badge badge-primary" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 500 }}>{s}</span>
                )) : <span className="text-muted">None</span>}
             </div>
          </div>

          {/* Linked Pipelines Section */}
          <div className="card" style={{ padding: '2rem' }}>
             <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} className="text-primary" /> Linked Pipelines
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {linkedApplications.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>This candidate is not linked to any active jobs yet.</p>
                ) : linkedApplications.map(app => {
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
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{job?.title || 'Unknown/Deleted Job'}</span>
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
                              {job.status}
                            </span>
                          )}
                        </div>
                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{job?.clientName || 'Archive'}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div className={app.fitScore > 75 ? 'text-success' : 'text-warning'} style={{ fontWeight: 700, fontSize: '0.875rem' }}>{app.fitScore}% Match</div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>{app.stage}</div>
                        </div>
                        <Link to="/pipeline" className="btn btn-secondary" style={{ padding: '0.375rem' }}>
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
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
