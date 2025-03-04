import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  MapPin, DollarSign, Clock, Users, AlertCircle, Check, X, Plus, Save, Image, Upload 
} from 'lucide-react';
import MultiImageUploader from '../components/MultiImageUploader';
import MultiMediaUploader from '../components/MultiMediaUploader';

interface Experience {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  max_spots: number;
  available_spots: number;
  image_urls: string[];
  video_urls?: string[];
  territory_id: string;
  guide_id: string;
}

interface Guide {
  id: string;
  full_name: string;
  roles: string[];
}

interface Media {
  url: string;
  type: 'image' | 'video';
}

const EditExperience: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, hasRole } = useAuthStore();
  
  const [experience, setExperience] = useState<Experience>({
    id: '',
    title: '',
    description: '',
    price: 0,
    duration: 0,
    max_spots: 0,
    available_spots: 0,
    image_urls: [''],
    video_urls: [],
    territory_id: '',
    guide_id: ''
  });
  
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [media, setMedia] = useState<Media[]>([{ url: '', type: 'image' }]);

  useEffect(() => {
    const fetchExperienceAndGuides = async () => {
      if (!id || !profile?.territory_id) return;

      try {
        setIsLoading(true);
        
        // Fetch experience
        const { data: experienceData, error: experienceError } = await supabase
          .from('experiences')
          .select('*')
          .eq('id', id)
          .eq('territory_id', profile.territory_id)
          .single();
        
        if (experienceError) throw experienceError;
        
        if (!experienceData) {
          throw new Error('Experience not found or you do not have permission to edit it');
        }
        
        setExperience(experienceData);
        
        // Convert image_urls and video_urls to media array
        const mediaItems: Media[] = [];
        
        // Add images
        if (experienceData.image_urls && experienceData.image_urls.length > 0) {
          experienceData.image_urls.forEach(url => {
            mediaItems.push({ url, type: 'image' });
          });
        }
        
        // Add videos if they exist
        if (experienceData.video_urls && experienceData.video_urls.length > 0) {
          experienceData.video_urls.forEach(url => {
            mediaItems.push({ url, type: 'video' });
          });
        }
        
        // If no media, add an empty image item
        if (mediaItems.length === 0) {
          mediaItems.push({ url: '', type: 'image' });
        }
        
        setMedia(mediaItems);
        
        // Fetch guides for this territory
        const { data: guidesData, error: guidesError } = await supabase
          .from('profiles')
          .select('id, full_name, roles')
          .eq('territory_id', profile.territory_id)
          .contains('roles', ['tour_guide']);
        
        if (guidesError) throw guidesError;
        setGuides(guidesData || []);
      } catch (error) {
        console.error('Error fetching experience details:', error);
        setError('Failed to load experience details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && hasRole('territory_manager')) {
      fetchExperienceAndGuides();
    }
  }, [id, user, profile, hasRole]);

  const handleMediaChange = (updatedMedia: Media[]) => {
    setMedia(updatedMedia);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Extract image and video URLs from media
      const imageUrls = media
        .filter(item => item.type === 'image' && item.url.trim() !== '')
        .map(item => item.url);
      
      const videoUrls = media
        .filter(item => item.type === 'video' && item.url.trim() !== '')
        .map(item => item.url);
      
      // Validate inputs
      if (!experience.title || !experience.description || experience.price <= 0 || 
          experience.duration <= 0 || experience.max_spots <= 0 || 
          experience.available_spots < 0 || !experience.guide_id || 
          imageUrls.length === 0) {
        setError('Please fill in all required fields with valid values. At least one image is required.');
        return;
      }
      
      if (experience.available_spots > experience.max_spots) {
        setError('Available spots cannot exceed maximum spots');
        return;
      }
      
      // Update experience
      const { error } = await supabase
        .from('experiences')
        .update({
          title: experience.title,
          description: experience.description,
          price: experience.price,
          duration: experience.duration,
          max_spots: experience.max_spots,
          available_spots: experience.available_spots,
          image_urls: imageUrls,
          video_urls: videoUrls,
          guide_id: experience.guide_id
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setSuccessMessage('Experience updated successfully');
      setTimeout(() => {
        navigate('/territory-management');
      }, 2000);
    } catch (error) {
      console.error('Error updating experience:', error);
      setError('Failed to update experience. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/territory-management" className="text-green-600 hover:text-green-700 mr-4">
          ← Back to Region Management
        </Link>
        <h1 className="text-3xl font-bold">Edit Experience</h1>
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
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Experience Title *
            </label>
            <input
              id="title"
              type="text"
              value={experience.title}
              onChange={(e) => setExperience({...experience, title: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              rows={6}
              value={experience.description}
              onChange={(e) => setExperience({...experience, description: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={experience.price}
                  onChange={(e) => setExperience({...experience, price: parseFloat(e.target.value) || 0})}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (hours) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="duration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={experience.duration}
                  onChange={(e) => setExperience({...experience, duration: parseFloat(e.target.value) || 0})}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="maxSpots" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Spots *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="maxSpots"
                  type="number"
                  min="1"
                  value={experience.max_spots}
                  onChange={(e) => setExperience({...experience, max_spots: parseInt(e.target.value) || 0})}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="availableSpots" className="block text-sm font-medium text-gray-700 mb-1">
                Available Spots *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="availableSpots"
                  type="number"
                  min="0"
                  max={experience.max_spots}
                  value={experience.available_spots}
                  onChange={(e) => setExperience({...experience, available_spots: parseInt(e.target.value) || 0})}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="guideId" className="block text-sm font-medium text-gray-700 mb-1">
              Assign Guide *
            </label>
            <select
              id="guideId"
              value={experience.guide_id}
              onChange={(e) => setExperience({...experience, guide_id: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            >
              <option value="">-- Select Guide --</option>
              {guides.map((guide) => (
                <option key={guide.id} value={guide.id}>
                  {guide.full_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Media (Images & Videos) *
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Add images and videos for this experience. At least one image is required.
            </p>
            <MultiMediaUploader 
              media={media}
              onMediaChange={handleMediaChange}
              onError={setError}
              folderName="experience-media"
              maxSizeMB={50}
            />
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
      )}
    </div>
  );
};

export default EditExperience;