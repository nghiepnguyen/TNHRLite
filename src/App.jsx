import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = window.location.pathname;

  if (!currentUser) {
    console.warn(`[ProtectedRoute] Unauthorized access to ${location}. Redirecting to /login.`);
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  React.useEffect(() => {
    console.info('[App] Mounted. Path:', window.location.pathname);
  }, []);

  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
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
              
              {/* Admin Route */}
              <Route path="admin" element={<AdminDashboard />} />
            </Route>

            {/* Catch-all 404 Route */}
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
