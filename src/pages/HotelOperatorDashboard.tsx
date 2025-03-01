import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  Hotel, Link as LinkIcon, QrCode, DollarSign, Calendar, Users, 
  AlertCircle, Check, Plus, Edit, Save, Trash2, Copy, Download
} from 'lucide-react';
import QRCode from 'qrcode';

interface ReferralLink {
  id: string;
  code: string;
  name: string;
  created_at: string;
  active: boolean;
}

interface Referral {
  id: string;
  booking_id: string;
  referral_link_id: string;
  created_at: string;
  bookings: {
    tourist_id: string;
    booking_date: string;
    num_people: number;
    total_price: number;
    experiences: {
      title: string;
    };
    profiles: {
      full_name: string;
    };
  };
}

interface Commission {
  id: string;
  referral_id: string;
  amount: number;
  status: 'pending' | 'paid';
  paid_at: string | null;
  created_at: string;
}

const HotelOperatorDashboard: React.FC = () => {
  const { user, profile, hasRole } = useAuthStore();
  
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editLinkName, setEditLinkName] = useState('');
  const [selectedLinkForQR, setSelectedLinkForQR] = useState<ReferralLink | null>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Fetch referral links
      const { data: linksData, error: linksError } = await supabase
        .from('referral_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (linksError) throw linksError;
      setReferralLinks(linksData || []);
      
      if (linksData && linksData.length > 0) {
        // Fetch referrals for these links
        const linkIds = linksData.map(link => link.id);
        
        const { data: referralsData, error: referralsError } = await supabase
          .from('referrals')
          .select(`
            id,
            booking_id,
            referral_link_id,
            created_at,
            bookings (
              tourist_id,
              booking_date,
              num_people,
              total_price,
              experiences (
                title
              ),
              profiles:tourist_id (
                full_name
              )
            )
          `)
          .in('referral_link_id', linkIds)
          .order('created_at', { ascending: false });
        
        if (referralsError) throw referralsError;
        setReferrals(referralsData || []);
        
        // Fetch commissions
        const referralIds = referralsData?.map(ref => ref.id) || [];
        
        if (referralIds.length > 0) {
          const { data: commissionsData, error: commissionsError } = await supabase
            .from('commissions')
            .select('*')
            .in('referral_id', referralIds)
            .order('created_at', { ascending: false });
          
          if (commissionsError) throw commissionsError;
          setCommissions(commissionsData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching hotel operator data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && hasRole('hotel_operator')) {
      fetchData();
    }
  }, [user]);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLinkName.trim()) {
      setError('Please enter a name for your referral link');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('referral_links')
        .insert({
          user_id: user!.id,
          name: newLinkName,
          active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setReferralLinks([data, ...referralLinks]);
      setNewLinkName('');
      setShowAddLinkForm(false);
      setSuccessMessage('Referral link created successfully');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error creating referral link:', error);
      setError('Failed to create referral link. Please try again.');
    }
  };

  const handleEditLink = async () => {
    if (!editingLinkId || !editLinkName.trim()) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('referral_links')
        .update({ name: editLinkName })
        .eq('id', editingLinkId);
      
      if (error) throw error;
      
      setReferralLinks(referralLinks.map(link => 
        link.id === editingLinkId ? { ...link, name: editLinkName } : link
      ));
      
      setEditingLinkId(null);
      setSuccessMessage('Referral link updated successfully');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating referral link:', error);
      setError('Failed to update referral link. Please try again.');
    }
  };

  const handleToggleLinkStatus = async (linkId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('referral_links')
        .update({ active: !currentStatus })
        .eq('id', linkId);
      
      if (error) throw error;
      
      setReferralLinks(referralLinks.map(link => 
        link.id === linkId ? { ...link, active: !currentStatus } : link
      ));
      
      setSuccessMessage(`Referral link ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error toggling referral link status:', error);
      setError('Failed to update referral link. Please try again.');
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this referral link? This will also delete all associated referrals and commissions.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('referral_links')
        .delete()
        .eq('id', linkId);
      
      if (error) throw error;
      
      setReferralLinks(referralLinks.filter(link => link.id !== linkId));
      setReferrals(referrals.filter(ref => ref.referral_link_id !== linkId));
      
      setSuccessMessage('Referral link deleted successfully');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting referral link:', error);
      setError('Failed to delete referral link. Please try again.');
    }
  };

  const generateQRCode = async (link: ReferralLink) => {
    try {
      const url = `${window.location.origin}/regions?ref=${link.code}`;
      const dataURL = await QRCode.toDataURL(url);
      setQrCodeDataURL(dataURL);
      setSelectedLinkForQR(link);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Failed to generate QR code. Please try again.');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataURL || !selectedLinkForQR) return;
    
    const link = document.createElement('a');
    link.href = qrCodeDataURL;
    link.download = `lazy-toad-referral-${selectedLinkForQR.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyReferralLink = (link: ReferralLink) => {
    const url = `${window.location.origin}/regions?ref=${link.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLinkId(link.id);
    
    setTimeout(() => {
      setCopiedLinkId(null);
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTotalCommission = () => {
    return commissions.reduce((total, commission) => total + commission.amount, 0).toFixed(2);
  };

  const getPendingCommission = () => {
    return commissions
      .filter(commission => commission.status === 'pending')
      .reduce((total, commission) => total + commission.amount, 0)
      .toFixed(2);
  };

  const getPaidCommission = () => {
    return commissions
      .filter(commission => commission.status === 'paid')
      .reduce((total, commission) => total + commission.amount, 0)
      .toFixed(2);
  };

  // If not hotel operator, redirect to home
  if (user && profile && !hasRole('hotel_operator')) {
    return <Navigate to="/" />;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Hotel Operator Dashboard</h1>
      <p className="text-gray-600 mb-6">Manage your referral links and track commissions</p>
      
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Referral Links */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <LinkIcon className="h-6 w-6 text-green-600 mr-2" />
                    <h2 className="text-xl font-bold">My Referral Links</h2>
                  </div>
                  <button
                    onClick={() => setShowAddLinkForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Link
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {referralLinks.length === 0 ? (
                  <div className="text-center py-8">
                    <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">You don't have any referral links yet</p>
                    <button
                      onClick={() => setShowAddLinkForm(true)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                    >
                      Create Your First Link
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referralLinks.map((link) => (
                      <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            {editingLinkId === link.id ? (
                              <div className="flex items-center mb-2">
                                <input
                                  type="text"
                                  value={editLinkName}
                                  onChange={(e) => setEditLinkName(e.target.value)}
                                  className="border border-gray-300 rounded-md px-3 py-1 mr-2"
                                />
                                <button
                                  onClick={handleEditLink}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Save className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              <h3 className="font-bold text-lg mb-1 flex items-center">
                                {link.name}
                                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                  link.active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {link.active ? 'Active' : 'Inactive'}
                                </span>
                              </h3>
                            )}
                            <p className="text-sm text-gray-500 mb-2">Created on {formatDate(link.created_at)}</p>
                            <div className="flex items-center">
                              <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm font-mono mr-2">
                                {link.code}
                              </div>
                              <button
                                onClick={() => copyReferralLink(link)}
                                className="text-blue-600 hover:text-blue-700"
                                title="Copy referral link"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              {copiedLinkId === link.id && (
                                <span className="text-green-600 text-xs ml-2">Copied!</span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => generateQRCode(link)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Generate QR code"
                            >
                              <QrCode className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingLinkId(link.id);
                                setEditLinkName(link.name);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                              title="Edit link name"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleToggleLinkStatus(link.id, link.active)}
                              className={link.active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                              title={link.active ? "Deactivate link" : "Activate link"}
                            >
                              {link.active ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteLink(link.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete link"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Referrals Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-xl font-bold">Recent Referrals</h2>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {referrals.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No referrals yet</p>
                    <p className="text-sm text-gray-400 mt-2">Share your referral links to start earning commissions</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tourist
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Experience
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          People
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commission
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {referrals.map((referral) => {
                        const commission = commissions.find(c => c.referral_id === referral.id);
                        return (
                          <tr key={referral.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{referral.bookings.profiles.full_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-500">{referral.bookings.experiences.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-500">{formatDate(referral.bookings.booking_date)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-500">{referral.bookings.num_people}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-500">${referral.bookings.total_price.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {commission ? (
                                <div className={`font-medium ${
                                  commission.status === 'paid' 
                                    ? 'text-green-600' 
                                    : 'text-orange-600'
                                }`}>
                                  ${commission.amount.toFixed(2)}
                                  <span className="text-xs ml-1">
                                    ({commission.status})
                                  </span>
                                </div>
                              ) : (
                                <div className="text-gray-400">Calculating...</div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Stats and QR Code */}
          <div className="lg:col-span-1 space-y-6">
            {/* Commission Stats */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-xl font-bold">Commission Summary</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-1">Total Commission</h3>
                    <p className="text-3xl font-bold text-green-600">${getTotalCommission()}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-1">Pending</h3>
                    <p className="text-3xl font-bold text-green-600">${getPendingCommission()}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-1">Paid</h3>
                    <p className="text-3xl font-bold text-green-600">${getPaidCommission()}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <p>You earn 10% commission on all bookings made through your referral links.</p>
                </div>
              </div>
            </div>
            
            {/* QR Code Display */}
            {selectedLinkForQR && qrCodeDataURL && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <QrCode className="h-6 w-6 text-green-600 mr-2" />
                    <h2 className="text-xl font-bold">QR Code</h2>
                  </div>
                </div>
                
                <div className="p-6 text-center">
                  <h3 className="font-bold mb-4">{selectedLinkForQR.name}</h3>
                  <div className="bg-white p-4 inline-block rounded-lg border border-gray-200 mb-4">
                    <img src={qrCodeDataURL} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Scan this QR code or share the link below:</p>
                    <div className="bg-gray-100 p-2 rounded-md text-sm font-mono break-all">
                      {`${window.location.origin}/regions?ref=${selectedLinkForQR.code}`}
                    </div>
                  </div>
                  <button
                    onClick={downloadQRCode}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center mx-auto"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download QR Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Add Referral Link Modal */}
      {showAddLinkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Referral Link</h2>
            
            <form onSubmit={handleAddLink}>
              <div className="mb-6">
                <label htmlFor="linkName" className="block text-sm font-medium text-gray-700 mb-1">
                  Link Name *
                </label>
                <input
                  id="linkName"
                  type="text"
                  value={newLinkName}
                  onChange={(e) => setNewLinkName(e.target.value)}
                  placeholder="e.g., Hotel Lobby Display"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Give your link a name to help you remember where it's used
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddLinkForm(false)}
                  className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  Create Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelOperatorDashboard;