import React, { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  Users, Map, User, AlertCircle, Check, X, Plus, Trash2, Edit, Save, DollarSign
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

const TerritoryManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  
  const [currentTab, setCurrentTab] = useState<'experiences' | 'guides' | 'finances'>('experiences');
  const [tourGuides, setTourGuides] = useState<TourGuide[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [earnings, setEarnings] = useState<CommissionEarning[]>([]);
  const [payments, setPayments] = useState<CommissionPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setIsLoading(false);
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
                          <div className="font-medium text-gray-900">{experience.title}</div>
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
                          <Link
                            to={`/territory-management/edit-experience/${experience.id}`}
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
                                : 'bg-yellow-100 text-yellow-800'
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
                          Method
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
                            <div className="text-sm text-gray-500">
                              {payment.payment_method.replace('_', ' ')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {payment.payment_reference}
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
        </>
      )}
    </div>
  );
};

export default TerritoryManagement;