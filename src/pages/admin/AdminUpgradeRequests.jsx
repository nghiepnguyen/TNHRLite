import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import {
  fetchUpgradeRequests,
  reviewUpgradeRequest,
  fetchAdminWorkspaces,
  setWorkspacePlan,
} from '../../services/admin.service';
import { formatDate } from '../../utils/dateUtils';
import './AdminPortal.css';

const STATUS_FILTERS = ['pending', 'approved', 'rejected', 'all'];
const PLANS = ['free', 'pro', 'team'];

export default function AdminUpgradeRequests() {
  const { t } = useTranslation();
  const toast = useToast();

  const [statusFilter, setStatusFilter] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [planDrafts, setPlanDrafts] = useState({});
  const [planNotes, setPlanNotes] = useState({});
  const [savingPlanId, setSavingPlanId] = useState(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      setError(null);
      const data = await fetchUpgradeRequests(statusFilter);
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingRequests(false);
    }
  }, [statusFilter]);

  const loadWorkspaces = useCallback(async () => {
    try {
      setLoadingWorkspaces(true);
      const data = await fetchAdminWorkspaces();
      const list = data.workspaces || [];
      setWorkspaces(list);
      const drafts = {};
      list.forEach((ws) => {
        drafts[ws.id] = ws.plan || 'free';
      });
      setPlanDrafts(drafts);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingWorkspaces(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const handleReview = async (requestId, action, req) => {
    let adminNote = '';
    if (action === 'reject') {
      adminNote = window.prompt(t('adminPage.billing.rejectPrompt'), '') || '';
      if (!window.confirm(t('adminPage.billing.rejectConfirm'))) return;
    } else if (
      !window.confirm(
        t('adminPage.billing.approveConfirm', {
          plan: req.targetPlanName || req.targetPlan,
          workspace: req.workspaceName,
        })
      )
    ) {
      return;
    }

    try {
      setActingId(requestId);
      await reviewUpgradeRequest(requestId, action, adminNote);
      toast({
        type: 'success',
        message:
          action === 'approve'
            ? t('adminPage.billing.approved')
            : t('adminPage.billing.rejected'),
      });
      await Promise.all([loadRequests(), loadWorkspaces()]);
    } catch (err) {
      toast({ type: 'error', message: err.message });
    } finally {
      setActingId(null);
    }
  };

  const handlePlanSave = async (workspaceId) => {
    const plan = planDrafts[workspaceId];
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (!ws || plan === ws.plan) return;

    try {
      setSavingPlanId(workspaceId);
      await setWorkspacePlan(workspaceId, plan, planNotes[workspaceId] || '');
      toast({ type: 'success', message: t('adminPage.billing.planUpdated') });
      await loadWorkspaces();
    } catch (err) {
      toast({ type: 'error', message: err.message });
    } finally {
      setSavingPlanId(null);
    }
  };

  return (
    <div className="admin-billing-page">
      {error && (
        <div
          className="badge badge-danger"
          style={{ display: 'block', padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)' }}
        >
          {error}
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-surface-border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            {t('adminPage.billing.requestsTitle')}
          </h2>
          <div className="admin-billing-filters">
            {STATUS_FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                className={`admin-filter-chip ${statusFilter === key ? 'active' : ''}`}
                onClick={() => setStatusFilter(key)}
              >
                {t(`adminPage.billing.filter.${key}`)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-surface-hover)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.875rem',
                }}
              >
                <th style={{ padding: '1rem' }}>{t('adminPage.billing.columns.workspace')}</th>
                <th style={{ padding: '1rem' }}>{t('adminPage.billing.columns.requester')}</th>
                <th style={{ padding: '1rem' }}>{t('adminPage.billing.columns.current')}</th>
                <th style={{ padding: '1rem' }}>{t('adminPage.billing.columns.requested')}</th>
                <th style={{ padding: '1rem' }}>{t('adminPage.billing.columns.message')}</th>
                <th style={{ padding: '1rem' }}>{t('adminPage.billing.columns.date')}</th>
                <th style={{ padding: '1rem' }}>{t('adminPage.billing.columns.status')}</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>{t('adminPage.billing.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loadingRequests ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center' }}>
                    {t('adminPage.billing.loading')}
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center' }}>
                    {t('adminPage.billing.noRequests')}
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--color-surface-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{req.workspaceName}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{req.requestedByEmail}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`plan-badge-inline ${req.currentPlan}`}>{req.currentPlan}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`plan-badge-inline ${req.targetPlan}`}>
                        {req.targetPlanName || req.targetPlan}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '1rem',
                        maxWidth: '200px',
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {req.message || '—'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {req.createdAt ? formatDate(req.createdAt) : '—'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`status-badge ${req.status}`}>{req.status}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {req.status === 'pending' ? (
                        <div className="admin-actions-group">
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={actingId === req.id}
                            onClick={() => handleReview(req.id, 'approve', req)}
                          >
                            {t('adminPage.billing.approve')}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary text-danger"
                            disabled={actingId === req.id}
                            onClick={() => handleReview(req.id, 'reject', req)}
                          >
                            {t('adminPage.billing.reject')}
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {req.reviewedByEmail || '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-surface-border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t('adminPage.billing.workspacesTitle')}</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-surface-hover)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.875rem',
                }}
              >
                <th style={{ padding: '1rem' }}>{t('adminPage.billing.columns.workspace')}</th>
                <th style={{ padding: '1rem' }}>{t('adminPage.billing.columns.owner')}</th>
                <th style={{ padding: '1rem' }}>{t('adminPage.billing.columns.usage')}</th>
                <th style={{ padding: '1rem' }}>{t('adminPage.billing.columns.changePlan')}</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>{t('adminPage.billing.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loadingWorkspaces ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>
                    {t('adminPage.billing.loading')}
                  </td>
                </tr>
              ) : (
                workspaces.map((ws) => {
                  const usage = ws.usage || {};
                  const draftPlan = planDrafts[ws.id] ?? ws.plan;
                  const changed = draftPlan !== ws.plan;

                  return (
                    <tr key={ws.id} style={{ borderBottom: '1px solid var(--color-surface-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{ws.name}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{ws.ownerEmail || '—'}</td>
                      <td style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                        {t('adminPage.billing.usageSummary', {
                          jobs: usage.jobs ?? 0,
                          candidates: usage.candidates ?? 0,
                          cv: usage.cvParsesThisMonth ?? 0,
                        })}
                      </td>
                      <td style={{ padding: '1rem' }} className="admin-plan-row">
                        <select
                          value={draftPlan}
                          onChange={(e) =>
                            setPlanDrafts((prev) => ({ ...prev, [ws.id]: e.target.value }))
                          }
                        >
                          {PLANS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'center' }}>
                          {changed && (
                            <input
                              type="text"
                              className="form-control"
                              style={{ fontSize: '0.75rem', maxWidth: '180px' }}
                              placeholder={t('adminPage.billing.planNotePlaceholder')}
                              value={planNotes[ws.id] || ''}
                              onChange={(e) =>
                                setPlanNotes((prev) => ({ ...prev, [ws.id]: e.target.value }))
                              }
                            />
                          )}
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={!changed || savingPlanId === ws.id}
                            onClick={() => handlePlanSave(ws.id)}
                          >
                            {savingPlanId === ws.id ? '…' : t('adminPage.billing.savePlan')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
