import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

const ToadLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect y="33" width="48" height="9" rx="3" fill="#8B4513" />
    <ellipse cx="24" cy="21" rx="15" ry="12" fill="#4CAF50" />
    <ellipse cx="24" cy="24" rx="12" ry="9" fill="#388E3C" />
    <circle cx="18" cy="18" r="3" fill="white" />
    <circle cx="18" cy="18" r="1.5" fill="black" />
    <circle cx="30" cy="18" r="3" fill="white" />
    <circle cx="30" cy="18" r="1.5" fill="black" />
    <path d="M21 27C23 29 25 29 27 27" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

interface Experience {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  max_spots: number;
  available_spots: number;
  image_urls: string[];
  featured: boolean;
  featured_order: number;
  territory_id: string;
  territories: {
    name: string;
  };
}

const Home: React.FC = () => {
  const { user } = useAuthStore();
  const [featuredExperiences, setFeaturedExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedExperiences = async () => {
      try {
        const { data, error } = await supabase
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
            featured,
            featured_order,
            territory_id,
            territories (
              name
            )
          `)
          .eq('featured', true)
          .order('featured_order', { ascending: true });

        if (error) throw error;
        setFeaturedExperiences(data || []);
      } catch (error) {
        console.error('Error fetching featured experiences:', error);
        setError('Failed to load featured experiences');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedExperiences();
  }, []);
  
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
                <ToadLogo />
                <h1 className="text-4xl md:text-5xl font-bold">Lazy Toad</h1>
              </div>
              <p className="text-xl md:text-2xl mb-8">Discover unique experiences with local guides who know the area best.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/regions" 
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
                >
                  Explore Regions
                </Link>
                {!user && (
                  <Link 
                    to="/register" 
                    className="bg-white hover:bg-gray-100 text-green-700 font-bold py-3 px-6 rounded-lg text-center transition-colors"
                  >
                    Sign Up Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Region */}
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
              <span className="text-sm text-green-600 font-medium">Featured Region</span>
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

      {/* Featured Experiences Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Experiences</h2>
          <Link to="/regions" className="text-green-600 hover:text-green-700 font-medium">View All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-3 flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="col-span-3 bg-red-50 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          ) : featuredExperiences.length > 0 ? (
            featuredExperiences.map((experience) => (
              <Link 
                key={experience.id}
                to={`/experiences/${experience.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <img 
                    src={experience.image_urls[0]} 
                    alt={experience.title} 
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-bold text-green-700">
                    ${experience.price} / person
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-600">Featured Experience</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{experience.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {experience.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{experience.duration} hours</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{experience.available_spots} spots left</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 bg-white rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Featured Experiences Yet</h3>
              <p className="text-gray-500">Check back soon for featured experiences!</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-green-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8">How Lazy Toad Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-green-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Choose a Region</h3>
            <p className="text-gray-600">
              Browse our curated regions and find the perfect destination for your adventure.
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
          Join Lazy Toad today and discover unforgettable experiences in Rio Dulce and beyond.
        </p>
        {!user ? (
          <Link 
            to="/register" 
            className="inline-block bg-white text-green-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        ) : (
          <Link 
            to="/regions" 
            className="inline-block bg-white text-green-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Browse Experiences
          </Link>
        )}
      </section>
    </div>
  );
};

export default Home;