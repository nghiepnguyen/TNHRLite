import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

import Login from './pages/Login';
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
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>

          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
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
        </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
