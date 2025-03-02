import React, { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  Users, Map, User, AlertCircle, Check, X, Plus, Trash2, Edit, Save, Image, Upload, Shield 
} from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import { UserRole } from '../types/supabase';

interface TourGuide {
  id: string;
  email: string;
  full_name: string;
  roles: UserRole[];
}

interface Experience {
  id: string;
  title: string;
  price: number;
  duration: number;
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
  const navigate = useNavigate();
  const { user, profile, hasRole, addRole, removeRole } = useAuthStore();
  
  const [tourGuides, setTourGuides] = useState<TourGuide[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [showAddGuideForm, setShowAddGuideForm] = useState(false);
  const [showAddExperienceForm, setShowAddExperienceForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  const [newGuide, setNewGuide] = useState({
    email: '',
    fullName: '',
    password: ''
  });

  const [newExperience, setNewExperience] = useState({
    title: '',
    description: '',
    price: 0,
    duration: 1,
    maxSpots: 10,
    guideId: '',
    imageUrls: ['']
  });

  // Image upload state
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

  // User management
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
  const [editGuide, setEditGuide] = useState<{
    full_name: string;
    roles: UserRole[];
  }>({
    full_name: '',
    roles: ['tourist']
  });

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
        .select('id, email, full_name, roles')
        .contains('roles', ['tour_guide'])
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
          duration,
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

  useEffect(() => {
    if (user && hasRole('territory_manager')) {
      fetchData();
    }
  }, [user]);

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
      // First check if the email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingUser) {
        setFormError('A user with this email already exists. Please use a different email address.');
        return;
      }
      
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            roles: ['tourist', 'tour_guide'],
            territory_id: profile.territory_id
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Wait for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh the guide list
        fetchData();
        
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
      // Remove tour_guide role
      await removeRole('tour_guide', guideId);
      
      // Update territory_id to null
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ territory_id: null })
        .eq('id', guideId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setTourGuides(tourGuides.filter(guide => guide.id !== guideId));
      
      setSuccessMessage('Tour guide removed successfully');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error removing tour guide:', error);
      setError('Failed to remove tour guide. Please try again.');
    }
  };

  const handleEditGuide = (guide: TourGuide) => {
    setEditingGuideId(guide.id);
    setEditGuide({
      full_name: guide.full_name,
      roles: [...guide.roles]
    });
  };

  const handleSaveGuideEdit = async () => {
    if (!editingGuideId) return;
    
    try {
      // Get the original guide data
      const originalGuide = tourGuides.find(g => g.id === editingGuideId);
      if (!originalGuide) {
        throw new Error('Guide not found');
      }
      
      // Update profile info
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editGuide.full_name
        })
        .eq('id', editingGuideId);
      
      if (error) throw error;
      
      // Handle role changes
      const originalRoles = new Set(originalGuide.roles);
      const newRoles = new Set(editGuide.roles);
      
      // Add new roles
      for (const role of newRoles) {
        if (!originalRoles.has(role)) {
          await addRole(role, editingGuideId);
        }
      }
      
      // Remove roles that were removed
      for (const role of originalRoles) {
        if (!newRoles.has(role) && role !== 'tourist') {
          await removeRole(role, editingGuideId);
        }
      }
      
      // Update local state
      setTourGuides(tourGuides.map(guide => 
        guide.id === editingGuideId 
          ? {
              ...guide,
              full_name: editGuide.full_name,
              roles: editGuide.roles
            }
          : guide
      ));
      
      setEditingGuideId(null);
      setSuccessMessage('Guide updated successfully');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating guide:', error);
      setError('Failed to update guide. Please try again.');
    }
  };

  const handleToggleRole = (role: UserRole) => {
    if (role === 'tourist') return; // Can't remove tourist role
    
    const hasRole = editGuide.roles.includes(role);
    
    if (hasRole) {
      // Remove role
      setEditGuide({
        ...editGuide,
        roles: editGuide.roles.filter(r => r !== role)
      });
    } else {
      // Add role
      setEditGuide({
        ...editGuide,
        roles: [...editGuide.roles, role]
      });
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    const { title, description, price, duration, maxSpots, guideId, imageUrls } = newExperience;
    
    if (!title || !description || price <= 0 || duration <= 0 || maxSpots <= 0 || !guideId || !imageUrls[0]) {
      setFormError('Please fill in all required fields with valid values');
      return;
    }
    
    try {
      // Generate ID from title
      const id = title.toLowerCase().replace(/\s+/g, '-');
      
      // Create experience
      const { data, error } = await supabase
        .from('experiences')
        .insert({
          id,
          title,
          description,
          price,
          duration,
          max_spots: maxSpots,
          available_spots: maxSpots,
          image_urls: imageUrls.filter(url => url.trim() !== ''),
          territory_id: profile?.territory_id,
          guide_id: guideId
        })
        .select(`
          id,
          title,
          price,
          duration,
          max_spots,
          available_spots,
          guide_id,
          profiles:guide_id (
            full_name
          )
        `)
        .single();
      
      if (error) throw error;
      
      // Add to local state
      if (data) {
        setExperiences([...experiences, data]);
      }
      
      setFormSuccess('Experience added successfully');
      setNewExperience({
        title: '',
        description: '',
        price: 0,
        duration: 1,
        maxSpots: 10,
        guideId: '',
        imageUrls: ['']
      });
      setTimeout(() => {
        setShowAddExperienceForm(false);
        setFormSuccess(null);
      }, 2000);
    } catch (error) {
      console.error('Error adding experience:', error);
      setFormError('Failed to add experience. Please try again.');
    }
  };

  const handleDeleteExperience = async (experienceId: string) => {
    if (!confirm('Are you sure you want to delete this experience? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', experienceId);
      
      if (error) throw error;
      
      // Update local state
      setExperiences(experiences.filter(exp => exp.id !== experienceId));
      setSuccessMessage('Experience deleted successfully');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting experience:', error);
      setError('Failed to delete experience. Please try again.');
    }
  };

  const handleAddImageUrl = () => {
    setNewExperience({
      ...newExperience,
      imageUrls: [...newExperience.imageUrls, '']
    });
  };

  const handleRemoveImageUrl = (index: number) => {
    const updatedUrls = [...newExperience.imageUrls];
    updatedUrls.splice(index, 1);
    setNewExperience({
      ...newExperience,
      imageUrls: updatedUrls
    });
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const updatedUrls = [...newExperience.imageUrls];
    updatedUrls[index] = value;
    setNewExperience({
      ...newExperience,
      imageUrls: updatedUrls
    });
  };

  const handleUploadImage = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageUploader(true);
  };

  const handleImageUploaded = (url: string) => {
    if (currentImageIndex !== null) {
      const updatedUrls = [...newExperience.imageUrls];
      updatedUrls[currentImageIndex] = url;
      setNewExperience({
        ...newExperience,
        imageUrls: updatedUrls
      });
      setShowImageUploader(false);
      setCurrentImageIndex(null);
    }
  };

  // If not territory manager, redirect to home
  if (user && profile && !hasRole('territory_manager')) {
    return <Navigate to="/" />;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Placeholder data if none in database
  const placeholderTerritories = [
    {
      id: 'rio-dulce',
      name: 'Rio Dulce',
      description: 'A lush river valley in eastern Guatemala, known for its stunning natural beauty, wildlife, and the blend of Mayan and Caribbean cultures.',
      image_url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    }
  ];

  const placeholderGuides = [
    {
      id: 'guide-1',
      email: 'carlos@example.com',
      full_name: 'Carlos Mendez',
      roles: ['tourist', 'tour_guide']
    },
    {
      id: 'guide-2',
      email: 'elena@example.com',
      full_name: 'Elena Fuentes',
      roles: ['tourist', 'tour_guide']
    }
  ];

  const placeholderExperiences = [
    {
      id: 'jungle-kayaking',
      title: 'Jungle Kayaking Adventure',
      description: 'Paddle through the lush mangroves and spot wildlife on this guided kayaking tour.',
      price: 45,
      duration: 3,
      max_spots: 12,
      available_spots: 8,
      territory_id: 'rio-dulce',
      guide_id: 'guide-1',
      profiles: {
        full_name: 'Carlos Mendez'
      }
    },
    {
      id: 'mayan-cooking',
      title: 'Mayan Cooking Class',
      description: 'Learn to prepare traditional Mayan dishes with local ingredients and ancient techniques.',
      price: 35,
      duration: 4,
      max_spots: 8,
      available_spots: 4,
      territory_id: 'rio-dulce',
      guide_id: 'guide-2',
      profiles: {
        full_name: 'Elena Fuentes'
      }
    }
  ];

  const displayTerritory = territory || placeholderTerritories[0];
  const displayGuides = tourGuides.length > 0 ? tourGuides : placeholderGuides;
  const displayExperiences = experiences.length > 0 ? experiences : placeholderExperiences;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Region Management</h1>
      <h2 className="text-xl text-gray-600 mb-6">{displayTerritory.name}</h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
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
                        {editingGuideId === guide.id ? (
                          <input
                            type="text"
                            value={editGuide.full_name}
                            onChange={(e) => setEditGuide({...editGuide, full_name: e.target.value})}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          />
                        ) : (
                          <div className="font-medium text-gray-900">{guide.full_name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{guide.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingGuideId === guide.id ? (
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <input
                                id={"role-tourist-" + guide.id}
                                type="checkbox"
                                checked={true}
                                disabled={true}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <label htmlFor={"role-tourist-" + guide.id} className="ml-2 block text-sm text-gray-700">
                                Tourist
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id={"role-guide-" + guide.id}
                                type="checkbox"
                                checked={editGuide.roles.includes('tour_guide')}
                                onChange={() => handleToggleRole('tour_guide')}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <label htmlFor={"role-guide-" + guide.id} className="ml-2 block text-sm text-gray-700">
                                Tour Guide
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id={"role-hotel-" + guide.id}
                                type="checkbox"
                                checked={editGuide.roles.includes('hotel_operator')}
                                onChange={() => handleToggleRole('hotel_operator')}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <label htmlFor={"role-hotel-" + guide.id} className="ml-2 block text-sm text-gray-700">
                                Hotel Operator
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {guide.roles.map(role => (
                              <span key={role} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {role.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {editingGuideId === guide.id ? (
                            <button
                              onClick={handleSaveGuideEdit}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Save className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditGuide(guide)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveGuide(guide.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
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
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Map className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-xl font-bold">Experiences</h2>
                </div>
                <button
                  onClick={() => setShowAddExperienceForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Experience
                </button>
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
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/territory-management/edit-experience/${experience.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteExperience(experience.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
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
      
      {/* Add Experience Modal */}
      {showAddExperienceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Experience</h2>
            
            {formSuccess ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 flex items-start">
                <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{formSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleAddExperience}>
                {formError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{formError}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={newExperience.title}
                    onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={newExperience.description}
                    onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                        value={newExperience.price || 0}
                        onChange={(e) => setNewExperience({...newExperience, price: parseFloat(e.target.value) || 0})}
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
                        value={newExperience.duration || 1}
                        onChange={(e) => setNewExperience({...newExperience, duration: parseFloat(e.target.value) || 1})}
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
                        value={newExperience.maxSpots || 10}
                        onChange={(e) => setNewExperience({...newExperience, maxSpots: parseInt(e.target.value) || 10})}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="guideId" className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Guide *
                  </label>
                  <select
                    id="guideId"
                    value={newExperience.guideId}
                    onChange={(e) => setNewExperience({...newExperience, guideId: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">-- Select Guide --</option>
                    {displayGuides.map((guide) => (
                      <option key={guide.id} value={guide.id}>
                        {guide.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images *
                  </label>
                  {newExperience.imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <div className="flex-grow mr-2">
                        <div className="flex items-center">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => handleImageUrlChange(index, e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            required={index === 0}
                          />
                          <button
                            type="button"
                            onClick={() => handleUploadImage(index)}
                            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md flex items-center"
                          >
                            <Upload className="h-4 w-4" />
                          </button>
                        </div>
                        {url && (
                          <div className="mt-1 h-16 w-full">
                            <img 
                              src={url} 
                              alt={`Preview ${index + 1}`} 
                              className="h-full object-cover rounded-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image+URL';
                              }}
                            />
                          </div>
                        )}
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
                  <button
                    type="button"
                    onClick={() => setShowAddExperienceForm(false)}
                    className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Create Experience
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      
      {/* Image Upload Modal */}
      {showImageUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Upload Image</h2>
            
            <ImageUploader 
              onImageUploaded={handleImageUploaded}
              onError={(error) => setFormError(error)}
            />
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowImageUploader(false)}
                className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerritoryManagement;