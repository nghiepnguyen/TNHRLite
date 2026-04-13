import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, ChevronRight, Briefcase, Mail, UserPlus } from 'lucide-react';
import { getCandidates } from '../../services/db';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCandidates() {
      const result = await getCandidates();
      setCandidates(result);
      setLoading(false);
    }
    fetchCandidates();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Candidates</h1>
          <p className="text-secondary">Talent pool and parsed resumes</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/dashboard/candidates/new" className="btn btn-secondary">
            <UserPlus size={18} />
            Manual Entry
          </Link>
          <Link to="/dashboard/candidates/upload" className="btn btn-primary">
            <Upload size={18} />
            Upload CV
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }} className="text-muted">Loading candidates...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Candidate Details</th>
                <th>Current Role</th>
                <th>Added Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map(cand => (
                <tr key={cand.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} className="text-muted" /> {cand.fullName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      <Mail size={14} /> {cand.email || 'No email provided'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: 500 }}>{cand.currentTitle || 'N/A'}</div>
                      <span className="text-secondary" style={{ display: 'block', marginTop: '0.125rem' }}>
                        {cand.currentCompany || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="text-secondary" style={{ fontSize: '0.875rem' }}>
                    {cand.createdAt?.toDate 
                      ? cand.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
                      : 'Just now'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/dashboard/candidates/${cand.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                      Profile <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {candidates.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }} className="text-muted">
                    <FileText size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p>No candidates found in pool.</p>
                    <Link to="/dashboard/candidates/upload" className="text-primary" style={{ marginTop: '0.5rem', display: 'inline-block' }}>Upload a CV to parse</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
