import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import MyComplaints from './pages/citizen/MyComplaints';
import ComplaintDetail from './pages/citizen/ComplaintDetail';
import CitizenProfile from './pages/citizen/CitizenProfile';
import PoliceDashboard from './pages/police/PoliceDashboard';
import PoliceComplaints from './pages/police/PoliceComplaints';
import PoliceComplaintDetail from './pages/police/PoliceComplaintDetail';
import PoliceMap from './pages/police/PoliceMap';
import MyCases from './pages/police/MyCases';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStations from './pages/admin/AdminStations';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PageLoader = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg-primary)' }}>
    <div style={{ textAlign:'center' }}>
      <div style={{ width:48, height:48, border:'3px solid var(--border)', borderTop:'3px solid var(--accent-blue)', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
      <p style={{ color:'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:13 }}>Loading SmartCMS...</p>
    </div>
  </div>
);

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={`/${user.role}`} replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/citizen" replace /> : <RegisterPage />} />

      {/* Citizen Routes */}
      <Route path="/citizen" element={<ProtectedRoute roles={['citizen']}><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/citizen/submit" element={<ProtectedRoute roles={['citizen']}><SubmitComplaint /></ProtectedRoute>} />
      <Route path="/citizen/complaints" element={<ProtectedRoute roles={['citizen']}><MyComplaints /></ProtectedRoute>} />
      <Route path="/citizen/complaints/:id" element={<ProtectedRoute roles={['citizen']}><ComplaintDetail /></ProtectedRoute>} />
      <Route path="/citizen/profile" element={<ProtectedRoute roles={['citizen']}><CitizenProfile /></ProtectedRoute>} />

      {/* Police Routes */}
      <Route path="/police" element={<ProtectedRoute roles={['police','admin']}><PoliceDashboard /></ProtectedRoute>} />
      <Route path="/police/complaints" element={<ProtectedRoute roles={['police','admin']}><PoliceComplaints /></ProtectedRoute>} />
      <Route path="/police/complaints/:id" element={<ProtectedRoute roles={['police','admin']}><PoliceComplaintDetail /></ProtectedRoute>} />
      <Route path="/police/map" element={<ProtectedRoute roles={['police','admin']}><PoliceMap /></ProtectedRoute>} />
      <Route path="/police/my-cases" element={<ProtectedRoute roles={['police']}><MyCases /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/stations" element={<ProtectedRoute roles={['admin']}><AdminStations /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0f1629', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'Space Grotesk, sans-serif', fontSize: 14 },
            success: { iconTheme: { primary: '#10b981', secondary: '#0f1629' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0f1629' } },
          }}
        />
      </Router>
    </AuthProvider>
  );
}
