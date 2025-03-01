import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  MapPin, DollarSign, Clock, Users, AlertCircle, Check, X, Plus, Save, Image, Upload 
} from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

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

  // Image upload state
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

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

  const handleUploadImage = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageUploader(true);
  };

  const handleImageUploaded = (url: string) => {
    if (currentImageIndex !== null) {
      const updatedUrls = [...experience.image_urls];
      updatedUrls[currentImageIndex] = url;
      setExperience({
        ...experience,
        image_urls: updatedUrls
      });
      setShowImageUploader(false);
      setCurrentImageIndex(null);
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
    </div>
  );
};

export default EditExperience;