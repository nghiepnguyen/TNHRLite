/**
 * Centralized email HTML templates for HR-Lite.
 * All email templates live here for maintainability and i18n readiness.
 */

const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tnhrlite.com';

export const welcomeEmailTemplate = (userDisplayName) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #1a1a1a;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #2563eb; margin-bottom: 8px;">Welcome to HR-Lite!</h1>
      <p style="color: #64748b; font-size: 1.2em;">We're excited to have you here.</p>
    </div>
    <p>Hi ${userDisplayName || 'there'},</p>
    <p>Your account has been successfully created. HR-Lite is your all-in-one platform for modern recruitment management.</p>
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #334155;">Next Steps:</h3>
      <ul style="color: #475569; padding-left: 20px;">
        <li>Create or join a <strong>Workspace</strong></li>
        <li>Post your first <strong>Job Opening</strong></li>
        <li>Upload candidates and use <strong>AI Parsing</strong></li>
      </ul>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${origin}/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
        Get Started
      </a>
    </div>
    <p style="font-size: 0.9em; color: #64748b;">
      Need help? Just reply to this email or visit our <a href="${origin}/contact-support" style="color: #2563eb;">support center</a>.
    </p>
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
    <p style="font-size: 0.8em; color: #94a3b8; text-align: center;">
      © ${new Date().getFullYear()} HR-Lite. All rights reserved.
    </p>
  </div>
`;

export const newJobEmailTemplate = ({ workspaceId, jobId, jobData }) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #1a1a1a;">
    <h2 style="color: #2563eb; margin-top: 0;">New Job Opening</h2>
    <p>A new job has been posted in your workspace.</p>
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
      <strong style="font-size: 1.1em; display: block; margin-bottom: 4px; color: #1e293b;">${jobData.title}</strong>
      <p style="margin: 0; color: #64748b; font-size: 0.9em;">${jobData.department || 'General'} • ${jobData.location || 'Remote'}</p>
    </div>
    <div style="margin: 25px 0;">
      <a href="${origin}/dashboard/w/${workspaceId}/jobs/${jobId}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Job Details</a>
    </div>
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 0.75em; color: #94a3b8; text-align: center;">You received this because "New Job Openings" is enabled in your HR-Lite profile settings.</p>
  </div>
`;

export const newCandidateEmailTemplate = ({ workspaceId, candidateId, candidateData }) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #1a1a1a;">
    <h2 style="color: #10b981; margin-top: 0;">New Candidate Added</h2>
    <p>A new candidate has been added to your workspace.</p>
    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
      <strong style="font-size: 1.1em; display: block; margin-bottom: 4px; color: #1e293b;">${candidateData.fullName}</strong>
      <p style="margin: 0; color: #64748b; font-size: 0.9em;">${candidateData.currentTitle || 'Candidate'} • ${candidateData.location || 'Unknown'}</p>
    </div>
    <div style="margin: 25px 0;">
      <a href="${origin}/dashboard/w/${workspaceId}/candidates/${candidateId}" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Candidate Profile</a>
    </div>
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 0.75em; color: #94a3b8; text-align: center;">You received this because "New Candidates" is enabled in your HR-Lite profile settings.</p>
  </div>
`;

export const pipelineUpdateEmailTemplate = ({ stage, appData }) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #1a1a1a;">
    <h2 style="color: #2563eb; margin-top: 0;">Pipeline Stage Update</h2>
    <p>A candidate has been moved to a new stage in your hiring pipeline.</p>
    <div style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="padding: 12px 15px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600;">
        ${appData.candidateName || 'Candidate'}
      </div>
      <div style="padding: 15px; display: flex; align-items: center; gap: 10px;">
        <span style="color: #64748b; font-size: 0.9em;">New Stage:</span>
        <span style="background-color: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 0.85em;">${stage}</span>
      </div>
    </div>
    <div style="margin: 25px 0;">
      <a href="${origin}/dashboard/w/${appData.workspaceId}/pipeline?job=${appData.jobId}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Pipeline</a>
    </div>
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 0.75em; color: #94a3b8; text-align: center;">You received this because "Pipeline Changes" is enabled in your HR-Lite profile settings.</p>
  </div>
`;

export const inviteEmailTemplate = ({ workspaceName, role, invitedByEmail, email }) => {
  const inviteLink = `${origin}/login`;
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff; color: #1a1a1a;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2563eb; margin-bottom: 8px;">HR-Lite</h1>
        <p style="color: #64748b; font-size: 1.1em;">Workspace Invitation</p>
      </div>
      <p>Hi there,</p>
      <p><strong>${invitedByEmail}</strong> has invited you to join the workspace <strong>"${workspaceName}"</strong> as a <strong>${role}</strong>.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
          Accept Invitation
        </a>
      </div>
      <p style="font-size: 0.9em; color: #64748b;">
        If you already have an account, log in with <strong>${email}</strong> to see your invitation. 
        If not, please sign up using the same email address.
      </p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
      <p style="font-size: 0.8em; color: #94a3b8; text-align: center;">
        This invitation was sent by HR-Lite on behalf of ${invitedByEmail}.
      </p>
    </div>
  `;
};