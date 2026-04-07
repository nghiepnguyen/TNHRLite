const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';

export const parseCvFromUrl = async (cvUrl) => {
  try {
    const response = await fetch(`${API_BASE_URL}/parse-cv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cvUrl }),
    });

    if (!response.ok) {
      let errBody = {};
      try { errBody = await response.json(); } catch(e) {}
      throw new Error(`API Error: ${errBody.details || errBody.error || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("AI Parse CV error:", error);
    // Generic fallback if local server isn't running yet so frontend dev doesn't break
    return {
      fullName: 'System Fallback Candidate',
      email: 'fallback@example.com',
      skills: ['Unknown'],
      parsedResume: 'Fallback string.'
    };
  }
};

export const compareCandidateToJob = async (candidate, job) => {
  try {
    const response = await fetch(`${API_BASE_URL}/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ candidate, job }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("AI Compare error:", error);
    return {
      fitScore: 0,
      strengths: ['Error communicating with AI server'],
      gaps: ['Check backend server logs'],
      aiSummary: 'Ensure your AI proxy server (port 3001) is running via `node server/src/index.js`.'
    };
  }
};
