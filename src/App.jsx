import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { ToastProvider } from './contexts/ToastContext';

import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';

import Jobs from './pages/jobs/Jobs';
import JobForm from './pages/jobs/JobForm';
import JobDetail from './pages/jobs/JobDetail';

import Candidates from './pages/candidates/Candidates';
import CandidateUpload from './pages/candidates/CandidateUpload';
import CandidateDetail from './pages/candidates/CandidateDetail';
import CandidateForm from './pages/candidates/CandidateForm';

import Pipeline from './pages/pipeline/Pipeline';
import Dashboard from './pages/dashboard/Dashboard';
import Reports from './pages/reports/Reports';
import WorkspaceSettings from './pages/settings/WorkspaceSettings';
import Members from './pages/settings/Members';
import AdminDashboard from './pages/admin/AdminDashboard';

import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import CookiePolicy from './pages/legal/CookiePolicy';
import ContactSupport from './pages/support/ContactSupport';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

import { useAuth } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            
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
              {/* Fallback for /dashboard - WorkspaceProvider will handle redirect */}
              <Route index element={<Dashboard />} />
              
              <Route path="w/:workspaceId">
                <Route index element={<Dashboard />} />
                
                {/* Jobs Routes */}
                <Route path="jobs" element={<Jobs />} />
                <Route path="jobs/new" element={<JobForm />} />
                <Route path="jobs/:id" element={<JobDetail />} />
                <Route path="jobs/:id/edit" element={<JobForm />} />
                
                {/* Candidates Routes */}
                <Route path="candidates" element={<Candidates />} />
                <Route path="candidates/upload" element={<CandidateUpload />} />
                <Route path="candidates/:id" element={<CandidateDetail />} />
                <Route path="candidates/:id/edit" element={<CandidateForm />} />
                <Route path="candidates/new" element={<CandidateForm />} />
                
                <Route path="pipeline" element={<Pipeline />} />
                <Route path="reports" element={<Reports />} />
                <Route path="members" element={<Members />} />
                <Route path="settings" element={<WorkspaceSettings />} />
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
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
