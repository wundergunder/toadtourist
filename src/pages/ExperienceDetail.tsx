import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  MapPin, Calendar, Clock, Users, Star, ArrowLeft, 
  DollarSign, ChevronLeft, ChevronRight, AlertCircle 
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
  guide_id: string;
}

interface Territory {
  id: string;
  name: string;
}

interface Guide {
  id: string;
  full_name: string;
}

interface Review {
  id: string;
  tourist_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

const ExperienceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  
  const [experience, setExperience] = useState<Experience | null>(null);
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [numPeople, setNumPeople] = useState(1);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchExperienceDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch experience
        const { data: experienceData, error: experienceError } = await supabase
          .from('experiences')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (experienceError) {
          console.error('Error fetching experience:', experienceError);
          throw new Error('Failed to fetch experience details');
        }
        
        if (!experienceData) {
          // If no experience found in the database, use placeholder data
          const placeholderExperience = getPlaceholderExperience(id || '');
          setExperience(placeholderExperience);
          setTerritory(getPlaceholderTerritory());
          setGuide(getPlaceholderGuide());
          setReviews(getPlaceholderReviews());
          setIsLoading(false);
          return;
        }
        
        setExperience(experienceData);
        
        // Fetch territory
        const { data: territoryData, error: territoryError } = await supabase
          .from('territories')
          .select('id, name')
          .eq('id', experienceData.territory_id)
          .single();
        
        if (territoryError) throw territoryError;
        setTerritory(territoryData);
        
