import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Briefcase, MapPin, Building2, ChevronRight, 
  AlertCircle, Users, Clock, Filter, CheckCircle
} from 'lucide-react';
import { getJobs, getAllApplications, updateJob, createJob } from '../../services/db';

import MandateDetailModal from '../../components/MandateDetailModal';
import MandatesTable from '../../components/MandatesTable';
import { useToast } from '../../contexts/ToastContext';

/**
 * Optimized Mandates Dashboard
 * Standardized UI with unified styling and resilient data aggregation.
 */
export default function Jobs() {
  const navigate = useNavigate();
  const [mandates, setMandates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMandate, setSelectedMandate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('Active'); // All, Active, On-Hold, Closed
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  const toast = useToast();

  useEffect(() => {
    async function getMandatesData() {
      try {
        setLoading(true);
        const [jobs, applications] = await Promise.all([
          getJobs(),
          getAllApplications()
        ]);

        const appCountsByJob = applications.reduce((acc, app) => {
          if (!app.jobId) return acc;
          if (!acc[app.jobId]) {
            acc[app.jobId] = { screened: 0, interview: 0, offer: 0, hired: 0 };
          }
          const stage = (app.stage || 'New').toLowerCase();
          if (stage.includes('screen')) acc[app.jobId].screened++;
          else if (stage.includes('interview')) acc[app.jobId].interview++;
          else if (stage.includes('offer')) acc[app.jobId].offer++;
          else if (stage.includes('hired') || stage.includes('completed')) acc[app.jobId].hired++;
          return acc;
        }, {});

        const mappedMandates = jobs.map(job => {
          const stats = appCountsByJob[job.id] || { screened: 0, interview: 0, offer: 0, hired: 0 };
          
          // Data normalization helper
          const toIso = (val) => {
            if (!val) return null;
            if (typeof val.toDate === 'function') return val.toDate().toISOString();
            if (val.seconds) return new Date(val.seconds * 1000).toISOString();
            if (typeof val === 'number') return new Date(val).toISOString();
            const d = new Date(val);
            return isNaN(d.getTime()) ? null : d.toISOString();
          };

          const createdAtIso = toIso(job.createdAt) || new Date().toISOString();
          const deadlineIso = toIso(job.deadline) || new Date(new Date(createdAtIso).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
          
          return {
            ...job,
            clientName: job.clientName || 'Internal',
            department: job.department || job.employmentType || 'General',
            deadline: deadlineIso,
            totalRoles: parseInt(job.totalRoles || 1),
            openRoles: Math.max(0, parseInt(job.totalRoles || 1) - stats.hired),
            createdAt: createdAtIso,
            pipeline: stats,
            is_soon_expiring: new Date(deadlineIso) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          };
        });

        setMandates(mappedMandates);
      } catch (err) {
        console.error(err);
        setError('Failed to load recruiting data. Please check connection.');
      } finally {
        setLoading(false);
      }
    }
    getMandatesData();
  }, [refreshKey]);

  // KPI aggregation
  const activeCount = mandates.filter(m => m.status === 'Active').length;
  const expiringSoonCount = mandates.filter(m => m.status === 'Active' && m.is_soon_expiring).length;
  const totalOpenRoles = mandates.filter(m => m.status === 'Active').reduce((sum, m) => sum + (m.openRoles || 0), 0);

  const handleRowClick = (mandate) => {
    setSelectedMandate(mandate);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMandate(null);
  };

  const handleAction = async (type, mandate) => {
    try {
      if (type === 'edit') {
        setSelectedMandate(mandate);
        setModalMode('edit');
        setIsModalOpen(true);
        return;
      }

      if (type === 'delete') {
        if (window.confirm('WARNING: Are you sure you want to delete this mandate? This will also remove all associated application data. This action cannot be undone.')) {
          const { deleteJob } = await import('../../services/db');
          await deleteJob(mandate.id);
          toast({ type: 'success', message: 'Mandate and history permanently deleted.' });
        } else { return; }
      }

      if (type === 'close') {
        await updateJob(mandate.id, { status: 'Closed' });
        toast({ type: 'success', message: 'Mandate closed successfully.' });
      } else if (type === 'clone' || type === 'duplicate') {
        const { id, pipeline, createdAt, is_soon_expiring, ...payload } = mandate;
        await createJob({ ...payload, title: `${mandate.title} (Copy)`, status: 'Active' });
        toast({ type: 'success', message: 'Mandate cloned successfully.' });
      } else if (type === 'update') {
        setRefreshKey(prev => prev + 1);
        return;
      } else if (type === 'report') {
        navigate(`/dashboard/jobs/${mandate.id}`);
        return;
      } else if (type === 'extend') {
        const newDeadline = new Date(mandate.deadline);
        newDeadline.setDate(newDeadline.getDate() + 30);
        await updateJob(mandate.id, { deadline: newDeadline.toISOString() });
        toast({ type: 'success', message: `Deadline extended to ${newDeadline.toLocaleDateString('en-GB')}` });
      }
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      toast({ type: 'error', message: `Execution failed: ${type}` });
    }
  };


  const handlePageChange = (page) => {
    setIsPageLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsPageLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  const ITEMS_PER_PAGE = 20;
  const filteredMandates = mandates.filter(m => {
    if (activeTab === 'All') return true;
    if (activeTab === 'On-Hold') return m.status === 'On-Hold' || m.status === 'On Hold' || m.status === 'Draft';
    return m.status === activeTab;
  });
  const totalPages = Math.ceil(filteredMandates.length / ITEMS_PER_PAGE);
  const paginatedMandates = filteredMandates.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  if (error) return (
    <div className="error-screen">
      <AlertCircle size={48} />
      <h3>Connection Error</h3>
      <p>{error}</p>
      <button onClick={() => setRefreshKey(k => k+1)} className="btn btn-primary">Retry Sync</button>
    </div>
  );

  return (
    <div className="mandates-portal-root">
      <div className="portal-content-container">
        
        {/* Header Section */}
        <header className="portal-header">
          <div className="title-block">
            <h1 className="portal-main-title">Recruiting Mandates</h1>
            <p className="portal-sub-title">Overview of current hiring requirements and pipeline status</p>
          </div>
          <Link to="/dashboard/jobs/new" className="btn btn-primary btn-lg">
            <Plus size={20} /> Create New Mandate
          </Link>
        </header>

        {/* Dashboard KPIs */}
        <section className="portal-dashboard">
          <div className="kpi-box">
            <div className="kpi-icon-base active"><Briefcase size={24} /></div>
            <div className="kpi-text-base">
              <span className="kpi-tag-label">Active Mandates</span>
              <span className="kpi-value-main">{activeCount}</span>
            </div>
          </div>
          <div className="kpi-box">
            <div className="kpi-icon-base expiring"><Clock size={24} /></div>
            <div className="kpi-text-base">
              <span className="kpi-tag-label">Expiring Soon</span>
              <div className="kpi-value-group">
                <span className="kpi-value-main highlight">{expiringSoonCount}</span>
                <span className="kpi-mini-badge">{"< 14 days"}</span>
              </div>
            </div>
          </div>
          <div className="kpi-box">
            <div className="kpi-icon-base roles"><Users size={24} /></div>
            <div className="kpi-text-base">
              <span className="kpi-tag-label">Total Open Roles</span>
              <span className="kpi-value-main">{totalOpenRoles}</span>
            </div>
          </div>
        </section>

        {/* List Card */}
        <div className="portal-table-card">
          {isPageLoading && <div className="portal-spinner-overlay"><div className="portal-spinner"></div></div>}
          
          <div className="portal-table-header">
            <div className="portal-tabs-container">
              <div className="portal-tabs">
                <button 
                  className={`portal-tab ${activeTab === 'All' ? 'active' : ''}`}
                  onClick={() => setActiveTab('All')}
                >
                  All <span className="tab-count">{mandates.length}</span>
                </button>
                <button 
                  className={`portal-tab ${activeTab === 'Active' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Active')}
                >
                  <Briefcase size={16} /> Active <span className="tab-count">{mandates.filter(m => m.status === 'Active').length}</span>
                </button>
                <button 
                  className={`portal-tab ${activeTab === 'On-Hold' ? 'active' : ''}`}
                  onClick={() => setActiveTab('On-Hold')}
                >
                  On Hold <span className="tab-count">{mandates.filter(m => m.status === 'On-Hold' || m.status === 'On Hold' || m.status === 'Draft').length}</span>
                </button>
                <button 
                  className={`portal-tab ${activeTab === 'Closed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Closed')}
                >
                  <CheckCircle size={16} /> Closed <span className="tab-count">{mandates.filter(m => m.status === 'Closed').length}</span>
                </button>
              </div>
            </div>
            <button 
              className={`portal-filter-btn ${isFilterExpanded ? 'active' : ''}`}
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              <Filter size={16} /> Filters
            </button>
          </div>

          <div className={`portal-accordion ${isFilterExpanded ? 'visible' : ''}`}>
            <div className="portal-accordion-inner">
              <div className="filter-input-field">
                <label>Client Organization</label>
                <select><option>Search all clients...</option></select>
              </div>
              <div className="filter-input-field">
                <label>Operating Department</label>
                <select><option>Search all departments...</option></select>
              </div>
            </div>
          </div>

          <MandatesTable 
            mandates={paginatedMandates} 
            loading={loading} 
            onRowClick={handleRowClick}
            onAction={handleAction}
          />

          {!loading && filteredMandates.length > 0 && (
            <footer className="portal-table-footer">
              <span className="results-count">
                Showing <strong>{Math.min(filteredMandates.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filteredMandates.length, currentPage * ITEMS_PER_PAGE)}</strong> of <strong>{filteredMandates.length}</strong> records
              </span>
              
              {filteredMandates.length > ITEMS_PER_PAGE && (
                <div className="pagination-controls">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button 
                      key={p} 
                      className={`page-control ${currentPage === p ? 'active' : ''}`} 
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </footer>
          )}
        </div>
      </div>

      {isModalOpen && (
        <MandateDetailModal 
          mandate={selectedMandate} 
          initialMode={modalMode}
          onClose={handleCloseModal} 
          onAction={handleAction}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .mandates-portal-root {
          /* Inherit background from layout */
        }

        .portal-content-container {
          width: 100%;
          padding: 0;
        }

        .portal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .portal-main-title {
          font-size: 1.875rem;
          font-weight: 800;
          color: var(--color-text-primary);
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }

        .portal-sub-title {
          color: var(--color-text-secondary);
          font-size: 1rem;
        }

        /* Dashboard KPI Layout */
        .portal-dashboard {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .kpi-box {
          background: white;
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-surface-border);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-smooth);
        }

        .kpi-box:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .kpi-icon-base {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-icon-base.active { background: var(--color-primary-bg); color: var(--color-primary); }
        .kpi-icon-base.expiring { background: var(--color-warning-bg); color: var(--color-warning); }
        .kpi-icon-base.roles { background: var(--color-success-bg); color: var(--color-success); }

        .kpi-text-base {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .kpi-tag-label {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .kpi-value-main {
          font-size: 2.25rem;
          font-weight: 900;
          color: var(--color-text-primary);
          line-height: 1;
        }

        .kpi-value-main.highlight { color: var(--color-warning); }

        .kpi-value-group {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }

        .kpi-mini-badge {
          font-size: 0.6875rem;
          font-weight: 700;
          color: var(--color-text-muted);
          background: var(--color-surface-hover);
          padding: 2px 8px;
          border-radius: 6px;
        }

        /* Portal Table & Components */
        .portal-table-card {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-surface-border);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          position: relative;
        }

        .portal-table-header {
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          border-bottom: 1px solid var(--color-surface-border);
        }

        .portal-tabs-container {
          background: var(--color-surface-hover);
          padding: 4px;
          border-radius: 12px;
          display: inline-flex;
        }

        .portal-tabs {
          display: flex;
          gap: 4px;
        }

        .portal-tab {
          padding: 8px 16px;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          border-radius: 8px;
          transition: var(--transition-smooth);
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .portal-tab:hover { color: var(--color-text-primary); }

        .portal-tab.active {
          background: white;
          color: var(--color-primary);
          box-shadow: var(--shadow-sm);
        }

        .tab-count {
          font-size: 0.6875rem;
          background: var(--color-surface-border);
          padding: 2px 8px;
          border-radius: 6px;
          color: var(--color-text-muted);
          margin-left: 4px;
        }

        .portal-tab.active .tab-count {
          background: var(--color-primary-bg);
          color: var(--color-primary);
        }

        .portal-filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          border-radius: 12px;
          border: 1px solid var(--color-surface-border);
          background: white;
          transition: var(--transition-smooth);
        }

        .portal-filter-btn:hover { background: var(--color-surface-hover); border-color: var(--color-text-muted); }
        .portal-filter-btn.active { background: var(--color-brand-on-surface); color: white; border-color: var(--color-brand-on-surface); }

        .portal-accordion {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .portal-accordion.visible {
          max-height: 300px;
          padding: 1.5rem;
          background: var(--color-surface-hover);
          border-bottom: 1px solid var(--color-surface-border);
        }

        .portal-accordion-inner {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .filter-input-field label {
          display: block;
          font-size: 0.6875rem;
          font-weight: 800;
          color: var(--color-text-muted);
          text-transform: uppercase;
          margin-bottom: 8px;
          letter-spacing: 0.05em;
        }

        .filter-input-field select {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--color-surface-border);
          border-radius: 10px;
          background: white;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .portal-table-footer {
          padding: 1.25rem 1.5rem;
          background: var(--color-surface-hover);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .results-count { font-size: 0.8125rem; color: var(--color-text-secondary); }

        .pagination-controls { display: flex; gap: 6px; }

        .page-control {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.8125rem;
          transition: var(--transition-smooth);
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid var(--color-surface-border);
          color: var(--color-text-secondary);
        }

        .page-control.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
        .page-control:not(.active):hover { background: var(--color-surface-hover); color: var(--color-text-primary); }

        .portal-spinner-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.7);
          z-index: 100;
          display: flex;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(2px);
        }

        .portal-spinner {
          width: 2rem;
          height: 2rem;
          border: 3px solid var(--color-surface-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .error-screen {
          padding: 5rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        @media (max-width: 1024px) {
          .portal-dashboard { grid-template-columns: 1fr; }
          .portal-accordion-inner { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
          .portal-header { flex-direction: column; align-items: stretch; gap: 1.5rem; }
          .portal-table-footer { flex-direction: column; gap: 1.25rem; text-align: center; }
        }
      `}} />
    </div>
  );
}
