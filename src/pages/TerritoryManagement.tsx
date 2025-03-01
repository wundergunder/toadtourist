import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  Users, Map, User, AlertCircle, Check, X, Plus, Trash2, Calendar 
} from 'lucide-react';

interface TourGuide {
  id: string;
  email: string;
  full_name: string;
}

interface Experience {
  id: string;
  title: string;
  price: number;
  max_spots: number;
  available_spots: number;
  guide_id: string;
  profiles: {
    full_name: string;
  };
}

interface Territory {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

const TerritoryManagement: React.FC = () => {
  const { user, profile } = useAuthStore();
  
  const [tourGuides, setTourGuides] = useState<TourGuide[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddGuideForm, setShowAddGuideForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  const [newGuide, setNewGuide] = useState({
    email: '',
    fullName: '',
    password: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.territory_id) return;

      try {
        setIsLoading(true);
        
        // Fetch territory
        const { data: territoryData, error: territoryError } = await supabase
          .from('territories')
          .select('*')
          .eq('id', profile.territory_id)
          .single();
        
        if (territoryError) throw territoryError;
        setTerritory(territoryData);
        
        // Fetch tour guides
        const { data: guidesData, error: guidesError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('role', 'tour_guide')
          .eq('territory_id', profile.territory_id);
        
        if (guidesError) throw guidesError;
        setTourGuides(guidesData || []);
        
        // Fetch experiences
        const { data: experiencesData, error: experiencesError } = await supabase
          .from('experiences')
          .select(`
            id,
            title,
            price,
            max_spots,
            available_spots,
            guide_id,
            profiles:guide_id (
              full_name
            )
          `)
          .eq('territory_id', profile.territory_id);
        
        if (experiencesError) throw experiencesError;
        setExperiences(experiencesData || []);
      } catch (error) {
        console.error('Error fetching region management data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && profile?.role === 'territory_manager') {
      fetchData();
    }
  }, [user, profile]);

  const handleAddGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    if (!profile?.territory_id) {
      setFormError('You are not assigned to a region');
      return;
    }
    
    const { email, fullName, password } = newGuide;
    
    if (!email || !fullName || !password) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            full_name: fullName,
            role: 'tour_guide',
            territory_id: profile.territory_id
          });
        
        if (profileError) throw profileError;
        
        // Add to local state
        setTourGuides([
          ...tourGuides,
          {
            id: authData.user.id,
            email,
            full_name: fullName
          }
        ]);
        
        setFormSuccess('Tour guide added successfully');
        setNewGuide({
          email: '',
          fullName: '',
          password: ''
        });
        setTimeout(() => {
          setShowAddGuideForm(false);
          setFormSuccess(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding tour guide:', error);
      setFormError('Failed to add tour guide. Please try again.');
    }
  };

  const handleRemoveGuide = async (guideId: string) => {
    if (!confirm('Are you sure you want to remove this tour guide?')) {
      return;
    }
    
    try {
      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', guideId);
      
      if (profileError) throw profileError;
      
      // Update local state
      setTourGuides(tourGuides.filter(guide => guide.id !== guideId));
    } catch (error) {
      console.error('Error removing tour guide:', error);
      setError('Failed to remove tour guide. Please try again.');
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

  // Placeholder data if none in database
  const placeholderTerritory = {
    id: 'rio-dulce',
    name: 'Rio Dulce',
    description: 'A lush river valley in eastern Guatemala, known for its stunning natural beauty, wildlife, and the blend of Mayan and Caribbean cultures.',
    image_url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
  };

  const placeholderGuides = [
    {
      id: 'guide-1',
      email: 'carlos@example.com',
      full_name: 'Carlos Mendez'
    },
    {
      id: 'guide-2',
      email: 'elena@example.com',
      full_name: 'Elena Fuentes'
    }
  ];

  const placeholderExperiences = [
    {
      id: 'jungle-kayaking',
      title: 'Jungle Kayaking Adventure',
      price: 45,
      max_spots: 12,
      available_spots: 8,
      guide_id: 'guide-1',
      profiles: {
        full_name: 'Carlos Mendez'
      }
    },
    {
      id: 'mayan-cooking',
      title: 'Mayan Cooking Class',
      price: 35,
      max_spots: 8,
      available_spots: 4,
      guide_id: 'guide-2',
      profiles: {
        full_name: 'Elena Fuentes'
      }
    }
  ];

  const displayTerritory = territory || placeholderTerritory;
  const displayGuides = tourGuides.length > 0 ? tourGuides : placeholderGuides;
  const displayExperiences = experiences.length > 0 ? experiences : placeholderExperiences;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Region Management</h1>
      <h2 className="text-xl text-gray-600 mb-6">{displayTerritory.name}</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tour Guides Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-xl font-bold">Tour Guides</h2>
                </div>
                <button
                  onClick={() => setShowAddGuideForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Guide
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayGuides.map((guide) => (
                    <tr key={guide.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{guide.full_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{guide.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveGuide(guide.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Experiences Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-xl font-bold">Experiences</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guide
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayExperiences.map((experience) => (
                    <tr key={experience.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{experience.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{experience.profiles.full_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">${experience.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">
                          {experience.available_spots} / {experience.max_spots} spots
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Tour Guide Modal */}
      {showAddGuideForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Tour Guide</h2>
            
            {formSuccess ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 flex items-start">
                <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{formSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleAddGuide}>
                {formError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{formError}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={newGuide.fullName}
                    onChange={(e) => setNewGuide({...newGuide, fullName: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={newGuide.email}
                    onChange={(e) => setNewGuide({...newGuide, email: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={newGuide.password}
                    onChange={(e) => setNewGuide({...newGuide, password: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddGuideForm(false)}
                    className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Add Guide
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TerritoryManagement;