        // Fetch guide
        const { data: guideData, error: guideError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', experienceData.guide_id)
          .single();
        
        if (guideError) throw guideError;
        setGuide(guideData);
        
        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            tourist_id,
            rating,
            comment,
            created_at,
            profiles:tourist_id (full_name)
          `)
          .eq('experience_id', id);
        
        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);
      } catch (error) {
        console.error('Error fetching experience details:', error);
        setError('Failed to load experience details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchExperienceDetails();
    }
  }, [id]);

  // Set default booking date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? (experience?.image_urls.length || 1) - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === (experience?.image_urls.length || 1) - 1 ? 0 : prevIndex + 1
    );
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!experience) return;

    setBookingError(null);
    
    if (!bookingDate) {
      setBookingError('Please select a date for your booking');
      return;
    }

    if (numPeople <= 0) {
      setBookingError('Number of people must be at least 1');
      return;
    }

    if (numPeople > experience.available_spots) {
      setBookingError(`Only ${experience.available_spots} spots available`);
      return;
    }

    try {
      // Create booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          experience_id: experience.id,
          tourist_id: user.id,
          booking_date: bookingDate,
          num_people: numPeople,
          total_price: experience.price * numPeople,
          payment_method: paymentMethod,
          payment_status: 'pending'
        });
      
      if (bookingError) throw bookingError;

      // Update available spots
      const { error: updateError } = await supabase
        .from('experiences')
        .update({ 
          available_spots: experience.available_spots - numPeople 
        })
        .eq('id', experience.id);
      
      if (updateError) throw updateError;

      // Update local state
      setExperience({
        ...experience,
        available_spots: experience.available_spots - numPeople
      });
      
      setBookingSuccess(true);
      setNumPeople(1);
    } catch (error) {
      console.error('Error creating booking:', error);
      setBookingError('Failed to create booking. Please try again.');
    }
  };

  // Placeholder data functions
  const getPlaceholderExperience = (experienceId: string): Experience => {
    if (experienceId === 'jungle-kayaking') {
      return {
        id: 'jungle-kayaking',
        title: 'Jungle Kayaking Adventure',
        description: 'Paddle through the lush mangroves and spot wildlife on this guided kayaking tour. Our experienced guides will take you through hidden waterways where you can observe birds, monkeys, and possibly manatees in their natural habitat.\n\nThis tour begins at our base camp where you will receive safety instructions and equipment. We will then transport you to the starting point on the river where you will board your kayak. The journey takes you through narrow channels lined with mangroves, opening occasionally into wider lagoons rich with wildlife.\n\nAlong the way, your guide will point out interesting plants and animals, explaining their ecological importance. You will have opportunities to take photos and simply enjoy the tranquility of this unique ecosystem.\n\nThis tour is suitable for beginners and includes all necessary equipment including life jackets, paddles, and dry bags for your belongings. We recommend bringing sunscreen, insect repellent, a hat, and water.',
        price: 45,
        duration: 3,
        max_spots: 12,
        available_spots: 8,
        image_urls: [
          'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1572125675722-238a4f1f4ea2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1623991618729-acd138770029?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
        ],
        territory_id: 'rio-dulce',
        guide_id: 'guide-1'
      };
    } else if (experienceId === 'mayan-cooking') {
      return {
        id: 'mayan-cooking',
        title: 'Mayan Cooking Class',
        description: 'Learn to prepare traditional Mayan dishes with local ingredients and ancient techniques. This hands-on cooking class takes place in a traditional kitchen where you will learn about the cultural significance of Mayan cuisine while preparing a delicious meal to enjoy together.',
        price: 35,
        duration: 4,
        max_spots: 8,
        available_spots: 4,
        image_urls: [
          'https://images.unsplash.com/photo-1566559532215-bbc9b4cc6d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1604152135912-04a022e23696?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
        ],
        territory_id: 'rio-dulce',
        guide_id: 'guide-2'
      };
    } else if (experienceId === 'waterfall-trek') {
      return {
        id: 'waterfall-trek',
        title: 'Hidden Waterfall Trek',
        description: 'Hike through the rainforest to discover hidden waterfalls and natural swimming pools. This guided trek takes you off the beaten path to some of the most beautiful and secluded spots in the region. Along the way, your guide will share knowledge about local flora and fauna.',
        price: 55,
        duration: 6,
        max_spots: 15,
        available_spots: 12,
        image_urls: [
          'https://images.unsplash.com/photo-1596786232430-dfa08ebf4e7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1588392382834-a891154bca4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
        ],
        territory_id: 'rio-dulce',
        guide_id: 'guide-3'
      };
    } else {
      // Default placeholder for unknown experiences
      return {
        id: experienceId,
        title: 'Jungle Adventure',
        description: 'Experience the beauty of the jungle with our expert guides. This tour offers a unique opportunity to explore the natural wonders of Rio Dulce.',
        price: 50,
        duration: 4,
        max_spots: 10,
        available_spots: 6,
        image_urls: [
          'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
        ],
        territory_id: 'rio-dulce',
        guide_id: 'guide-1'
      };
    }
  };

  const getPlaceholderTerritory = (): Territory => {
    return {
      id: 'rio-dulce',
      name: 'Rio Dulce'
    };
  };

  const getPlaceholderGuide = (): Guide => {
    return {
      id: 'guide-1',
      full_name: 'Carlos Mendez'
    };
  };

  const getPlaceholderReviews = (): Review[] => {
    return [
      {
        id: 'review-1',
        tourist_id: 'tourist-1',
        rating: 5,
        comment: 'Amazing experience! Our guide was knowledgeable and we saw so much wildlife. Highly recommend!',
        created_at: '2023-06-15T14:30:00Z',
        profiles: {
          full_name: 'Sarah Johnson'
        }
      },
      {
        id: 'review-2',
        tourist_id: 'tourist-2',
        rating: 4,
        comment: 'Great tour, beautiful scenery. The kayaks were comfortable and the pace was perfect for beginners.',
        created_at: '2023-05-22T09:15:00Z',
        profiles: {
          full_name: 'Michael Chen'
        }
      },
      {
        id: 'review-3',
        tourist_id: 'tourist-3',
        rating: 5,
        comment: 'One of the highlights of our trip to Guatemala! We saw monkeys, toucans, and even a manatee!',
        created_at: '2023-04-10T16:45:00Z',
        profiles: {
          full_name: 'Emma Rodriguez'
        }
      }
    ];
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index} 
        className={`h-4 w-4 ${index < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          <Link to={`/territories/${territory?.id || 'rio-dulce'}`} className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {territory?.name || 'Rio Dulce'}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Experience Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative h-80">
                  {experience?.image_urls && experience.image_urls.length > 0 ? (
                    <img 
                      src={experience.image_urls[currentImageIndex]} 
                      alt={experience.title} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">No image available</p>
                    </div>
                  )}
                  
                  {experience?.image_urls && experience.image_urls.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                      >
                        <ChevronLeft className="h-6 w-6 text-gray-800" />
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                      >
                        <ChevronRight className="h-6 w-6 text-gray-800" />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {experience.image_urls.map((_, index) => (
                          <button 
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`h-2 w-2 rounded-full ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Experience Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-green-600 mr-2" />
                  <Link to={`/territories/${territory?.id || 'rio-dulce'}`} className="text-green-600 hover:text-green-700 font-medium">
                    {territory?.name || 'Rio Dulce'}
                  </Link>
                </div>
                
                <h1 className="text-3xl font-bold mb-4">{experience?.title}</h1>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{experience?.duration} hours</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{experience?.available_spots} spots available</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span>${experience?.price} per person</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2">About this experience</h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {experience?.description}
                  </p>
                </div>
                
                <div>
                  <h2 className="text-xl font-bold mb-2">Your guide</h2>
                  <div className="flex items-center">
                    <div className="bg-green-100 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                      <span className="text-green-700 font-bold">
                        {guide?.full_name.charAt(0) || 'G'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{guide?.full_name || 'Local Guide'}</p>
                      <p className="text-sm text-gray-500">Local Expert Guide</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-6">Reviews</h2>
                
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center mb-2">
                          <div className="bg-green-100 h-10 w-10 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-700 font-bold">
                              {review.profiles.full_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{review.profiles.full_name}</p>
                            <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex mb-2">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet for this experience.</p>
                )}
              </div>
            </div>

            {/* Right Column - Booking */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-4">Book this experience</h2>
                
                {bookingSuccess ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
                    <p className="font-medium">Booking successful!</p>
                    <p>Your booking has been confirmed. You can view your booking details in your account.</p>
                    <div className="mt-4 flex space-x-4">
                      <Link 
                        to="/bookings" 
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
                      >
                        View My Bookings
                      </Link>
                      <button 
                        onClick={() => setBookingSuccess(false)}
                        className="bg-white border border-green-600 text-green-600 hover:bg-green-50 font-bold py-2 px-4 rounded-md"
                      >
                        Book Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {bookingError && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                        <p>{bookingError}</p>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        id="bookingDate"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="numPeople" className="block text-sm font-medium text-gray-700 mb-1">
                        Number of people
                      </label>
                      <input
                        type="number"
                        id="numPeople"
                        value={numPeople}
                        onChange={(e) => setNumPeople(parseInt(e.target.value))}
                        min="1"
                        max={experience?.available_spots}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment method
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="cash"
                            checked={paymentMethod === 'cash'}
                            onChange={() => setPaymentMethod('cash')}
                            className="h-4 w-4 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-gray-700">Cash</span>
                        </label>
                        <label className="flex items-center opacity-50 cursor-not-allowed">
                          <input
                            type="radio"
                            value="card"
                            disabled
                            className="h-4 w-4 text-gray-400 focus:ring-gray-400"
                          />
                          <span className="ml-2 text-gray-400">Card (Coming soon)</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">${experience?.price} × {numPeople} {numPeople === 1 ? 'person' : 'people'}</span>
                        <span className="font-medium">${(experience?.price || 0) * numPeople}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${(experience?.price || 0) * numPeople}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleBooking}
                      disabled={!experience || experience.available_spots === 0}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {!experience || experience.available_spots === 0 ? 'Sold Out' : 'Book Now'}
                    </button>
                    
                    {!user && (
                      <p className="mt-2 text-sm text-gray-500 text-center">
                        You'll need to log in to complete your booking
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExperienceDetail;