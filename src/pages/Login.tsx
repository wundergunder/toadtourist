import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const ToadLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect y="33" width="48" height="9" rx="3" fill="#8B4513" />
    <ellipse cx="24" cy="21" rx="15" ry="12" fill="#4CAF50" />
    <ellipse cx="24" cy="24" rx="12" ry="9" fill="#388E3C" />
    <circle cx="18" cy="18" r="3" fill="white" />
    <circle cx="18" cy="18" r="1.5" fill="black" />
    <circle cx="30" cy="18" r="3" fill="white" />
    <circle cx="30" cy="18" r="1.5" fill="black" />
    <path d="M21 27C23 29 25 29 27 27" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { signIn, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for redirect after login
  useEffect(() => {
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      // Clear it immediately to prevent unwanted redirects
      localStorage.removeItem('redirectAfterLogin');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await signIn(email, password);
      // Only navigate if there's no error
      if (!error) {
        // Check if there's a redirect path stored
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  // For demo purposes, add some sample credentials
  const fillDemoCredentials = () => {
    setEmail('admin@example.com');
    setPassword('password123');
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-8">
        <div className="flex justify-center mb-6">
          <ToadLogo />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Log in to Lazy Toad</h2>
        
        {(error || formError) && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{formError || error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-sm text-green-600 hover:text-green-500"
            >
              Use demo credentials
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;