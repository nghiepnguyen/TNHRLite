/**
 * Pipeline Utilities
 * Contains business logic for calculating application states like overdue and blocked.
 */

interface Application {
  stage: string;
  nextStep?: string;
  updatedAt?: any;
  lastStageChangedAt?: any;
  createdAt?: any;
  priority?: string;
  interview?: {
    date?: string;
    link?: string;
    status?: string;
  };
}

/**
 * Normalizes Firestore Timestamps or generic dates to milliseconds
 */
const toMillis = (dateObj: any): number => {
  if (!dateObj) return 0;
  if (typeof dateObj.toMillis === 'function') return dateObj.toMillis();
  if (dateObj.seconds) return dateObj.seconds * 1000;
  return new Date(dateObj).getTime();
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Calculates if an application should be marked as overdue or blocked.
 * 
 * Logic:
 * - Overdue:
 *   1. Has nextStep AND has not been updated in > 2 days.
 *   2. In 'Interview' stage for > 7 days AND no interview is scheduled.
 * - Blocked:
 *   1. Priority is explicitly set to 'Block'.
 */
export const getAppState = (app: Application) => {
  const now = Date.now();
  
  // Use updatedAt, fallback to lastStageChangedAt, then createdAt
  const lastUpdate = toMillis(app.updatedAt || app.lastStageChangedAt || app.createdAt);
  const lastStageMove = toMillis(app.lastStageChangedAt || app.createdAt);
  
  const daysSinceUpdate = (now - lastUpdate) / MS_PER_DAY;
  const daysInStage = (now - lastStageMove) / MS_PER_DAY;

  let overdue = false;

  // Rule 1: Has nextStep but no update for 2 days
  if (app.nextStep && app.nextStep.trim() !== '' && daysSinceUpdate > 2) {
    overdue = true;
  }

  // Rule 2: In Interview stage for 7 days without a scheduled date
  if (app.stage === 'Interview' && daysInStage > 7 && !app.interview?.date) {
    overdue = true;
  }

  const blocked = app.priority === 'Block';

  return { overdue, blocked };
};
