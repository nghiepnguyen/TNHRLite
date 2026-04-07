import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, MapPin, Building2, ChevronRight } from 'lucide-react';
import { getJobs } from '../../services/db';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const result = await getJobs();
      setJobs(result);
      setLoading(false);
    }
    fetchJobs();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Jobs</h1>
          <p className="text-secondary">Manage your active recruiting mandates</p>
        </div>
        <Link to="/jobs/new" className="btn btn-primary">
          <Plus size={18} />
          Create Job
        </Link>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }} className="text-muted">Loading jobs...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Job Title & Client</th>
                <th>Location / Type</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{job.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      <Building2 size={14} /> {job.clientName || 'Internal'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                         <MapPin size={14} className="text-muted" /> {job.location || 'N/A'}
                      </div>
                      <span className="text-secondary" style={{ marginTop: '0.25rem', display: 'block' }}>{job.employmentType}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${job.status === 'Closed' ? 'badge-neutral' : 'badge-success'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="text-secondary" style={{ fontSize: '0.875rem' }}>
                    {job.createdAt?.toDate ? job.createdAt.toDate().toLocaleDateString() : 'New'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/jobs/${job.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                      View <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }} className="text-muted">
                    <Briefcase size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p>No jobs found.</p>
                    <Link to="/jobs/new" className="text-primary" style={{ marginTop: '0.5rem', display: 'inline-block' }}>Create your first mandate</Link>
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
