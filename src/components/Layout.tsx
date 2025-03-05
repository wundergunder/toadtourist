import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Menu, X, User, Edit, Hotel } from 'lucide-react';

const ToadLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect y="22" width="32" height="6" rx="2" fill="#8B4513" />
    <ellipse cx="16" cy="14" rx="10" ry="8" fill="#4CAF50" />
    <ellipse cx="16" cy="16" rx="8" ry="6" fill="#388E3C" />
    <circle cx="12" cy="12" r="2" fill="white" />
    <circle cx="12" cy="12" r="1" fill="black" />
    <circle cx="20" cy="12" r="2" fill="white" />
    <circle cx="20" cy="12" r="1" fill="black" />
    <path d="M14 18C15.3333 19.3333 16.6667 19.3333 18 18" stroke="white" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const Layout: React.FC = () => {
  const { user, profile, signOut, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleEditAvatar = () => {
    navigate('/profile');
    setIsProfileMenuOpen(false);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      <header className="bg-green-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <ToadLogo />
            <span className="text-xl font-bold">Lazy Toad</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-green-200">Home</Link>
            {hasRole('tourist') && (
              <Link to="/regions" className="hover:text-green-200">Regions</Link>
            )}
            
            {user ? (
              <>
                {hasRole('admin') && (
                  <Link to="/admin" className="hover:text-green-200">Admin</Link>
                )}
                {hasRole('territory_manager') && (
                  <Link to="/territory-management" className="hover:text-green-200">Manage Region</Link>
                )}
                {hasRole('tour_guide') && (
                  <Link to="/guide-dashboard" className="hover:text-green-200">Guide Dashboard</Link>
                )}
                {hasRole('hotel_operator') && (
                  <Link to="/hotel-operator-dashboard" className="hover:text-green-200">Hotel Dashboard</Link>
                )}
                {hasRole('tourist') && (
                  <Link to="/bookings" className="hover:text-green-200">My Bookings</Link>
                )}
                <div className="flex items-center space-x-4 relative" ref={profileMenuRef}>
                  <button 
                    onClick={handleProfileClick}
                    className="flex items-center space-x-1 hover:text-green-200"
                  >
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name} 
                        className="h-8 w-8 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                  </button>
                  
                  {/* Profile dropdown menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={handleEditAvatar}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-green-200">Login</Link>
                <Link to="/register" className="hover:text-green-200 bg-green-500 px-4 py-2 rounded-md">Register</Link>
              </>
            )}
          </div>
          
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-green-700 px-4 py-2">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-white hover:text-green-200">Home</Link>
              {hasRole('tourist') && (
                <Link to="/regions" className="text-white hover:text-green-200">Regions</Link>
              )}
              
              {user ? (
                <>
                  {hasRole('admin') && (
                    <Link to="/admin" className="text-white hover:text-green-200">Admin</Link>
                  )}
                  {hasRole('territory_manager') && (
                    <Link to="/territory-management" className="text-white hover:text-green-200">Manage Region</Link>
                  )}
                  {hasRole('tour_guide') && (
                    <Link to="/guide-dashboard" className="text-white hover:text-green-200">Guide Dashboard</Link>
                  )}
                  {hasRole('hotel_operator') && (
                    <Link to="/hotel-operator-dashboard" className="text-white hover:text-green-200">Hotel Dashboard</Link>
                  )}
                  {hasRole('tourist') && (
                    <Link to="/bookings" className="text-white hover:text-green-200">My Bookings</Link>
                  )}
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-white hover:text-green-200"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-white hover:text-green-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-white hover:text-green-200">Login</Link>
                  <Link to="/register" className="text-white hover:text-green-200">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      <footer className="bg-green-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <ToadLogo />
              <span className="text-lg font-bold">Lazy Toad</span>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-6 text-center md:text-left">
              <Link to="/about" className="hover:text-green-200 mb-2 md:mb-0">About Us</Link>
              <Link to="/contact" className="hover:text-green-200 mb-2 md:mb-0">Contact</Link>
              <Link to="/privacy" className="hover:text-green-200 mb-2 md:mb-0">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-green-200">Terms of Service</Link>
            </div>
          </div>
          <div className="mt-6 text-center text-green-200">
            <p>&copy; {new Date().getFullYear()} Lazy Toad. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;