import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useTranslation } from 'react-i18next';
import './UsageMeter.css';

const PLAN_LIMITS = {
  free: { name: 'Free', jobs: 5, candidates: 50, cvParsesPerMonth: 10 },
  pro: { name: 'Pro', jobs: 50, candidates: 500, cvParsesPerMonth: 100 },
  team: { name: 'Team', jobs: -1, candidates: -1, cvParsesPerMonth: -1 }
};

export default function UsageMeter({ isCollapsed: _isSidebarCollapsed }) {
  const { t } = useTranslation();
  const { activeWorkspace, setIsUpgradeModalOpen } = useWorkspace() || {};
  // Independent collapse state: collapsed by default, expands on click
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedRef = useRef(null);

  // Click outside to collapse
  useEffect(() => {
    if (!isExpanded) return;
    function handleClickOutside(event) {
      if (expandedRef.current && !expandedRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  // Memoize resource computations — must be called BEFORE early return (Rules of Hooks)
  // All derived values computed inside useMemo to satisfy the React Compiler
  const { enrichedResources, isNearLimit, hasHitLimit, currentPlanId } = useMemo(() => {
    if (!activeWorkspace) return { enrichedResources: [], isNearLimit: false, hasHitLimit: false, currentPlanId: 'free' };
    
    const planId = activeWorkspace.plan || 'free';
    const planInfo = PLAN_LIMITS[planId] || PLAN_LIMITS.free;
    const usage = activeWorkspace.usage || {};
    const currentJobs = usage.jobs || 0;
    const currentCandidates = usage.candidates || 0;
    const currentCVParses = usage.cvParsesThisMonth || 0;

    const resources = [
      {
        key: 'jobs',
        name: t('usage.jobs', 'Active Jobs'),
        current: currentJobs,
        limit: planInfo.jobs,
        icon: 'work'
      },
      {
        key: 'candidates',
        name: t('usage.candidates', 'Total Candidates'),
        current: currentCandidates,
        limit: planInfo.candidates,
        icon: 'group'
      },
      {
        key: 'cvParses',
        name: t('usage.cvParses', 'CV Parses (Monthly)'),
        current: currentCVParses,
        limit: planInfo.cvParsesPerMonth,
        icon: 'description'
      }
    ];

    let isNearLimit = false;
    let hasHitLimit = false;

    const enrichedResources = resources.map(res => {
      const isUnlimited = res.limit === -1;
      let percentage = 0;
      let isWarning = false;
      let isCritical = false;

      if (!isUnlimited) {
        percentage = Math.min(Math.round((res.current / res.limit) * 100), 100);
        if (res.current >= res.limit) {
          isCritical = true;
          hasHitLimit = true;
        } else if (res.current / res.limit >= 0.8) {
          isWarning = true;
          isNearLimit = true;
        }
      }

      return {
        ...res,
        isUnlimited,
        percentage,
        isWarning,
        isCritical
      };
    });

    return { enrichedResources, isNearLimit, hasHitLimit, currentPlanId: planId };
  }, [activeWorkspace, t]);

  const planDisplayName = t(`usage.planNames.${currentPlanId}`, currentPlanId);

  if (!isExpanded) {
    // Collapsed by default: compact card with plan name + 3 numbers, no text labels
    return (
      <div className="usage-meter-collapsed">
        <button
          className={`usage-collapsed-card ${hasHitLimit ? 'critical' : isNearLimit ? 'warning' : ''}`}
          onClick={() => setIsExpanded(true)}
          title={t('usage.collapsedTitle', {
            plan: planDisplayName,
            defaultValue: '{{plan}} — click to view details',
          })}
        >
          <div className="usage-collapsed-header">
            <span className="material-symbols-outlined collapsed-plan-icon">
              {hasHitLimit ? 'warning' : isNearLimit ? 'error' : 'workspace_premium'}
            </span>
            <span className={`collapsed-plan-badge ${currentPlanId}`}>{planDisplayName}</span>
          </div>
          <div className="usage-collapsed-numbers">
            {enrichedResources.map((res) => (
              <span key={res.key} className="collapsed-number-item" title={res.name}>
                <span className="material-symbols-outlined collapsed-resource-icon">{res.icon}</span>
                <span className={`collapsed-number-value ${res.isCritical ? 'critical' : res.isWarning ? 'warning' : ''}`}>
                  {res.current}{res.isUnlimited ? '' : `/${res.limit}`}
                </span>
              </span>
            ))}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="usage-meter-expanded" ref={expandedRef}>
      <div className="usage-meter-header">
        <div className="usage-plan-info">
          <span className="plan-label">{t('usage.currentPlan', 'Plan')}:</span>
          <span className={`plan-badge ${currentPlanId}`}>{planDisplayName}</span>
        </div>
        
        <div className="usage-meter-header-actions">
          {currentPlanId !== 'team' && (
            <button 
              className="btn btn-upgrade-link"
              onClick={() => setIsUpgradeModalOpen(true)}
            >
              {t('usage.upgrade', 'Upgrade')}
              <span className="material-symbols-outlined !text-[12px] inline-block ml-0.5">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      <div className="usage-resources-container">
        {enrichedResources.map((res) => (
          <div key={res.key} className="usage-resource-item">
            <div className="resource-meta">
              <span className="resource-name-wrap">
                <span className="material-symbols-outlined resource-icon">{res.icon}</span>
                <span>{res.name}</span>
              </span>
              <span className={`resource-numbers ${res.isCritical ? 'critical' : res.isWarning ? 'warning' : ''}`}>
                {res.current} / {res.isUnlimited ? '∞' : res.limit}
              </span>
            </div>

            <div className="resource-progress-bg">
              <div 
                className={`resource-progress-bar ${res.isCritical ? 'critical' : res.isWarning ? 'warning' : ''} ${res.isUnlimited ? 'unlimited' : ''}`}
                style={{ width: `${res.isUnlimited ? 100 : res.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {hasHitLimit && (
        <div className="usage-alert-box critical">
          <span className="material-symbols-outlined">warning</span>
          <p>{t('usage.limitReachedAlert', 'Resource limits reached. Upgrade to unlock full access.')}</p>
        </div>
      )}
      {!hasHitLimit && isNearLimit && (
        <div className="usage-alert-box warning">
          <span className="material-symbols-outlined">info</span>
          <p>{t('usage.limitNearAlert', 'Approaching limits. Recommend upgrading soon.')}</p>
        </div>
      )}
    </div>
  );
}
