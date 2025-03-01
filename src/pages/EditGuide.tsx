import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  User, Mail, AlertCircle, Check, Save, Lock
} from 'lucide-react';

interface Guide {
  id: string;
  email: string;
  full_name: string;
}

const EditGuide: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  
  const [guide, setGuide] = useState<Guide>({
    id: '',
    email: '',
    full_name: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchGuide = async () => {
      if (!id || !profile?.territory_id) return;

      try {
        setIsLoading(true);
        
        // Check if the ID is a valid UUID
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        if (!isValidUUID) {
          // For demo purposes, use placeholder data for non-UUID IDs
          if (id === 'guide-1') {
            setGuide({
              id: 'guide-1',
              email: 'carlos@example.com',
              full_name: 'Carlos Mendez'
            });
            setIsLoading(false);
            return;
          } else if (id === 'guide-2') {
            setGuide({
              id: 'guide-2',
              email: 'elena@example.com',
              full_name: 'Elena Fuentes'
            });
            setIsLoading(false);
            return;
          } else {
            throw new Error('Invalid guide ID format');
          }
        }
        
        // Fetch guide from database for valid UUIDs
        const { data: guideData, error: guideError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('id', id)
          .eq('role', 'tour_guide')
          .eq('territory_id', profile.territory_id)
          .single();
        
        if (guideError) {
          console.error("Error fetching guide details:", guideError);
          throw guideError;
        }
        
        if (!guideData) {
          throw new Error('Guide not found or you do not have permission to edit it');
        }
        
        setGuide(guideData);
      } catch (error) {
        console.error('Error fetching guide details:', error);
        setError('Failed to load guide details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && profile?.role === 'territory_manager') {
      fetchGuide();
    }
  }, [id, user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Validate inputs
      if (!guide.full_name || !guide.email) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Check if we're dealing with a placeholder guide
      const isPlaceholder = guide.id === 'guide-1' || guide.id === 'guide-2';
      
      if (!isPlaceholder) {
        // Update guide profile in the database
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: guide.full_name,
            email: guide.email
          })
          .eq('id', id);
        
        if (updateError) throw updateError;
      }
      
      // If password reset is requested
      if (resetPassword && newPassword) {
        if (newPassword.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }
        
        // Admin reset password functionality is not directly available in Supabase JS client
        // In a real application, you would use Supabase Admin API or a server-side function
        // For this demo, we'll just show a success message
        console.log('Password reset would be handled here in a real application');
      }
      
      setSuccessMessage('Guide updated successfully');
      setTimeout(() => {
        navigate('/territory-management');
      }, 2000);
    } catch (error) {
      console.error('Error updating guide:', error);
      setError('Failed to update guide. Please try again.');
    }
  };

  // If not territory manager, redirect to home
  if (user && profile && profile.role !== 'territory_manager') {
    return <Navigate to="/" />;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/territory-management" className="text-green-600 hover:text-green-700 mr-4">
          ← Back to Region Management
        </Link>
        <h1 className="text-3xl font-bold">Edit Tour Guide</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-start">
          <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={guide.full_name}
                  onChange={(e) => setGuide({...guide, full_name: e.target.value})}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={guide.email}
                  onChange={(e) => setGuide({...guide, email: e.target.value})}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                <input
                  id="resetPassword"
                  type="checkbox"
                  checked={resetPassword}
                  onChange={(e) => setResetPassword(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="resetPassword" className="ml-2 block text-sm text-gray-700">
                  Reset Password
                </label>
              </div>
              
              {resetPassword && (
                <div className="mt-3">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required={resetPassword}
                      minLength={6}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <Link
                to="/territory-management"
                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditGuide;