import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  Calendar, MapPin, Clock, DollarSign, Star, AlertCircle 
} from 'lucide-react';

interface Booking {
  id: string;
  experience_id: string;
  booking_date: string;
  num_people: number;
  total_price: number;
  payment_method: 'cash' | 'card';
  payment_status: 'pending' | 'completed';
  created_at: string;
  experiences: {
    id: string;
    title: string;
    image_urls: string[];
    territory_id: string;
    duration: number;
    territories: {
      name: string;
    };
  };
}

interface ReviewFormData {
  bookingId: string;
  experienceId: string;
  rating: number;
  comment: string;
}

const Bookings: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormData, setReviewFormData] = useState<ReviewFormData>({
    bookingId: '',
    experienceId: '',
    rating: 5,
    comment: ''
  });
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            experience_id,
            booking_date,
            num_people,
            total_price,
            payment_method,
            payment_status,
            created_at,
            experiences (
              id,
              title,
              image_urls,
              territory_id,
              duration,
              territories (
                name
              )
            )
          `)
          .eq('tourist_id', user.id)
          .order('booking_date', { ascending: false });
        
        if (error) throw error;
        
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load your bookings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleReviewClick = (booking: Booking) => {
    setReviewFormData({
      bookingId: booking.id,
      experienceId: booking.experience_id,
      rating: 5,
      comment: ''
    });
    setShowReviewForm(true);
    setReviewError(null);
    setReviewSuccess(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!reviewFormData.comment.trim()) {
      setReviewError('Please enter a comment for your review');
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: reviewFormData.bookingId,
          tourist_id: user.id,
          experience_id: reviewFormData.experienceId,
          rating: reviewFormData.rating,
          comment: reviewFormData.comment
        });
      
      if (error) throw error;
      
      setReviewSuccess(true);
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError('Failed to submit review. Please try again.');
    }
  };

  // Placeholder bookings if none in database
  const placeholderBookings = [
    {
      id: 'booking-1',
      experience_id: 'jungle-kayaking',
      booking_date: '2023-07-15',
      num_people: 2,
      total_price: 90,
      payment_method: 'cash' as const,
      payment_status: 'completed' as const,
      created_at: '2023-07-10T14:30:00Z',
      experiences: {
        id: 'jungle-kayaking',
        title: 'Jungle Kayaking Adventure',
        image_urls: ['https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
        territory_id: 'rio-dulce',
        duration: 3,
        territories: {
          name: 'Rio Dulce'
        }
      }
    },
    {
      id: 'booking-2',
      experience_id: 'mayan-cooking',
      booking_date: '2023-08-05',
      num_people: 1,
      total_price: 35,
      payment_method: 'cash' as const,
      payment_status: 'pending' as const,
      created_at: '2023-07-25T09:15:00Z',
      experiences: {
        id: 'mayan-cooking',
        title: 'Mayan Cooking Class',
        image_urls: ['https://images.unsplash.com/photo-1566559532215-bbc9b4cc6d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
        territory_id: 'rio-dulce',
        duration: 4,
        territories: {
          name: 'Rio Dulce'
        }
      }
    }
  ];

  const displayBookings = bookings.length > 0 ? bookings : placeholderBookings;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : displayBookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-xl font-bold mb-4">No bookings yet</h2>
          <p className="text-gray-600 mb-6">You haven't booked any experiences yet. Start exploring to find your next adventure!</p>
          <Link 
            to="/experiences" 
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Explore Experiences
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {displayBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src={booking.experiences.image_urls[0]} 
                    alt={booking.experiences.title} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">{booking.experiences.territories.name}</span>
                  </div>
                  
                  <h2 className="text-xl font-bold mb-2">
                    <Link to={`/experiences/${booking.experiences.id}`} className="hover:text-green-600">
                      {booking.experiences.title}
                    </Link>
                  </h2>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(booking.booking_date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{booking.experiences.duration} hours</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>${booking.total_price} ({booking.num_people} {booking.num_people === 1 ? 'person' : 'people'})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.payment_status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.payment_status === 'completed' ? 'Paid' : 'Payment pending'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleReviewClick(booking)}
                      className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Leave a review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Review Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Leave a Review</h2>
            
            {reviewSuccess ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
                <p className="font-medium">Thank you for your review!</p>
                <p>Your feedback helps other travelers find great experiences.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                {reviewError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{reviewError}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewFormData({...reviewFormData, rating: star})}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={`h-8 w-8 ${
                            star <= reviewFormData.rating 
                              ? 'text-yellow-500 fill-yellow-500' 
                              : 'text-gray-300'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={reviewFormData.comment}
                    onChange={(e) => setReviewFormData({...reviewFormData, comment: e.target.value})}
                    placeholder="Share your experience with this tour..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Submit Review
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

export default Bookings;