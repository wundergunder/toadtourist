import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { 
  User, Mail, Edit, Save, AlertCircle, Check, Upload, X
} from 'lucide-react';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, updateAvatar } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  if (!user || !profile) {
    navigate('/login');
    return null;
  }

  const handleSaveProfile = async () => {
    try {
      setError(null);
      
      if (!fullName.trim()) {
        setError('Name cannot be empty');
        return;
      }
      
      await updateProfile({
        full_name: fullName,
        bio: bio
      });
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          }
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await updateAvatar(publicUrl);
      
      setSuccessMessage('Avatar updated successfully');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
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
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="relative">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name} 
                  className="h-32 w-32 rounded-full object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-4xl font-bold">
                  {profile.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
              )}
              
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full cursor-pointer"
              >
                {isUploading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                ) : (
                  <Edit className="h-5 w-5" />
                )}
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-green-600 hover:text-green-700"
                >
                  {isEditing ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Edit className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <Mail className="h-4 w-4 mr-2" />
                <span>{profile.email}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Role:</span> {profile.role.replace('_', ' ')}
              </div>
            </div>
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-2">About Me</h3>
              <p className="text-gray-600">
                {profile.bio || 'No bio provided yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {profile.role === 'tourist' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6 p-6">
          <h2 className="text-xl font-bold mb-4">My Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-1">Bookings</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-1">Reviews</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-1">Regions Visited</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
          </div>
        </div>
      )}
      
      {profile.role === 'tour_guide' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6 p-6">
          <h2 className="text-xl font-bold mb-4">Guide Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-1">Experiences</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-1">Bookings</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-1">Avg. Rating</h3>
              <p className="text-3xl font-bold text-green-600">-</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;