import React, { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { submitUpgradeRequest } from '../services/workspace.service';
import { logActivity } from '../services/db';
import './UpgradeModal.css';

export default function UpgradeModal() {
  const { t } = useTranslation();
  const toast = useToast();
  const {
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    activeWorkspace,
    currentUser,
    userProfile,
  } = useWorkspace();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('pro');

  if (!isUpgradeModalOpen) return null;

  const currentPlan = activeWorkspace?.plan || 'free';

  const plans = [
    {
      id: 'free',
      name: t('plans.free.name', 'Free Plan'),
      price: '0đ',
      period: t('plans.month', '/month'),
      description: t('plans.free.desc', 'Ideal for getting started and personal recruitment.'),
      features: [
        t('plans.free.f1', 'Up to 5 active jobs'),
        t('plans.free.f2', 'Up to 50 total candidates'),
        t('plans.free.f3', '10 AI CV parses per month'),
        t('plans.free.f4', 'Basic pipeline tracking'),
        t('plans.free.f5', 'Email notifications'),
      ],
      badge: null,
      actionText: t('plans.current', 'Current Plan'),
      disabled: currentPlan === 'free'
    },
    {
      id: 'pro',
      name: t('plans.pro.name', 'Professional'),
      price: '499K',
      period: t('plans.month', '/month'),
      description: t('plans.pro.desc', 'Perfect for growing businesses and team hiring.'),
      features: [
        t('plans.pro.f1', 'Up to 50 active jobs'),
        t('plans.pro.f2', 'Up to 500 total candidates'),
        t('plans.pro.f3', '100 AI CV parses per month'),
        t('plans.pro.f4', 'Advanced hiring dashboard'),
        t('plans.pro.f5', 'Custom email templates'),
        t('plans.pro.f6', 'Priority email support'),
      ],
      badge: t('plans.popular', 'Most Popular'),
      actionText: t('plans.upgradeBtn', 'Upgrade to Pro'),
      disabled: currentPlan === 'pro' || currentPlan === 'team'
    },
    {
      id: 'team',
      name: t('plans.team.name', 'Enterprise Team'),
      price: '1.499K',
      period: t('plans.month', '/month'),
      description: t('plans.team.desc', 'Ultimate features for agency and scaling enterprises.'),
      features: [
        t('plans.team.f1', 'Unlimited active jobs'),
        t('plans.team.f2', 'Unlimited candidates'),
        t('plans.team.f3', 'Unlimited AI CV parses'),
        t('plans.team.f4', 'Multi-workspace sync'),
        t('plans.team.f5', 'Dedicated Account Manager'),
        t('plans.team.f6', 'Custom ATS integrations'),
        t('plans.team.f7', '24/7 Phone & SLA support'),
      ],
      badge: t('plans.unlimited', 'Unlimited Power'),
      actionText: t('plans.contactBtn', 'Upgrade to Team'),
      disabled: currentPlan === 'team'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activeWorkspace?.id) {
      toast({ type: 'error', message: t('plans.submitError') });
      return;
    }

    if (selectedPlan === currentPlan) {
      return;
    }

    setSubmitting(true);

    try {
      const planName = plans.find((p) => p.id === selectedPlan)?.name || selectedPlan;

      const result = await submitUpgradeRequest({
        workspaceId: activeWorkspace.id,
        targetPlan: selectedPlan,
        planName,
        message,
      });

      if (!result.success) {
        throw new Error(result.error || t('plans.submitError'));
      }

      const actor = userProfile || {
        uid: currentUser?.uid,
        email: currentUser?.email,
        displayName: currentUser?.displayName,
        photoURL: currentUser?.photoURL,
      };

      await logActivity(
        activeWorkspace.id,
        actor,
        'UPGRADE_REQUESTED',
        { type: 'plan', id: selectedPlan, name: planName },
        {
          targetPlan: selectedPlan,
          currentPlan,
          requestId: result.requestId,
          message: message.trim() || null,
        }
      );

      setSubmitted(true);

      if (result.mock) {
        toast({
          type: 'info',
          message: t('plans.submitMockNotice'),
        });
      }
    } catch (err) {
      console.error('Upgrade request failed:', err);
      toast({
        type: 'error',
        message: err.message || t('plans.submitError'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setMessage('');
  };

  const selectedPlanInfo = plans.find((p) => p.id === selectedPlan);

  return (
    <div className="upgrade-modal-overlay" onClick={() => setIsUpgradeModalOpen(false)}>
      <div className="upgrade-modal-container" onClick={(e) => e.stopPropagation()}>
        <button 
          className="upgrade-modal-close" 
          onClick={() => setIsUpgradeModalOpen(false)}
          aria-label={t('plans.close')}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="upgrade-modal-header">
          <span className="material-symbols-outlined upgrade-header-icon">workspace_premium</span>
          <h2>{t('plans.modalTitle', 'Choose Your Workspace Power')}</h2>
          <p>{t('plans.modalSubtitle', 'Unlock automated parsing, larger candidate sheets, and unlimited pipelines.')}</p>
        </div>

        {!submitted ? (
          <div className="upgrade-modal-content">
            <div className="upgrade-plans-grid">
              {plans.map((plan) => {
                const isCurrent = currentPlan === plan.id;
                const isSelected = selectedPlan === plan.id;
                
                return (
                  <div 
                    key={plan.id} 
                    className={`upgrade-plan-card ${plan.id} ${isCurrent ? 'current' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (!plan.disabled && !isCurrent) {
                        setSelectedPlan(plan.id);
                      }
                    }}
                  >
                    {plan.badge && (
                      <div className="plan-badge-ribbon">{plan.badge}</div>
                    )}
                    
                    <div className="plan-card-header">
                      <h3>{plan.name}</h3>
                      <div className="plan-price-block">
                        <span className="plan-price-value">{plan.price}</span>
                        <span className="plan-price-period">{plan.period}</span>
                      </div>
                      <p className="plan-card-desc">{plan.description}</p>
                    </div>

                    <ul className="plan-features-list">
                      {plan.features.map((feat, idx) => (
                        <li key={idx}>
                          <span className="material-symbols-outlined feature-check">check_circle</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="plan-card-footer">
                      {isCurrent ? (
                        <div className="current-plan-indicator">
                          <span className="material-symbols-outlined">verified</span>
                          <span>{t('plans.currentActive', 'Active in this workspace')}</span>
                        </div>
                      ) : (
                        <button 
                          className={`btn plan-action-btn ${plan.id} ${isSelected ? 'active' : ''}`}
                          disabled={plan.disabled}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlan(plan.id);
                          }}
                        >
                          {plan.actionText}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedPlan !== currentPlan && (
              <form className="upgrade-request-form" onSubmit={handleSubmit}>
                <div className="form-title-bar">
                  <span className="material-symbols-outlined">mail</span>
                  <h4>
                    {t('plans.requestTitle')}{' '}
                    <strong>{selectedPlanInfo?.name}</strong>
                  </h4>
                </div>
                <p className="form-description">
                  {t('plans.requestDesc', 'Send a direct request to your workspace owners and our billing desk. We will activate the plan immediately.')}
                </p>

                <div className="form-group">
                  <textarea
                    className="form-control upgrade-message-box"
                    placeholder={t('plans.placeholderText', 'e.g. Please upgrade our workspace for upcoming high-volume engineering recruitment.')}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className={`btn btn-primary btn-submit-upgrade ${selectedPlan}`}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="upgrade-spinner" />
                    ) : (
                      <>
                        <span>{t('plans.sendRequest', 'Submit Request')}</span>
                        <span className="material-symbols-outlined">send</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="upgrade-success-view">
            <div className="success-icon-wrapper">
              <span className="material-symbols-outlined success-icon animate-bounce">task_alt</span>
            </div>
            <h3>{t('plans.successTitle', 'Request Successfully Sent!')}</h3>
            <p>
              {t('plans.successDesc', {
                planName: selectedPlanInfo?.name || selectedPlan,
              })}
            </p>
            <div className="success-details-box">
              <p>
                <strong>{t('plans.selectedPlan')}:</strong> {selectedPlanInfo?.name}
              </p>
              {message && (
                <p>
                  <strong>{t('plans.note')}:</strong> &ldquo;{message}&rdquo;
                </p>
              )}
            </div>
            <button className="btn btn-secondary" onClick={handleReset}>
              {t('plans.back', 'Back to Pricing')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
