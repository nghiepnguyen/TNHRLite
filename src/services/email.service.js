import { auth } from '../firebase';

const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';

/**
 * Helper to get Auth Token for backend calls
 */
const getAuthHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Sends an email via the backend Resend API proxy.
 * @param {Object} options - Email options
 * @param {string|string[]} options.to - Recipient(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content fallback
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to || !subject || (!html && !text)) {
    console.warn("sendEmail: Missing required fields", { to, subject });
    return { success: false, error: "Missing required fields" };
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/send-email`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ to, subject, html, text }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.details || result.error || response.statusText);
    }

    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: error.message };
  }
};
