import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getCandidates } from '../../services/db';
import Skeleton from '../../components/Skeleton';

export default function Candidates() {
  const { workspaceId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCandidates() {
      if (!workspaceId) return;
      setLoading(true);
      const result = await getCandidates(workspaceId);
      setCandidates(result);
      setLoading(false);
    }
    fetchCandidates();
  }, [workspaceId]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Candidates</h1>
          <p className="text-secondary">Talent pool and parsed resumes</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to={`/dashboard/w/${workspaceId}/candidates/new`} className="btn btn-secondary">
            <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">person_add</span>
            Manual Entry
          </Link>
          <Link to={`/dashboard/w/${workspaceId}/candidates/upload`} className="btn btn-primary">
            <span className="material-symbols-outlined flex-shrink-0 !text-[18px]">upload</span>
            Upload CV
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
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
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td>
                      <Skeleton variant="text" width="180px" />
                      <Skeleton variant="text" width="150px" style={{ marginTop: '0.25rem' }} />
                    </td>
                    <td>
                      <Skeleton variant="text" width="120px" />
                      <Skeleton variant="text" width="80px" style={{ marginTop: '0.125rem' }} />
                    </td>
                    <td>
                      <Skeleton variant="text" width="100px" />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Skeleton variant="rect" width="80px" height="32px" style={{ marginLeft: 'auto', borderRadius: 'var(--radius-sm)' }} />
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  {candidates.map(cand => (
                    <tr key={cand.id}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="material-symbols-outlined flex-shrink-0 !text-[16px] text-muted">description</span> {cand.fullName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                          <span className="material-symbols-outlined flex-shrink-0 !text-[14px]">mail</span> {cand.email || 'No email provided'}
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
                        <Link to={`/dashboard/w/${workspaceId}/candidates/${cand.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                          Profile <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">chevron_right</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {candidates.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }} className="text-muted">
                        <span className="material-symbols-outlined flex-shrink-0 !text-[32px]" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>description</span>
                        <p>No candidates found in pool.</p>
                        <Link to={`/dashboard/w/${workspaceId}/candidates/upload`} className="text-primary" style={{ marginTop: '0.5rem', display: 'inline-block' }}>Upload a CV to parse</Link>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
