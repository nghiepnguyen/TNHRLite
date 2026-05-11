import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AuthProvider } from './contexts/AuthProvider';
import { WorkspaceProvider } from './contexts/WorkspaceProvider';
import { ToastProvider } from './contexts/ToastProvider';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/common/SEO';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages - Lazy Loaded
const Login = lazy(() => import('./pages/Login'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));

const Jobs = lazy(() => import('./pages/jobs/Jobs'));
const JobForm = lazy(() => import('./pages/jobs/JobForm'));
const JobDetail = lazy(() => import('./pages/jobs/JobDetail'));

const Candidates = lazy(() => import('./pages/candidates/Candidates'));
const CandidateUpload = lazy(() => import('./pages/candidates/CandidateUpload'));
const CandidateDetail = lazy(() => import('./pages/candidates/CandidateDetail'));
const CandidateForm = lazy(() => import('./pages/candidates/CandidateForm'));

const Pipeline = lazy(() => import('./pages/pipeline/Pipeline'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const WorkspaceSettings = lazy(() => import('./pages/settings/WorkspaceSettings'));
const Members = lazy(() => import('./pages/settings/Members'));
const UserSettings = lazy(() => import('./pages/settings/UserSettings'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/legal/CookiePolicy'));
const ContactSupport = lazy(() => import('./pages/support/ContactSupport'));

const PageLoading = () => (
  <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-surface-base)' }}>
    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--color-surface-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <PageLoading />;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <HelmetProvider>
        <SEO />
        <ToastProvider>
          <AuthProvider>
            <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/contact-support" element={<ContactSupport />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <WorkspaceProvider>
                    <DashboardLayout />
                  </WorkspaceProvider>
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                
                <Route path="w/:workspaceId">
                  <Route index element={<Dashboard />} />
                  <Route path="jobs" element={<Jobs />} />
                  <Route path="jobs/new" element={<JobForm />} />
                  <Route path="jobs/:id" element={<JobDetail />} />
                  <Route path="jobs/:id/edit" element={<JobForm />} />
                  
                  <Route path="candidates" element={<Candidates />} />
                  <Route path="candidates/upload" element={<CandidateUpload />} />
                  <Route path="candidates/:id" element={<CandidateDetail />} />
                  <Route path="candidates/:id/edit" element={<CandidateForm />} />
                  <Route path="candidates/new" element={<CandidateForm />} />
                  
                  <Route path="pipeline" element={<Pipeline />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="members" element={<Members />} />
                  <Route path="settings" element={<WorkspaceSettings />} />
                  <Route path="profile" element={<UserSettings />} />
                  <Route path="admin" element={<AdminDashboard />} />
                </Route>
              </Route>

              <Route path="*" element={
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <h1>404: Not Found</h1>
                  <p>The page you are looking for does not exist.</p>
                  <a href="/">Go to Home</a>
                </div>
              } />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
      </HelmetProvider>
    </Router>
  );
}

export default App;
