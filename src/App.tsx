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
import EditExperience from './pages/EditExperience';
import EditGuide from './pages/EditGuide';
import GuideDashboard from './pages/GuideDashboard';
import UserProfile from './pages/UserProfile';
import HotelOperatorDashboard from './pages/HotelOperatorDashboard';
import RegionalPartner from './pages/RegionalPartner';
import { UserRole } from './types/supabase';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, profile, hasRole } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && profile && !allowedRoles.some(role => hasRole(role))) {
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
          <Route path="regions" element={<Territories />} />
          <Route path="territories/:id" element={<TerritoryDetail />} />
          <Route path="experiences/:id" element={<ExperienceDetail />} />
          <Route path="regional-partner" element={<RegionalPartner />} />
          
          <Route path="profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          <Route path="bookings" element={
            <ProtectedRoute allowedRoles={['tourist']}>
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
          
          <Route path="territory-management/edit-experience/:id" element={
            <ProtectedRoute allowedRoles={['territory_manager']}>
              <EditExperience />
            </ProtectedRoute>
          } />
          
          <Route path="territory-management/edit-guide/:id" element={
            <ProtectedRoute allowedRoles={['territory_manager']}>
              <EditGuide />
            </ProtectedRoute>
          } />
          
          <Route path="guide-dashboard" element={
            <ProtectedRoute allowedRoles={['tour_guide']}>
              <GuideDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="hotel-operator-dashboard" element={
            <ProtectedRoute allowedRoles={['hotel_operator']}>
              <HotelOperatorDashboard />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;