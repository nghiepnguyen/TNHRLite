import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

import { 
  X, Briefcase, MapPin, Globe, DollarSign, Mail, 
  Calendar, Clock, CheckCircle, ArrowRight, 
  Download, Copy, Trash2, AlertTriangle, Layers, Settings, ArrowLeft,
  User
} from 'lucide-react';
import EditMandateForm from './EditMandateForm';


/**
 * MandateDetailModal Component - Phase 3
 * Detailed view of a recruiting mandate with pipeline tracking.
 */
const MandateDetailModal = ({ mandate, initialMode = 'view', onClose, onAction }) => {
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isEditing, setIsEditing] = useState(initialMode === 'edit');
  const toast = useToast();



  if (!mandate) return null;

  const handleExport = () => {
    toast?.({ type: 'info', message: `Exporting report for ${mandate.title}...` });
    onAction?.('export', mandate);
  };

  const handleClone = () => {
    toast?.({ type: 'success', message: `Mandate "${mandate.title}" cloned successfully.` });
    onAction?.('clone', mandate);
    onClose();
  };

  const handleConfirmClose = () => {
    toast?.({ type: 'success', message: `Mandate "${mandate.title}" has been closed.` });
    onAction?.('close', mandate);
    onClose();
  };

  const handleEditSuccess = (updatedMandate) => {
    setIsEditing(false);
    onAction?.('update', updatedMandate);
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-badge">
             <Briefcase size={16} /> {isEditing ? 'Editing Mandate' : 'Mandate Details'}
          </div>
          <div className="header-actions">
            {isEditing && (
              <button className="btn-back" onClick={() => setIsEditing(false)}>
                <ArrowLeft size={16} /> Back to Details
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {isEditing ? (
            <EditMandateForm 
              initialData={mandate} 
              onSuccess={handleEditSuccess}
              onClose={() => setIsEditing(false)}
            />
          ) : (
            <>
              <div className="detail-grid">

            {/* Left Column: Job Info */}
            <div className="info-column">
              <h2 className="detail-title">{mandate.title}</h2>
              <div className="detail-client">{mandate.clientName}</div>

              <div className="info-stats">
                <div className="info-item">
                  <Layers size={18} className="text-muted" />
                  <div>
                    <div className="info-label">Department</div>
                    <div className="info-value">{mandate.department || 'N/A'}</div>
                  </div>
                </div>
                <div className="info-item">
                  <MapPin size={18} className="text-muted" />
                  <div>
                    <div className="info-label">Location</div>
                    <div className="info-value">{mandate.location}</div>
                  </div>
                </div>
                <div className="info-item">
                  <Globe size={18} className="text-muted" />
                  <div>
                    <div className="info-label">Working Mode</div>
                    <div className="info-value">{mandate.workingMode || 'On-site'}</div>
                  </div>
                </div>
                <div className="info-item">
                  <DollarSign size={18} className="text-muted" />
                  <div>
                    <div className="info-label">Salary Range</div>
                    <div className="info-value">{mandate.salaryRange || 'N/A'}</div>
                  </div>
                </div>
                <div className="info-item">
                  <User size={18} className="text-muted" />
                  <div>
                    <div className="info-label">HR Contact</div>
                    <div className="info-value" style={{ fontSize: '0.8125rem' }}>{mandate.hrContact || mandate.contact || 'Not specified'}</div>
                  </div>
                </div>
              </div>

              {/* Job Description Section */}
              <div className="description-section">
                <h4 className="section-subtitle">Job Description</h4>
                <div className="description-text">
                  {mandate.jdText || mandate.description || 'No description provided for this mandate.'}
                </div>
              </div>

              {/* Skills Section */}
              {((mandate.requiredSkills && mandate.requiredSkills.length > 0) || 
                (mandate.optionalSkills && mandate.optionalSkills.length > 0)) && (
                <div className="skills-section">
                  <h4 className="section-subtitle">Key Requirements</h4>
                  <div className="skills-cloud">
                    {mandate.requiredSkills?.map((skill, i) => (
                      <span key={`req-${i}`} className="skill-badge required">{skill}</span>
                    ))}
                    {mandate.optionalSkills?.map((skill, i) => (
                      <span key={`opt-${i}`} className="skill-badge">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Status & Timeline */}
            <div className="status-column">
              <div className="status-card">
                <div className="status-header">
                   <span className={`status-dot ${mandate.status.toLowerCase().replace(/[_\s]/g, '-')}`}></span>
                   {mandate.status}
                </div>

                <div className="status-deadline">
                   <Calendar size={14} /> Deadline: {new Date(mandate.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
              </div>

              <div className="timeline-section">
                <h4 className="section-subtitle">Mandate Timeline</h4>
                <div className="vertical-timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker success"></div>
                    <div className="timeline-info">
                      <div className="timeline-title">Mandate Created</div>
                       <div className="timeline-date">{new Date(mandate.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-marker info"></div>
                    <div className="timeline-info">
                      <div className="timeline-title">Hiring Team Assigned</div>
                      <div className="timeline-date">3 days ago</div>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-marker active"></div>
                    <div className="timeline-info">
                      <div className="timeline-title">Sourcing & Screening</div>
                      <div className="timeline-date">Active now</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Pipeline KPIs */}
          <div className="pipeline-section">
            <h4 className="section-subtitle">Recruitment Pipeline</h4>
            <div className="pipeline-kpi-grid">
              <div className="pipeline-stat">
                <div className="stat-header">
                  <span className="stat-label">Screened</span>
                  <span className="stat-value">{mandate.pipeline?.screened || 0}</span>
                </div>
                <div className="stat-progress"><div className="stat-bar" style={{ width: '80%', background: '#94a3b8' }}></div></div>
              </div>
              <div className="pipeline-stat">
                <div className="stat-header">
                  <span className="stat-label">Interview</span>
                  <span className="stat-value">{mandate.pipeline?.interview || 0}</span>
                </div>
                <div className="stat-progress"><div className="stat-bar" style={{ width: '40%', background: '#3b82f6' }}></div></div>
              </div>
              <div className="pipeline-stat">
                <div className="stat-header">
                  <span className="stat-label">Offer</span>
                  <span className="stat-value">{mandate.pipeline?.offer || 0}</span>
                </div>
                <div className="stat-progress"><div className="stat-bar" style={{ width: '20%', background: '#f59e0b' }}></div></div>
              </div>
              <div className="pipeline-stat">
                <div className="stat-header">
                  <span className="stat-label">Hired</span>
                  <span className="stat-value">{mandate.pipeline?.hired || 0}</span>
                </div>
                <div className="stat-progress"><div className="stat-bar" style={{ width: '10%', background: '#10b981' }}></div></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>



        {/* Footer Actions */}
        <div className="modal-footer">
          <div className="footer-left">
            <button className="btn btn-secondary" onClick={handleExport}>
              <Download size={16} /> Export Report (CSV)
            </button>
          </div>
          <div className="footer-right">
            {!showConfirmClose ? (
              <>
                <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                  <Settings size={16} /> Edit Settings
                </button>
                <button className="btn btn-secondary" onClick={handleClone}>
                  <Copy size={16} /> Clone Mandate
                </button>
                <button className="btn btn-danger-outline" onClick={() => setShowConfirmClose(true)}>
                  <Trash2 size={16} /> Close Mandate
                </button>
              </>

            ) : (
              <div className="confirm-actions">
                <span className="confirm-text"><AlertTriangle size={16} /> Are you sure?</span>
                <button className="btn btn-danger" onClick={handleConfirmClose}>Yes, Close</button>
                <button className="btn btn-secondary" onClick={() => setShowConfirmClose(false)}>No, Keep Open</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
          background: var(--color-surface-card);
          width: 90%;
          max-width: 900px;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-ambient);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--color-surface-border);
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
          padding: 1.25rem 2rem;
          border-bottom: 1px solid var(--color-surface-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--color-surface-hover);
        }

        .header-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--color-brand-primary);
          letter-spacing: 0.05em;
        }

        .close-btn {
          color: var(--color-text-muted);
          transition: var(--transition-smooth);
        }

        .close-btn:hover { color: var(--color-danger); transform: rotate(90deg); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .btn-back {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--color-primary);
          transition: var(--transition-smooth);
        }

        .btn-back:hover { opacity: 0.7; transform: translateX(-4px); }

        .modal-body {
          padding: 2.5rem;
          overflow-y: auto;
          max-height: calc(90vh - 160px);
        }

        .modal-body::-webkit-scrollbar { width: 6px; }
        .modal-body::-webkit-scrollbar-thumb { background: var(--color-surface-border); border-radius: 10px; }

        .detail-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .detail-title {
          font-size: 2.25rem;
          font-weight: 900;
          color: var(--color-text-primary);
          margin-bottom: 0.5rem;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }

        .detail-client {
          font-size: 1.125rem;
          color: var(--color-primary);
          font-weight: 700;
          margin-bottom: 2rem;
          letter-spacing: -0.01em;
        }

        .info-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .info-item {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          padding: 0.75rem;
          background: var(--color-surface-hover);
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          transition: var(--transition-smooth);
        }

        .info-item:hover { border-color: var(--color-surface-border); transform: translateY(-2px); }

        .info-label {
          font-size: 0.6875rem;
          font-weight: 800;
          color: var(--color-text-muted);
          text-transform: uppercase;
          margin-bottom: 2px;
          letter-spacing: 0.05em;
        }

        .info-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        /* Description & Skills Sections */
        .description-section, .skills-section {
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid var(--color-surface-border);
        }

        .description-text {
          font-size: 0.9375rem;
          line-height: 1.7;
          color: var(--color-text-primary);
          white-space: pre-line;
          max-height: 300px;
          overflow-y: auto;
          padding-right: 1rem;
        }

        .skills-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 0.625rem;
          margin-top: 0.75rem;
        }

        .skill-badge {
          padding: 0.375rem 0.875rem;
          background: var(--color-surface-hover);
          border: 1px solid var(--color-surface-border);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          transition: var(--transition-smooth);
        }

        .skill-badge:hover { background: white; border-color: var(--color-primary); color: var(--color-primary); }

        .skill-badge.required {
          background: var(--color-primary-bg);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        /* Status Column */
        .status-card {
          background: var(--color-brand-on-surface);
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          margin-bottom: 2rem;
          color: white;
          box-shadow: var(--shadow-md);
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.125rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .status-dot.active { background: var(--color-success); box-shadow: 0 0 10px var(--color-success); }
        .status-dot.on-hold { background: var(--color-warning); }
        .status-dot.closed { background: var(--color-text-muted); }

        .status-deadline {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: rgba(255,255,255,0.7);
          font-weight: 600;
        }

        .section-subtitle {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
          margin-bottom: 1.5rem;
        }

        /* Timeline */
        .vertical-timeline {
          padding-left: 1.25rem;
          border-left: 2px solid var(--color-surface-border);
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .timeline-item {
          position: relative;
        }

        .timeline-marker {
          position: absolute;
          left: -1.75rem;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          border: 3px solid var(--color-surface-border);
          transition: var(--transition-smooth);
        }

        .timeline-marker.success { border-color: var(--color-success); background: var(--color-success); }
        .timeline-marker.info { border-color: var(--color-primary); }
        .timeline-marker.active { border-color: var(--color-primary); background: var(--color-primary); box-shadow: 0 0 12px var(--color-primary); }

        .timeline-title {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .timeline-date {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        /* Pipeline */
        .pipeline-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .pipeline-stat {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          padding: 1rem;
          background: var(--color-surface-hover);
          border-radius: var(--radius-md);
          transition: var(--transition-smooth);
        }

        .pipeline-stat:hover { background: white; box-shadow: var(--shadow-sm); transform: translateY(-2px); }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .stat-label { font-size: 0.75rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; }
        .stat-value { font-size: 1.25rem; font-weight: 900; color: var(--color-text-primary); }

        .stat-progress {
          height: 6px;
          background: var(--color-surface-border);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .stat-bar { height: 100%; border-radius: var(--radius-full); transition: width 1s ease-out; }

        /* Footer */
        .modal-footer {
          padding: 1.25rem 2.5rem;
          background: var(--color-surface-hover);
          border-top: 1px solid var(--color-surface-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-danger-outline {
          color: var(--color-danger);
          border: 1px solid var(--color-danger);
          background: transparent;
          font-weight: 700;
        }
        .btn-danger-outline:hover { background: var(--color-danger-bg); }

        .confirm-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .confirm-text {
          font-size: 0.8125rem;
          font-weight: 800;
          color: var(--color-danger);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default MandateDetailModal;
