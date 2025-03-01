import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  MapPin, DollarSign, Clock, Users, AlertCircle, Check, X, Plus, Save, Image 
} from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  max_spots: number;
  available_spots: number;
  image_urls: string[];
  territory_id: string;
  guide_id: string;
}

interface Guide {
  id: string;
  full_name: string;
}

const EditExperience: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  
  const [experience, setExperience] = useState<Experience>({
    id: '',
    title: '',
    description: '',
    price: 0,
    duration: 0,
    max_spots: 0,
    available_spots: 0,
    image_urls: [''],
    territory_id: '',
    guide_id: ''
  });
  
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        
        // Fetch guides for this territory
        const { data: guidesData, error: guidesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'tour_guide')
          .eq('territory_id', profile.territory_id);
        
        if (guidesError) throw guidesError;
        setGuides(guidesData || []);
      } catch (error) {
        console.error('Error fetching experience details:', error);
        setError('Failed to load experience details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && profile?.role === 'territory_manager') {
      fetchExperienceAndGuides();
    }
  }, [id, user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Validate inputs
      if (!experience.title || !experience.description || experience.price <= 0 || 
          experience.duration <= 0 || experience.max_spots <= 0 || 
          experience.available_spots < 0 || !experience.guide_id || 
          experience.image_urls.length === 0 || !experience.image_urls[0]) {
        setError('Please fill in all required fields with valid values');
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
          image_urls: experience.image_urls.filter(url => url.trim() !== ''),
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

  const handleAddImageUrl = () => {
    setExperience({
      ...experience,
      image_urls: [...experience.image_urls, '']
    });
  };

  const handleRemoveImageUrl = (index: number) => {
    const updatedUrls = [...experience.image_urls];
    updatedUrls.splice(index, 1);
    setExperience({
      ...experience,
      image_urls: updatedUrls
    });
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const updatedUrls = [...experience.image_urls];
    updatedUrls[index] = value;
    setExperience({
      ...experience,
      image_urls: updatedUrls
    });
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
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit}>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                    onChange={(e) => setExperience({...experience, price: parseFloat(e.target.value)})}
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
                    onChange={(e) => setExperience({...experience, duration: parseFloat(e.target.value)})}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="maxSpots" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Spots *
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
                    onChange={(e) => setExperience({...experience, max_spots: parseInt(e.target.value)})}
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
                    onChange={(e) => setExperience({...experience, available_spots: parseInt(e.target.value)})}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Cannot exceed maximum capacity
                </p>
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URLs *
              </label>
              {experience.image_urls.map((url, index) => (
                <div key={index} className="flex items-center mb-2">
                  <div className="flex-grow mr-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Image className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required={index === 0}
                    />
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="mt-2 inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Another Image
              </button>
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

export default EditExperience;