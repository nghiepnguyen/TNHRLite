import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { getJobs, getAllApplications, updateJob, createJob } from '../../services/db';

import MandateDetailModal from '../../components/MandateDetailModal';
import MandatesTable from '../../components/MandatesTable';
import { useToast } from '../../contexts/ToastContext';
import Skeleton from '../../components/Skeleton';
import { formatDate } from '../../utils/dateUtils';
import './Jobs.css';

/**
 * Optimized Mandates Dashboard
 * Standardized UI with unified styling and resilient data aggregation.
 */
export default function Jobs() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { workspaceId } = useParams();
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
          getJobs(workspaceId),
          getAllApplications(workspaceId)
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
            clientName: job.clientName || t('reportsPage.table.internal'),
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
        setError(t('jobsPage.messages.loadError'));
      } finally {
        setLoading(false);
      }
    }
    getMandatesData();
  }, [refreshKey, workspaceId, t]);

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
        if (window.confirm(t('jobsPage.messages.deleteConfirm'))) {
          const { deleteJob } = await import('../../services/db');
          await deleteJob(mandate.id);
          toast({ type: 'success', message: t('jobsPage.messages.deleteSuccess') });
        } else { return; }
      }

      if (type === 'close') {
        if (!window.confirm(t('jobsPage.messages.closeConfirm', { title: mandate.title }))) return;
        await updateJob(mandate.id, { status: 'Closed' });
        toast({ type: 'success', message: t('jobsPage.messages.closeSuccess') });
      } else if (type === 'clone' || type === 'duplicate') {
        const { id: _id, pipeline: _p, createdAt: _ca, is_soon_expiring: _ise, ...payload } = mandate;
        await createJob(workspaceId, { ...payload, title: `${mandate.title} (Copy)`, status: 'Active' });
        toast({ type: 'success', message: t('jobsPage.messages.cloneSuccess') });
      } else if (type === 'update') {
        setRefreshKey(prev => prev + 1);
        return;
      } else if (type === 'report') {
        navigate(`/dashboard/w/${workspaceId}/jobs/${mandate.id}`);
        return;
      } else if (type === 'extend') {
        const newDeadline = new Date(mandate.deadline);
        newDeadline.setDate(newDeadline.getDate() + 30);
        await updateJob(mandate.id, { deadline: newDeadline.toISOString() });
        toast({ type: 'success', message: t('jobsPage.messages.extendSuccess', { date: formatDate(newDeadline) }) });
      }
      setRefreshKey(prev => prev + 1);
    } catch (_error) {
      toast({ type: 'error', message: t('jobsPage.messages.execError', { type }) });
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
      <span className="material-symbols-outlined flex-shrink-0 !text-[48px]">error</span>
      <h3>{t('jobsPage.messages.connError')}</h3>
      <p>{error}</p>
      <button onClick={() => setRefreshKey(k => k+1)} className="btn btn-primary">{t('jobsPage.messages.retry')}</button>
    </div>
  );

  return (
    <div className="mandates-portal-root">
      <div className="portal-content-container">
        
        {/* Header Section */}
        <header className="portal-header">
          <div className="title-block">
            <h1 className="portal-main-title">{t('jobsPage.title')}</h1>
            <p className="portal-sub-title">{t('jobsPage.subtitle')}</p>
          </div>
          <Link to={`/dashboard/w/${workspaceId}/jobs/new`} className="btn btn-primary btn-lg">
            <span className="material-symbols-outlined flex-shrink-0 !text-[20px]">add</span> {t('jobsPage.createBtn')}
          </Link>
        </header>

        {/* Dashboard KPIs */}
        <section className="portal-dashboard">
          <div className="kpi-box">
            <div className="kpi-icon-base active"><span className="material-symbols-outlined flex-shrink-0 !text-[24px]">work</span></div>
            <div className="kpi-text-base">
              <span className="kpi-tag-label">{t('jobsPage.kpis.active')}</span>
              {loading ? <Skeleton variant="title" width="40px" style={{ margin: 0 }} /> : <span className="kpi-value-main">{activeCount}</span>}
            </div>
          </div>
          <div className="kpi-box">
            <div className="kpi-icon-base expiring"><span className="material-symbols-outlined flex-shrink-0 !text-[24px]">schedule</span></div>
            <div className="kpi-text-base">
              <span className="kpi-tag-label">{t('jobsPage.kpis.expiring')}</span>
              <div className="kpi-value-group">
                {loading ? <Skeleton variant="title" width="40px" style={{ margin: 0 }} /> : <span className="kpi-value-main highlight">{expiringSoonCount}</span>}
                <span className="kpi-mini-badge">{t('jobsPage.kpis.expiringNote')}</span>
              </div>
            </div>
          </div>
          <div className="kpi-box">
            <div className="kpi-icon-base roles"><span className="material-symbols-outlined flex-shrink-0 !text-[24px]">group</span></div>
            <div className="kpi-text-base">
              <span className="kpi-tag-label">{t('jobsPage.kpis.openRoles')}</span>
              {loading ? <Skeleton variant="title" width="40px" style={{ margin: 0 }} /> : <span className="kpi-value-main">{totalOpenRoles}</span>}
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
                  {t('jobsPage.tabs.all')} <span className="tab-count">{loading ? '...' : mandates.length}</span>
                </button>
                <button 
                  className={`portal-tab ${activeTab === 'Active' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Active')}
                >
                  <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">work</span> {t('jobsPage.tabs.active')} <span className="tab-count">{loading ? '...' : mandates.filter(m => m.status === 'Active').length}</span>
                </button>
                <button 
                  className={`portal-tab ${activeTab === 'On-Hold' ? 'active' : ''}`}
                  onClick={() => setActiveTab('On-Hold')}
                >
                  {t('jobsPage.tabs.onHold')} <span className="tab-count">{loading ? '...' : mandates.filter(m => m.status === 'On-Hold' || m.status === 'On Hold' || m.status === 'Draft').length}</span>
                </button>
                <button 
                  className={`portal-tab ${activeTab === 'Closed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Closed')}
                >
                  <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">check_circle</span> {t('jobsPage.tabs.closed')} <span className="tab-count">{loading ? '...' : mandates.filter(m => m.status === 'Closed').length}</span>
                </button>
              </div>
            </div>
            <button 
              className={`portal-filter-btn ${isFilterExpanded ? 'active' : ''}`}
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            >
              <span className="material-symbols-outlined flex-shrink-0 !text-[16px]">filter_alt</span> {t('jobsPage.filters.title')}
            </button>
          </div>

          <div className={`portal-accordion ${isFilterExpanded ? 'visible' : ''}`}>
            <div className="portal-accordion-inner">
              <div className="filter-input-field">
                <label>{t('jobsPage.filters.client')}</label>
                <select><option>{t('jobsPage.filters.clientPlaceholder')}</option></select>
              </div>
              <div className="filter-input-field">
                <label>{t('jobsPage.filters.dept')}</label>
                <select><option>{t('jobsPage.filters.deptPlaceholder')}</option></select>
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
                {t('jobsPage.footer.showing')} <strong>{Math.min(filteredMandates.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filteredMandates.length, currentPage * ITEMS_PER_PAGE)}</strong> {t('jobsPage.footer.of')} <strong>{filteredMandates.length}</strong> {t('jobsPage.footer.records')}
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

    </div>
  );
}
