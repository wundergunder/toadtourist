import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Search } from 'lucide-react';

interface Territory {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

const Territories: React.FC = () => {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get referral code from URL if present
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const referralCode = queryParams.get('ref');

  useEffect(() => {
    // Store referral code in localStorage if present
    if (referralCode) {
      localStorage.setItem('referralCode', referralCode);
    }
    
    const fetchTerritories = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('territories')
          .select('*');
        
        if (error) throw error;
        
        setTerritories(data || []);
      } catch (error) {
        console.error('Error fetching regions:', error);
        setError('Failed to load regions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerritories();
  }, [referralCode]);

  // Filter territories based on search query
  const filteredTerritories = territories.filter(territory => 
    territory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    territory.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If no territories in the database, show placeholder data
  const placeholderTerritories = [
    {
      id: 'rio-dulce',
      name: 'Rio Dulce',
      description: 'A lush river valley in eastern Guatemala, known for its stunning natural beauty, wildlife, and the blend of Mayan and Caribbean cultures.',
      image_url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    }
  ];

  const displayTerritories = territories.length > 0 ? filteredTerritories : placeholderTerritories;

  // Render referral message if there's a referral code
  const renderReferralMessage = () => {
    if (referralCode) {
      return (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
          <p className="font-medium">You're browsing through a hotel partner referral</p>
          <p className="text-sm">Any bookings you make will be associated with this referral</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Regions</h1>
        <p className="text-gray-600">Discover unique destinations and the experiences they offer</p>
      </div>

      {renderReferralMessage()}

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search regions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTerritories.map((territory) => (
            <Link 
              key={territory.id} 
              to={`/territories/${territory.id}${referralCode ? `?ref=${referralCode}` : ''}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48">
                <img 
                  src={territory.image_url} 
                  alt={territory.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-green-600 mr-2" />
                  <h2 className="text-xl font-bold">{territory.name}</h2>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {territory.description}
                </p>
                <div className="text-green-600 font-medium">
                  View experiences →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Territories;