import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout and Pages
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Territories from './pages/Territories';
import TerritoryDetail from './pages/TerritoryDetail';
import ExperienceDetail from './pages/ExperienceDetail';
import Bookings from './pages/Bookings';
import AdminDashboard from './pages/AdminDashboard';
import TerritoryManagement from './pages/TerritoryManagement';
import GuideDashboard from './pages/GuideDashboard';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'territory_manager' | 'tour_guide' | 'tourist'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, profile } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

function App() {
  const { loadUser } = useAuthStore();
  
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="territories" element={<Territories />} />
          <Route path="territories/:id" element={<TerritoryDetail />} />
          <Route path="experiences/:id" element={<ExperienceDetail />} />
          
          <Route path="bookings" element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          } />
          
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="territory-management" element={
            <ProtectedRoute allowedRoles={['territory_manager']}>
              <TerritoryManagement />
            </ProtectedRoute>
          } />
          
          <Route path="guide-dashboard" element={
            <ProtectedRoute allowedRoles={['tour_guide']}>
              <GuideDashboard />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;