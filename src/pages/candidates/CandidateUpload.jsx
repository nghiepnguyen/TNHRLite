import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UploadCloud, FileType } from 'lucide-react';
import { uploadCV, createCandidate } from '../../services/db';
import { parseCvFromUrl } from '../../services/ai';
import { useAuth } from '../../contexts/AuthContext';

export default function CandidateUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      setStatusText('Uploading CV to Storage...');
      // 1. Upload to Storage
      const { downloadUrl, path } = await uploadCV(file, currentUser?.uid);
      
      // Track CV Upload event
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'cv_uploaded', { 'event_label': file.name });
      }

      setStatusText('AI is analyzing resume patterns & experience...');
      // 2. AI Parsing Route
      const parsedData = await parseCvFromUrl(downloadUrl);
      
      const isFallback = parsedData.email === 'dummy@example.com';

      // Track CV parsing event
      if (typeof window.gtag === 'function') {
        window.gtag('event', isFallback ? 'cv_parse_fallback' : 'cv_parse_success', {
          'event_category': 'Engagement',
          'event_label': isFallback ? 'AI Key Missing' : 'AI Parse Success'
        });
      }
      
      if (isFallback) {
        setStatusText('AI Key Missing. Proceeding with manual entry mode...');
      } else {
        setStatusText('Successfully extracted candidate data!');
      }
      // 3. Save Candidate to Firestore
      const candidateId = await createCandidate({
        ...parsedData,
        cvFileUrl: downloadUrl,
        cvStoragePath: path,
        createdBy: currentUser?.uid || 'anonymous',
        recruiterNotes: '' // Initial empty state
      });

      navigate(`/candidates/${candidateId}`);
    } catch (error) {
      console.error(error);
      alert('Failed to process candidate. Check configuration rules.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/candidates" className="text-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Talent Pool
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Upload Candidate CV</h1>
        <p className="text-secondary" style={{ marginTop: '0.25rem' }}>Upload a PDF or Word document to parse into a structured profile.</p>
      </div>

      <div className="card" style={{ maxWidth: '600px', padding: '2.5rem', textAlign: 'center' }}>
        <form onSubmit={handleUpload}>
          <div style={{ 
            border: '2px dashed var(--color-surface-border)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '4rem 2rem', 
            backgroundColor: 'var(--color-surface-base)',
            marginBottom: '2rem',
            position: 'relative',
            cursor: 'pointer'
          }}>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
            />
            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <FileType size={48} className="text-primary" />
                <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '0.5rem' }}>{file.name}</p>
                <p className="text-secondary" style={{ fontSize: '0.875rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); }} className="text-danger" style={{ marginTop: '1rem', fontSize: '0.875rem', zIndex: 10, position: 'relative' }}>Clear File</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud size={48} className="text-muted" />
                <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Click or drag file to upload</p>
                <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Supports PDF, DOCX, TXT up to 10MB</p>
              </div>
            )}
          </div>

          {loading && (
             <div className="badge badge-neutral" style={{ display: 'block', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)' }}>
               {statusText}
             </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="submit" className="btn btn-primary" disabled={!file || loading} style={{ width: '100%' }}>
              {loading ? 'Processing...' : 'Upload and Parse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
