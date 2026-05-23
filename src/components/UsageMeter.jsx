import React from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useTranslation } from 'react-i18next';
import './UsageMeter.css';

const PLAN_LIMITS = {
  free: { name: 'Free', jobs: 5, candidates: 50, cvParsesPerMonth: 10 },
  pro: { name: 'Pro', jobs: 50, candidates: 500, cvParsesPerMonth: 100 },
  team: { name: 'Team', jobs: -1, candidates: -1, cvParsesPerMonth: -1 }
};

export default function UsageMeter({ isCollapsed }) {
  const { t } = useTranslation();
  const { activeWorkspace, setIsUpgradeModalOpen } = useWorkspace() || {};

  if (!activeWorkspace) return null;

  const currentPlanId = activeWorkspace.plan || 'free';
  const planInfo = PLAN_LIMITS[currentPlanId] || PLAN_LIMITS.free;

  // Retrieve current usage safely
  const usage = activeWorkspace.usage || {};
  const currentJobs = usage.jobs || 0;
  const currentCandidates = usage.candidates || 0;
  const currentCVParses = usage.cvParsesThisMonth || 0;

  // Construct resources with their status
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

  // Check if any resource has hit its limit or is close (>= 80%)
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

  const planDisplayName = t(`usage.planNames.${currentPlanId}`, currentPlanId);

  if (isCollapsed) {
    // Collapsed sidebar state: show a tiny badge or indicator that triggers upgrade
    return (
      <div className="usage-meter-collapsed" onClick={() => setIsUpgradeModalOpen(true)}>
        <button 
          className={`usage-collapsed-trigger ${hasHitLimit ? 'critical' : isNearLimit ? 'warning' : ''}`}
          title={t('usage.collapsedTitle', {
            plan: planDisplayName,
            defaultValue: '{{plan}} — click to view limits',
          })}
        >
          <span className="material-symbols-outlined">
            {hasHitLimit ? 'warning' : isNearLimit ? 'error' : 'workspace_premium'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="usage-meter-expanded">
      <div className="usage-meter-header">
        <div className="usage-plan-info">
          <span className="plan-label">{t('usage.currentPlan', 'Plan')}:</span>
          <span className={`plan-badge ${currentPlanId}`}>{planDisplayName}</span>
        </div>
        
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
