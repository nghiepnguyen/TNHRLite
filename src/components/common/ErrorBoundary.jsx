import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface-base, #f8fafc)',
          color: 'var(--color-text-primary, #1e293b)',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>Something went wrong</h1>
          <p style={{ margin: '0 0 1.5rem', color: 'var(--color-text-secondary, #64748b)', maxWidth: '400px' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--color-primary, #2563eb)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Refresh Page
          </button>
          {this.props.showDetails && this.state.error && (
            <details style={{ marginTop: '2rem', maxWidth: '600px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--color-text-secondary, #64748b)' }}>
                Error Details
              </summary>
              <pre style={{
                backgroundColor: '#f1f5f9',
                padding: '1rem',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '0.85rem',
                marginTop: '0.5rem'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;