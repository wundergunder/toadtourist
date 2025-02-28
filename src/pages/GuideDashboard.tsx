import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  Calendar, Users, DollarSign, Clock, Plus, AlertCircle, Check, X, Image 
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
  territories: {
    name: string;
  };
}

interface Booking {
  id: string;
  booking_date: string;
  num_people: number;
  total_price: number;
  payment_status: 'pending' | 'completed';
  profiles: {
    full_name: string;
  };
  experiences: {
    title: string;
  };
}

interface Territory {
  id: string;
  name: string;
}

const GuideDashboard: React.FC = () => {
  const { user, profile } = useAuthStore();
  
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddExperienceForm, setShowAddExperienceForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  const [newExperience, setNewExperience] = useState({
    title: '',
    description: '',
    price: 0,
    duration: 1,
    maxSpots: 10,
    territoryId: '',
    imageUrls: ['']
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Fetch experiences created by this guide
        const { data: experiencesData, error: experiencesError } = await supabase
          .from('experiences')
          .select(`
            id,
            title,
            description,
            price,
            duration,
            max_spots,
            available_spots,
            image_urls,
            territory_id,
            territories (
              name
            )
          `)
          .eq('guide_id', user.id);
        
        if (experiencesError) throw experiencesError;
        setExperiences(experiencesData || []);
        
        // Fetch bookings for experiences by this guide
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_date,
            num_people,
            total_price,
            payment_status,
            profiles:tourist_id (
              full_name
            ),
            experiences (
              title
            )
          `)
          .in('experience_id', experiencesData?.map(exp => exp.id) || [])
          .order('booking_date', { ascending: false });
        
        if (bookingsError) throw bookingsError;
        setBookings(bookingsData || []);
        
        // Fetch territories
        const { data: territoriesData, error: territoriesError } = await supabase
          .from('territories')
          .select('id, name');
        
        if (territoriesError) throw territoriesError;
        setTerritories(territoriesData || []);
      } catch (error) {
        console.error('Error fetching guide data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && profile?.role === 'tour_guide') {
      fetchData();
    }
  }, [user, profile]);

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    const { title, description, price, duration, maxSpots, territoryId, imageUrls } = newExperience;
    
    if (!title || !description || price <= 0 || duration <= 0 || maxSpots <= 0 || !territoryId || !imageUrls[0]) {
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
          territory_id: territoryId,
          guide_id: user?.id
        })
        .select(`
          id,
          title,
          description,
          price,
          duration,
          max_spots,
          available_spots,
          image_urls,
          territory_id,
          territories (
            name
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
        territoryId: '',
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

  // If not tour guide, redirect to home
  if (user && profile && profile.role !== 'tour_guide') {
    return <Navigate to="/" />;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Placeholder data if none in database
  const placeholderExperiences = [
    {
      id: 'jungle-kayaking',
      title: 'Jungle Kayaking Adventure',
      description: 'Paddle through the lush mangroves and spot wildlife on this guided kayaking tour.',
      price: 45,
      duration: 3,
      max_spots: 12,
      available_spots: 8,
      image_urls: ['https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
      territory_id: 'rio-dulce',
      territories: {
        name: 'Rio Dulce'
      }
    }
  ];

  const placeholderBookings = [
    {
      id: 'booking-1',
      booking_date: '2023-07-15',
      num_people: 2,
      total_price: 90,
      payment_status: 'completed' as const,
      profiles: {
        full_name: 'Sarah Johnson'
      },
      experiences: {
        title: 'Jungle Kayaking Adventure'
      }
    },
    {
      id: 'booking-2',
      booking_date: '2023-08-05',
      num_people: 1,
      total_price: 45,
      payment_status: 'pending' as const,
      profiles: {
        full_name: 'Michael Chen'
      },
      experiences: {
        title: 'Jungle Kayaking Adventure'
      }
    }
  ];

  const placeholderTerritories = [
    {
      id: 'rio-dulce',
      name: 'Rio Dulce'
    }
  ];

  const displayExperiences = experiences.length > 0 ? experiences : placeholderExperiences;
  const displayBookings = bookings.length > 0 ? bookings : placeholderBookings;
  const displayTerritories = territories.length > 0 ? territories : placeholderTerritories;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Guide Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Experiences Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-green-600 mr-2" />
                    <h2 className="text-xl font-bold">My Experiences</h2>
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
              
              <div className="p-6">
                {displayExperiences.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">You haven't created any experiences yet.</p>
                ) : (
                  <div className="space-y-6">
                    {displayExperiences.map((experience) => (
                      <div key={experience.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4 mb-4 md:mb-0 md:mr-4">
                            <img 
                              src={experience.image_urls[0]} 
                              alt={experience.title} 
                              className="h-32 w-full object-cover rounded-md"
                            />
                          </div>
                          <div className="md:w-3/4">
                            <h3 className="font-bold text-lg mb-2">{experience.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{experience.description}</p>
                            <div className="flex flex-wrap gap-4">
                              <div className="flex items-center text-gray-600 text-sm">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span>${experience.price}</span>
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{experience.duration} hours</span>
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{experience.available_spots} / {experience.max_spots} spots</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Bookings Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-xl font-bold">Upcoming Bookings</h2>
                </div>
              </div>
              
              <div className="p-6">
                {displayBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No bookings yet.</p>
                ) : (
                  <div className="space-y-4">
                    {displayBookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold">{booking.experiences.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.payment_status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.payment_status === 'completed' ? 'Paid' : 'Payment pending'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          <span className="font-medium">Guest:</span> {booking.profiles.full_name}
                        </p>
                        <p className="text-gray-600 text-sm mb-2">
                          <span className="font-medium">Date:</span> {formatDate(booking.booking_date)}
                        </p>
                        <div className="flex justify-between text-sm">
                          <p className="text-gray-600">
                            <span className="font-medium">People:</span> {booking.num_people}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Total:</span> ${booking.total_price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
                    <input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newExperience.price}
                      onChange={(e) => setNewExperience({...newExperience, price: parseFloat(e.target.value)})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (hours) *
                    </label>
                    <input
                      id="duration"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={newExperience.duration}
                      onChange={(e) => setNewExperience({...newExperience, duration: parseFloat(e.target.value)})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="maxSpots" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Spots *
                    </label>
                    <input
                      id="maxSpots"
                      type="number"
                      min="1"
                      value={newExperience.maxSpots}
                      onChange={(e) => setNewExperience({...newExperience, maxSpots: parseInt(e.target.value)})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="territoryId" className="block text-sm font-medium text-gray-700 mb-1">
                    Territory *
                  </label>
                  <select
                    id="territoryId"
                    value={newExperience.territoryId}
                    onChange={(e) => setNewExperience({...newExperience, territoryId: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">-- Select Territory --</option>
                    {displayTerritories.map((territory) => (
                      <option key={territory.id} value={territory.id}>
                        {territory.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URLs *
                  </label>
                  {newExperience.imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <div className="flex-grow mr-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => handleImageUrlChange(index, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
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
    </div>
  );
};

export default GuideDashboard;