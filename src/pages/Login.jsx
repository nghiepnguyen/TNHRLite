import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    // For demo purposes when Firebase is not configured, we'll bypass real auth
    // if the credentials match some default mock, or we'll wrap it in a try/catch.
    
    try {
      setError('');
      setLoading(true);
      if (isSignUp) {
        if (password !== rePassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        await register(email, password);
        // Track signup event
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'signup_completed', { 'method': 'email' });
        }
      } else {
        await login(email, password);
        // Track login event
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'login_success', { 'method': 'email' });
        }
      }
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
         setError('Invalid email or password. You may need to Sign Up first.');
      } else if (err.code === 'auth/email-already-in-use') {
         setError('Email is already registered. Switch to Log In.');
      } else {
         setError(err.message || 'An error occurred. Check if Firebase structure is valid.');
      }
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      // Track login event (Google)
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'login_success', { 'method': 'google' });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google.');
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--color-surface-base)', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>HR Lite</h1>
          <p className="text-secondary" style={{ marginTop: '0.5rem' }}>{isSignUp ? 'Create a new account' : 'Log in to your recruiter dashboard'}</p>
        </div>
        
        {error && <div className="badge badge-danger" style={{ display: 'block', padding: '0.75rem', marginBottom: '1rem', whiteSpace: 'normal', borderRadius: 'var(--radius-md)' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              required 
              placeholder="e.g. recruiter@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              required 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input 
                type="password" 
                className="form-control" 
                required 
                placeholder="Re-enter your password"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
              />
            </div>
          )}
          <button disabled={loading} className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
           <hr style={{ flex: 1, borderTop: '1px solid var(--color-surface-border)', borderBottom: 'none' }} />
           <span style={{ padding: '0 0.75rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>OR</span>
           <hr style={{ flex: 1, borderTop: '1px solid var(--color-surface-border)', borderBottom: 'none' }} />
        </div>

        <button 
          type="button" 
          disabled={loading}
          onClick={handleGoogleLogin} 
          className="btn btn-secondary" 
          style={{ width: '100%', padding: '0.75rem', fontWeight: 600 }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}>
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          Continue with Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="text-primary" 
            style={{ padding: '0.5rem' }}
          >
            {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          This site is protected by reCAPTCHA and the Google 
          <a href="https://policies.google.com/privacy" className="text-secondary" style={{ margin: '0 4px' }}>Privacy Policy</a> and
          <a href="https://policies.google.com/terms" className="text-secondary" style={{ margin: '0 4px' }}>Terms of Service</a> apply.
        </div>
      </div>
    </div>
  );
}
