import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Users, Star, Shield, Hotel, Calendar } from 'lucide-react';

const RegionalPartner: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Earn Money as a Regional Partner</h1>
      
      {/* Hero Section */}
      <div className="bg-green-600 text-white rounded-xl p-8 mb-12">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Become a Territory Manager</h2>
          <p className="text-lg mb-6">
            Join Lazy Toad as a Territory Manager and earn up to 10% commission on all experiences in your region while helping to grow sustainable tourism in Guatemala.
          </p>
          <Link 
            to="/register" 
            className="inline-block bg-white text-green-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-xl font-bold">Earn Commission</h3>
          </div>
          <p className="text-gray-600">
            Earn 10% commission on all bookings made through your region. The more experiences you curate and promote, the more you earn.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <MapPin className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-xl font-bold">Manage Your Region</h3>
          </div>
          <p className="text-gray-600">
            Take ownership of tourism development in your region. Curate unique experiences and work with local guides to create unforgettable adventures.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-xl font-bold">Build Your Team</h3>
          </div>
          <p className="text-gray-600">
            Recruit and manage local tour guides. Help them develop and promote their unique experiences while ensuring quality and safety standards.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <Hotel className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-xl font-bold">Hotel Partnerships</h3>
          </div>
          <p className="text-gray-600">
            Develop partnerships with local hotels and create a network of referral partners to increase bookings and revenue.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">1. Apply and Get Approved</h3>
              <p className="text-gray-600">
                Submit your application to become a Territory Manager. We'll review your experience and knowledge of the region to ensure you're a great fit.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">2. Set Up Your Region</h3>
              <p className="text-gray-600">
                Once approved, you'll get access to our Territory Management platform where you can start building your region's profile and curating experiences.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">3. Build Your Network</h3>
              <p className="text-gray-600">
                Recruit local tour guides and establish partnerships with hotels. Help guides create and price their experiences, and set up hotel referral programs.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">4. Ensure Quality</h3>
              <p className="text-gray-600">
                Monitor the quality of experiences, collect and respond to feedback, and work with guides to continuously improve offerings.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">5. Earn and Grow</h3>
              <p className="text-gray-600">
                Earn 10% commission on all bookings in your region. Track earnings, manage payments, and grow your tourism business.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">Requirements</h2>
        <ul className="space-y-4 text-gray-600">
          <li className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            Deep knowledge of your region and its tourism potential
          </li>
          <li className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            Strong network within the local tourism community
          </li>
          <li className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            Minimum 2 years experience in tourism or hospitality
          </li>
          <li className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            Commitment to sustainable and responsible tourism
          </li>
        </ul>
      </div>

      {/* Call to Action */}
      <div className="bg-green-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg text-gray-600 mb-6">
          Join Lazy Toad as a Territory Manager and help shape the future of tourism in your region while building a sustainable business.
        </p>
        <Link 
          to="/register" 
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Apply Now
        </Link>
      </div>
    </div>
  );
};

export default RegionalPartner;