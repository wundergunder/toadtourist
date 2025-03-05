import React, { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  Users, Map, User, AlertCircle, Check, X, Plus, Trash2, Edit, Save, DollarSign, Star, Hotel
} from 'lucide-react';

interface TourGuide {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
}

interface Experience {
  id: string;
  title: string;
  price: number;
  duration: number;
  max_spots: number;
  available_spots: number;
  guide_id: string;
  featured: boolean;
  featured_order: number | null;
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

interface CommissionEarning {
  id: string;
  amount: number;
  status: 'pending' | 'paid';
  created_at: string;
  bookings: {
    experiences: {
      title: string;
    };
    profiles: {
      full_name: string;
    };
  };
}

interface CommissionPayment {
  id: string;
  amount: number;
  payment_method: string;
  payment_reference: string;
  payment_date: string;
}

interface HotelOperator {
  id: string;
  email: string;
  full_name: string;
  hotel_name: string;
  commission_level: number;
  roles: string[];
}

const TerritoryManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  
  const [currentTab, setCurrentTab] = useState<'experiences' | 'guides' | 'finances' | 'hotels'>('experiences');
  const [tourGuides, setTourGuides] = useState<TourGuide[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [earnings, setEarnings] = useState<CommissionEarning[]>([]);
  const [payments, setPayments] = useState<CommissionPayment[]>([]);
  const [hotelOperators, setHotelOperators] = useState<HotelOperator[]>([]);
  const [showAddHotelForm, setShowAddHotelForm] = useState(false);
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  const [newHotel, setNewHotel] = useState({
    hotelName: '',
    fullName: '',
    email: '',
    password: '',
    commissionLevel: 10
  });
  const [editHotel, setEditHotel] = useState({
    hotelName: '',
    fullName: '',
    commissionLevel: 10
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleToggleFeatured = async (experienceId: string, currentFeatured: boolean) => {
    try {
      setError(null);
      
      // If trying to feature and already have 3 featured experiences, show error
      if (!currentFeatured && experiences.filter(e => e.featured).length >= 3) {
        setError('You can only have 3 featured experiences at a time');
        return;
      }

      const { error: updateError } = await supabase
        .from('experiences')
        .update({ 
          featured: !currentFeatured,
          featured_order: !currentFeatured ? experiences.filter(e => e.featured).length + 1 : null
        })
        .eq('id', experienceId);

      if (updateError) throw updateError;

      // Update local state
      setExperiences(experiences.map(exp => 
        exp.id === experienceId 
          ? { 
              ...exp, 
              featured: !currentFeatured,
              featured_order: !currentFeatured ? experiences.filter(e => e.featured).length + 1 : null
            }
          : exp
      ));

      setSuccessMessage(`Experience ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating featured status:', error);
      setError('Failed to update featured status. Please try again.');
    }
  };

  const fetchHotelOperators = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('territory_id', profile?.territory_id)
        .contains('roles', ['hotel_operator']);
      
      if (error) throw error;
      setHotelOperators(data || []);
    } catch (error) {
      console.error('Error fetching hotel operators:', error);
      setError('Failed to load hotel operators');
    }
  };

  const fetchData = async () => {
    if (!profile?.territory_id) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch territory details
      const { data: territoryData, error: territoryError } = await supabase
        .from('territories')
        .select('*')
        .eq('id', profile.territory_id)
        .single();
      
      if (territoryError) throw territoryError;
      setTerritory(territoryData);
      
      // Fetch tour guides for this territory
      const { data: guidesData, error: guidesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, roles')
        .eq('territory_id', profile.territory_id)
        .contains('roles', ['tour_guide']);
      
      if (guidesError) throw guidesError;
      setTourGuides(guidesData || []);
      
      // Fetch experiences for this territory
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
          featured,
          featured_order,
          profiles:guide_id (
            full_name
          )
        `)
        .eq('territory_id', profile.territory_id);
      
      if (experiencesError) throw experiencesError;
      setExperiences(experiencesData || []);

      // Fetch commission earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('commission_earnings')
        .select(`
          id,
          amount,
          status,
          created_at,
          bookings (
            experiences (
              title
            ),
            profiles (
              full_name
            )
          )
        `)
        .eq('role', 'territory_manager')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (earningsError) throw earningsError;
      setEarnings(earningsData || []);

      // Fetch commission payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('commission_payments')
        .select('*')
        .eq('role', 'territory_manager')
        .eq('user_id', user?.id)
        .order('payment_date', { ascending: false });
      
      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

      // Fetch hotel operators
      await fetchHotelOperators();

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    if (!profile?.territory_id) {
      setFormError('You are not assigned to a territory');
      return;
    }
    
    const { hotelName, fullName, email, password, commissionLevel } = newHotel;
    
    if (!hotelName || !fullName || !email || !password) {
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
            hotel_name: hotelName,
            roles: ['tourist', 'hotel_operator'],
            territory_id: profile.territory_id,
            commission_level: commissionLevel
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Wait for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh the hotel operators list
        fetchData();
        
        setFormSuccess('Hotel operator added successfully');
        setNewHotel({
          hotelName: '',
          fullName: '',
          email: '',
          password: '',
          commissionLevel: 10
        });
        setTimeout(() => {
          setShowAddHotelForm(false);
          setFormSuccess(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding hotel operator:', error);
      setFormError('Failed to add hotel operator. Please try again.');
    }
  };

  const handleEditHotel = (hotel: HotelOperator) => {
    setEditingHotelId(hotel.id);
    setEditHotel({
      hotelName: hotel.hotel_name,
      fullName: hotel.full_name,
      commissionLevel: hotel.commission_level
    });
  };

  const handleSaveHotelEdit = async () => {
    if (!editingHotelId) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          hotel_name: editHotel.hotelName,
          full_name: editHotel.fullName,
          commission_level: editHotel.commissionLevel
        })
        .eq('id', editingHotelId);
      
      if (error) throw error;
      
      // Update local state
      setHotelOperators(hotelOperators.map(hotel => 
        hotel.id === editingHotelId 
          ? {
              ...hotel,
              hotel_name: editHotel.hotelName,
              full_name: editHotel.fullName,
              commission_level: editHotel.commissionLevel
            }
          : hotel
      ));
      
      setEditingHotelId(null);
      setSuccessMessage('Hotel operator updated successfully');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating hotel operator:', error);
      setError('Failed to update hotel operator. Please try again.');
    }
  };

  const handleRemoveHotel = async (hotelId: string) => {
    if (!confirm('Are you sure you want to remove this hotel operator? This will revoke their access to the referral system.')) {
      return;
    }
    
    try {
      // Remove hotel_operator role and territory_id
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          roles: ['tourist'],
          territory_id: null,
          commission_level: null
        })
        .eq('id', hotelId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setHotelOperators(hotelOperators.filter(hotel => hotel.id !== hotelId));
      
      setSuccessMessage('Hotel operator removed successfully');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error removing hotel operator:', error);
      setError('Failed to remove hotel operator. Please try again.');
    }
  };

  useEffect(() => {
    if (user && profile?.territory_id) {
      fetchData();
    }
  }, [user, profile]);

  // Calculate earnings totals
  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
  const pendingEarnings = earnings
    .filter(earning => earning.status === 'pending')
    .reduce((sum, earning) => sum + earning.amount, 0);
  const paidEarnings = earnings
    .filter(earning => earning.status === 'paid')
    .reduce((sum, earning) => sum + earning.amount, 0);

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // If not territory manager, redirect to home
  if (user && profile && !profile.roles.includes('territory_manager')) {
    return <Navigate to="/" />;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Region Management</h1>
      <h2 className="text-xl text-gray-600 mb-6">{territory?.name}</h2>
      
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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setCurrentTab('experiences')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${currentTab === 'experiences'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <Map className="h-5 w-5 inline-block mr-2" />
            Experiences
          </button>
          <button
            onClick={() => setCurrentTab('guides')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${currentTab === 'guides'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <Users className="h-5 w-5 inline-block mr-2" />
            Tour Guides
          </button>
          <button
            onClick={() => setCurrentTab('finances')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${currentTab === 'finances'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <DollarSign className="h-5 w-5 inline-block mr-2" />
            Finances
          </button>
          <button
            onClick={() => setCurrentTab('hotels')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${currentTab === 'hotels'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <Hotel className="h-5 w-5 inline-block mr-2" />
            Hotel Partners
          </button>
        </nav>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <>
          {/* Experiences Tab */}
          {currentTab === 'experiences' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Map className="h-6 w-6 text-green-600 mr-2" />
                    <h2 className="text-xl font-bold">Experiences</h2>
                  </div>
                  <Link
                    to="/territory-management/edit-experience/new"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Experience
                  </Link>
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
                        Duration
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
                    {experiences.map((experience) => (
                      <tr key={experience.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {experience.title}
                            {experience.featured && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Featured {experience.featured_order}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500">{experience.profiles.full_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">${experience.price}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500">{experience.duration} hours</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500">
                            {experience.available_spots} / {experience.max_spots} spots
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleToggleFeatured(experience.id, experience.featured)}
                              className={`${
                                experience.featured 
                                  ? 'text-yellow-600 hover:text-yellow-700' 
                                  : 'text-gray-400 hover:text-gray-500'
                              }`}
                              title={experience.featured ? 'Remove from featured' : 'Add to featured'}
                            >
                              <Star className={`h-5 w-5 ${experience.featured ? 'fill-current' : ''}`} />
                            </button>
                            <Link
                              to={`/territory-management/edit-experience/${experience.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tour Guides Tab */}
          {currentTab === 'guides' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-green-600 mr-2" />
                    <h2 className="text-xl font-bold">Tour Guides</h2>
                  </div>
                  <Link
                    to="/territory-management/edit-guide/new"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Guide
                  </Link>
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
                    {tourGuides.map((guide) => (
                      <tr key={guide.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{guide.full_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500">{guide.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/territory-management/edit-guide/${guide.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Finances Tab */}
          {currentTab === 'finances' && (
            <div className="space-y-6">
              {/* Earnings Summary */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Commission Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-1">Total Earnings</h3>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-1">Pending</h3>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(pendingEarnings)}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-1">Paid</h3>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(paidEarnings)}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <p>You earn 10% commission on all bookings for experiences in your region.</p>
                </div>
              </div>

              {/* Earnings Table */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                    <h2 className="text-xl font-bold">Earnings History</h2>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Experience
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tourist
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {earnings.map((earning) => (
                        <tr key={earning.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(earning.created_at)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {earning.bookings.experiences.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {earning.bookings.profiles.full_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(earning.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              earning.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text -yellow-800'
                            }`}>
                              {earning.status === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments Table */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                    <h2 className="text-xl font-bold">Payment History</h2>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Method
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(payment.payment_date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{payment.payment_method}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{payment.payment_reference}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Hotels Tab */}
          {currentTab === 'hotels' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Hotel className="h-6 w-6 text-green-600 mr-2" />
                    <h2 className="text-xl font-bold">Hotel Partners</h2>
                  </div>
                  <button
                    onClick={() => setShowAddHotelForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Hotel
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hotel
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commission
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {hotelOperators.map((hotel) => (
                      <tr key={hotel.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingHotelId === hotel.id ? (
                            <input
                              type="text"
                              value={editHotel.hotelName}
                              onChange={(e) => setEditHotel({...editHotel, hotelName: e.target.value})}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                          ) : (
                            <div className="font-medium text-gray-900">{hotel.hotel_name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingHotelId === hotel.id ? (
                            <input
                              type="text"
                              value={editHotel.fullName}
                              onChange={(e) => setEditHotel({...editHotel, fullName: e.target.value})}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                          ) : (
                            <div className="text-gray-500">{hotel.full_name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500">{hotel.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingHotelId === hotel.id ? (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editHotel.commissionLevel}
                              onChange={(e) => setEditHotel({...editHotel, commissionLevel: parseFloat(e.target.value)})}
                              className="block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                          ) : (
                            <div className="text-gray-500">{hotel.commission_level}%</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {editingHotelId === hotel.id ? (
                              <button
                                onClick={handleSaveHotelEdit}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Save className="h-5 w-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEditHotel(hotel)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveHotel(hotel.id)}
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
          )}
        </>
      )}
      
      {/* Add Hotel Operator Modal */}
      {showAddHotelForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Hotel Partner</h2>
            
            {formSuccess ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 flex items-start">
                <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{formSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleAddHotel}>
                {formError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{formError}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="hotelName" className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Name *
                  </label>
                  <input
                    id="hotelName"
                    type="text"
                    value={newHotel.hotelName}
                    onChange={(e) => setNewHotel({...newHotel, hotelName: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={newHotel.fullName}
                    onChange={(e) => setNewHotel({...newHotel, fullName: e.target.value})}
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
                    value={newHotel.email}
                    onChange={(e) => setNewHotel({...newHotel, email: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={newHotel.password}
                    onChange={(e) => setNewHotel({...newHotel, password: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="commissionLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Level (%) *
                  </label>
                  <input
                    id="commissionLevel"
                    type="number"
                    min="0"
                    max="100"
                    value={newHotel.commissionLevel}
                    onChange={(e) => setNewHotel({...newHotel, commissionLevel: parseFloat(e.target.value)})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Default commission is 10%. You can set a custom rate between 0% and 100%.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddHotelForm(false)}
                    className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Add Hotel
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