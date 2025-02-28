import React from 'react';
import { Link } from 'react-router-dom';
import { Frown as Frog, MapPin, Calendar, Star, Users } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 to-green-600/70 rounded-xl"></div>
        <div 
          className="relative rounded-xl overflow-hidden h-[500px] flex items-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1608036828625-ec811922b9a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="container mx-auto px-6 py-12 text-white">
            <div className="max-w-2xl">
              <div className="flex items-center mb-4">
                <Frog className="h-12 w-12 mr-3" />
                <h1 className="text-4xl md:text-5xl font-bold">ToadTourism</h1>
              </div>
              <p className="text-xl md:text-2xl mb-8">Discover unique experiences in Rio Dulce, Guatemala with local guides who know the area best.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/territories" 
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
                >
                  Explore Territories
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white hover:bg-gray-100 text-green-700 font-bold py-3 px-6 rounded-lg text-center transition-colors"
                >
                  Sign Up Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Territory */}
      <section className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Rio Dulce, Guatemala" 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="md:w-1/2 p-8">
            <div className="flex items-center mb-2">
              <MapPin className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-green-600 font-medium">Featured Territory</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Rio Dulce, Guatemala</h2>
            <p className="text-gray-600 mb-6">
              Rio Dulce is a lush river valley in eastern Guatemala, known for its stunning natural beauty, 
              wildlife, and the blend of Mayan and Caribbean cultures. Explore the emerald waters, 
              visit ancient ruins, and immerse yourself in the local way of life.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Jungle Tours</span>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Boat Trips</span>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Wildlife</span>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Cultural Experiences</span>
            </div>
            <Link 
              to="/territories/rio-dulce" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Explore Rio Dulce
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Experiences */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Popular Experiences</h2>
          <Link to="/experiences" className="text-green-600 hover:text-green-700 font-medium">View All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Experience Card 1 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <img 
                src="https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                alt="Jungle Kayaking" 
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-bold text-green-700">
                $45 / person
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-2">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">4.9 (128 reviews)</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Jungle Kayaking Adventure</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                Paddle through the lush mangroves and spot wildlife on this guided kayaking tour.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>3 hours</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>8 spots left</span>
                </div>
              </div>
            </div>
          </div>

          {/* Experience Card 2 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <img 
                src="https://images.unsplash.com/photo-1566559532215-bbc9b4cc6d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                alt="Mayan Cooking Class" 
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-bold text-green-700">
                $35 / person
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-2">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">4.8 (92 reviews)</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Mayan Cooking Class</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                Learn to prepare traditional Mayan dishes with local ingredients and ancient techniques.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>4 hours</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>4 spots left</span>
                </div>
              </div>
            </div>
          </div>

          {/* Experience Card 3 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <img 
                src="https://images.unsplash.com/photo-1596786232430-dfa08ebf4e7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                alt="Waterfall Hike" 
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-bold text-green-700">
                $55 / person
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-2">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">4.7 (76 reviews)</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Hidden Waterfall Trek</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                Hike through the rainforest to discover hidden waterfalls and natural swimming pools.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>6 hours</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>12 spots left</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-green-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8">How ToadTourism Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-green-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Choose a Territory</h3>
            <p className="text-gray-600">
              Browse our curated territories and find the perfect destination for your adventure.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Book an Experience</h3>
            <p className="text-gray-600">
              Select from a variety of unique experiences led by knowledgeable local guides.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Enjoy & Review</h3>
            <p className="text-gray-600">
              Have an amazing time and share your experience with other travelers through reviews.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-green-600 text-white rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready for Your Next Adventure?</h2>
        <p className="text-xl mb-6 max-w-2xl mx-auto">
          Join ToadTourism today and discover unforgettable experiences in Rio Dulce and beyond.
        </p>
        <Link 
          to="/register" 
          className="inline-block bg-white text-green-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Get Started
        </Link>
      </section>
    </div>
  );
};

export default Home;