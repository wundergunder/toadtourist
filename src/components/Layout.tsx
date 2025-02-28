import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Frown as Frog, LogOut, Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      <header className="bg-green-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Frog className="h-8 w-8" />
            <span className="text-xl font-bold">ToadTourism</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-green-200">Home</Link>
            <Link to="/territories" className="hover:text-green-200">Territories</Link>
            <Link to="/experiences" className="hover:text-green-200">Experiences</Link>
            
            {user ? (
              <>
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="hover:text-green-200">Admin</Link>
                )}
                {profile?.role === 'territory_manager' && (
                  <Link to="/territory-management" className="hover:text-green-200">Manage Territory</Link>
                )}
                {profile?.role === 'tour_guide' && (
                  <Link to="/guide-dashboard" className="hover:text-green-200">Guide Dashboard</Link>
                )}
                <Link to="/bookings" className="hover:text-green-200">My Bookings</Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 hover:text-green-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
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
              <Link to="/territories" className="text-white hover:text-green-200">Territories</Link>
              <Link to="/experiences" className="text-white hover:text-green-200">Experiences</Link>
              
              {user ? (
                <>
                  {profile?.role === 'admin' && (
                    <Link to="/admin" className="text-white hover:text-green-200">Admin</Link>
                  )}
                  {profile?.role === 'territory_manager' && (
                    <Link to="/territory-management" className="text-white hover:text-green-200">Manage Territory</Link>
                  )}
                  {profile?.role === 'tour_guide' && (
                    <Link to="/guide-dashboard" className="text-white hover:text-green-200">Guide Dashboard</Link>
                  )}
                  <Link to="/bookings" className="text-white hover:text-green-200">My Bookings</Link>
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
              <Frog className="h-6 w-6" />
              <span className="text-lg font-bold">ToadTourism</span>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-6 text-center md:text-left">
              <Link to="/about" className="hover:text-green-200 mb-2 md:mb-0">About Us</Link>
              <Link to="/contact" className="hover:text-green-200 mb-2 md:mb-0">Contact</Link>
              <Link to="/privacy" className="hover:text-green-200 mb-2 md:mb-0">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-green-200">Terms of Service</Link>
            </div>
          </div>
          <div className="mt-6 text-center text-green-200">
            <p>&copy; {new Date().getFullYear()} ToadTourism. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;