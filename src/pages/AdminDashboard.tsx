import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  Users, Map, User, AlertCircle, Check, X, Plus, Trash2 
} from 'lucide-react';

interface TerritoryManager {
  id: string;
  email: string;
  full_name: string;
  territory_id: string | null;
  territories?: {
    name: string;
  } | null;
}

interface Territory {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

const AdminDashboard: React.FC = () => {
  const { user, profile } = useAuthStore();
  
  const [territoryManagers, setTerritoryManagers] = useState<TerritoryManager[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddManagerForm, setShowAddManagerForm] = useState(false);
  const [showAddTerritoryForm, setShowAddTerritoryForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  const [newManager, setNewManager] = useState({
    email: '',
    fullName: '',
    password: '',
    territoryId: ''
  });
  
  const [newTerritory, setNewTerritory] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch territory managers
        const { data: managersData, error: managersError } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            full_name,
            territory_id,
            territories (
              name
            )
          `)
          .eq('role', 'territory_manager');
        
        if (managersError) throw managersError;
        
        // Fetch territories
        const { data: territoriesData, error: territoriesError } = await supabase
          .from('territories')
          .select('*');
        
        if (territoriesError) throw territoriesError;
        
        setTerritoryManagers(managersData || []);
        setTerritories(territoriesData || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && profile?.role === 'admin') {
      fetchData();
    }
  }, [user, profile]);

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    const { email, fullName, password, territoryId } = newManager;
    
    if (!email || !fullName || !password) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'territory_manager'
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Wait for trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update profile with territory_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            territory_id: territoryId || null
          })
          .eq('id', authData.user.id);
        
        if (profileError) throw profileError;
        
        // Add to local state
        setTerritoryManagers([
          ...territoryManagers,
          {
            id: authData.user.id,
            email,
            full_name: fullName,
            territory_id: territoryId || null,
            territories: territoryId 
              ? territories.find(t => t.id === territoryId) 
                ? { name: territories.find(t => t.id === territoryId)!.name } 
                : null 
              : null
          }
        ]);
        
        setFormSuccess('Region manager added successfully');
        setNewManager({
          email: '',
          fullName: '',
          password: '',
          territoryId: ''
        });
        setTimeout(() => {
          setShowAddManagerForm(false);
          setFormSuccess(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding region manager:', error);
      setFormError('Failed to add region manager. Please try again.');
    }
  };

  const handleAddTerritory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    const { name, description, imageUrl } = newTerritory;
    
    if (!name || !description || !imageUrl) {
      setFormError('Please fill in all fields');
      return;
    }
    
    try {
      // Generate ID from name
      const id = name.toLowerCase().replace(/\s+/g, '-');
      
      // Create territory
      const { data, error } = await supabase
        .from('territories')
        .insert({
          id,
          name,
          description,
          image_url: imageUrl
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to local state
      if (data) {
        setTerritories([...territories, data]);
      }
      
      setFormSuccess('Region added successfully');
      setNewTerritory({
        name: '',
        description: '',
        imageUrl: ''
      });
      setTimeout(() => {
        setShowAddTerritoryForm(false);
        setFormSuccess(null);
      }, 2000);
    } catch (error) {
      console.error('Error adding region:', error);
      setFormError('Failed to add region. Please try again.');
    }
  };

  const handleRemoveManager = async (managerId: string) => {
    if (!confirm('Are you sure you want to remove this region manager?')) {
      return;
    }
    
    try {
      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', managerId);
      
      if (profileError) throw profileError;
      
      // Update local state
      setTerritoryManagers(territoryManagers.filter(manager => manager.id !== managerId));
    } catch (error) {
      console.error('Error removing region manager:', error);
      setError('Failed to remove region manager. Please try again.');
    }
  };

  // If not admin, redirect to home
  if (user && profile && profile.role !== 'admin') {
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

  const placeholderManagers = [
    {
      id: 'manager-1',
      email: 'manager@example.com',
      full_name: 'Maria Rodriguez',
      territory_id: 'rio-dulce',
      territories: {
        name: 'Rio Dulce'
      }
    }
  ];

  const displayTerritories = territories.length > 0 ? territories : placeholderTerritories;
  const displayManagers = territoryManagers.length > 0 ? territoryManagers : placeholderManagers;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
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
          {/* Territory Managers Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-xl font-bold">Region Managers</h2>
                </div>
                <button
                  onClick={() => setShowAddManagerForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Manager
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
                      Region
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayManagers.map((manager) => (
                    <tr key={manager.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{manager.full_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{manager.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {manager.territories ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {manager.territories.name}
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveManager(manager.id)}
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
          
          {/* Territories Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Map className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-xl font-bold">Regions</h2>
                </div>
                <button
                  onClick={() => setShowAddTerritoryForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Region
                </button>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 gap-4">
              {displayTerritories.map((territory) => (
                <div key={territory.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <img 
                      src={territory.image_url} 
                      alt={territory.name} 
                      className="h-16 w-16 object-cover rounded-md mr-4"
                    />
                    <div>
                      <h3 className="font-bold text-lg">{territory.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{territory.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Add Territory Manager Modal */}
      {showAddManagerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Region Manager</h2>
            
            {formSuccess ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 flex items-start">
                <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{formSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleAddManager}>
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
                    value={newManager.fullName}
                    onChange={(e) => setNewManager({...newManager, fullName: e.target.value})}
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
                    value={newManager.email}
                    onChange={(e) => setNewManager({...newManager, email: e.target.value})}
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
                    value={newManager.password}
                    onChange={(e) => setNewManager({...newManager, password: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="territoryId" className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Region
                  </label>
                  <select
                    id="territoryId"
                    value={newManager.territoryId}
                    onChange={(e) => setNewManager({...newManager, territoryId: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">-- Select Region --</option>
                    {displayTerritories.map((territory) => (
                      <option key={territory.id} value={territory.id}>
                        {territory.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddManagerForm(false)}
                    className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Add Manager
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      
      {/* Add Territory Modal */}
      {showAddTerritoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Region</h2>
            
            {formSuccess ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 flex items-start">
                <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{formSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleAddTerritory}>
                {formError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{formError}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Region Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={newTerritory.name}
                    onChange={(e) => setNewTerritory({...newTerritory, name: e.target.value})}
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
                    value={newTerritory.description}
                    onChange={(e) => setNewTerritory({...newTerritory, description: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL *
                  </label>
                  <input
                    id="imageUrl"
                    type="url"
                    value={newTerritory.imageUrl}
                    onChange={(e) => setNewTerritory({...newTerritory, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddTerritoryForm(false)}
                    className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Add Region
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

export default AdminDashboard;