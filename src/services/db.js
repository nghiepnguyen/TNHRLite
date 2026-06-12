/**
 * Barrel file — re-exports all domain services.
 * 
 * Maintained for backward compatibility. New code should import directly from:
 *   - jobService.js
 *   - candidateService.js
 *   - applicationService.js
 *   - storageService.js
 *   - activityService.js
 */

// Jobs
export { getJobs, getJob, createJob, updateJob, deleteJob } from './jobService';

// Candidates
export { getCandidates, getCandidate, createCandidate, updateCandidate, deleteCandidate } from './candidateService';

// Applications (Pipeline)
export { 
  getApplicationsByJob, 
  getApplicationsByCandidate, 
  getAllApplications, 
  createApplication, 
  updateApplicationStage, 
  updateApplication 
} from './applicationService';

// Storage
export { uploadCV } from './storageService';

// Activity & Usage
export { logActivity, syncWorkspaceUsage } from './activityService';