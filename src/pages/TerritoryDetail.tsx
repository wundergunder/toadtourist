import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Calendar, Users, Star, ArrowLeft } from 'lucide-react';

interface Territory {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

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

const TerritoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [territory, setTerritory] = useState<Territory | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerritoryAndExperiences = async () => {
      try {
        setIsLoading(true);
        
        // Fetch territory
        const { data: territoryData, error: territoryError } = await supabase
          .from('territories')
          .select('*')
          .eq('id', id)
          .single();
        
        if (territoryError) throw territoryError;
        
        // Fetch experiences for this territory
        const { data: experiencesData, error: experiencesError } = await supabase
          .from('experiences')
          .select('*')
          .eq('territory_id', id);
        
        if (experiencesError) throw experiencesError;
        
        setTerritory(territoryData);
        setExperiences(experiencesData || []);
      } catch (error) {
        console.error('Error fetching region details:', error);
        setError('Failed to load region details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTerritoryAndExperiences();
    }
  }, [id]);

  // If no data in database, show placeholder data
  const placeholderTerritory = {
    id: 'rio-dulce',
    name: 'Rio Dulce',
    description: 'Rio Dulce is a lush river valley in eastern Guatemala, known for its stunning natural beauty, wildlife, and the blend of Mayan and Caribbean cultures. The emerald waters of the Rio Dulce flow from Lake Izabal to the Caribbean Sea, creating a diverse ecosystem that is home to hundreds of bird species, manatees, and other wildlife. The area is also rich in history, with the impressive Castillo de San Felipe fortress guarding the entrance to the river. Local communities along the riverbanks offer a glimpse into traditional ways of life, where fishing and farming remain important activities.',
    image_url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
  };

  const placeholderExperiences = [
    {
      id: 'jungle-kayaking',
      title: 'Jungle Kayaking Adventure',
      description: 'Paddle through the lush mangroves and spot wildlife on this guided kayaking tour. Our experienced guides will take you through hidden waterways where you can observe birds, monkeys, and possibly manatees in their natural habitat. This tour is suitable for beginners and includes all necessary equipment.',
      price: 45,
      duration: 3,
      max_spots: 12,
      available_spots: 8,
      image_urls: ['https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
      territory_id: 'rio-dulce',
      guide_id: 'guide-1'
    },
    {
      id: 'mayan-cooking',
      title: 'Mayan Cooking Class',
      description: 'Learn to prepare traditional Mayan dishes with local ingredients and ancient techniques. This hands-on cooking class takes place in a traditional kitchen where you will learn about the cultural significance of Mayan cuisine while preparing a delicious meal to enjoy together.',
      price: 35,
      duration: 4,
      max_spots: 8,
      available_spots: 4,
      image_urls: ['https://images.unsplash.com/photo-1566559532215-bbc9b4cc6d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
      territory_id: 'rio-dulce',
      guide_id: 'guide-2'
    },
    {
      id: 'waterfall-trek',
      title: 'Hidden Waterfall Trek',
      description: 'Hike through the rainforest to discover hidden waterfalls and natural swimming pools. This guided trek takes you off the beaten path to some of the most beautiful and secluded spots in the region. Along the way, your guide will share knowledge about local flora and fauna.',
      price: 55,
      duration: 6,
      max_spots: 15,
      available_spots: 12,
      image_urls: ['https://images.unsplash.com/photo-1596786232430-dfa08ebf4e7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
      territory_id: 'rio-dulce',
      guide_id: 'guide-3'
    }
  ];

  const displayTerritory = territory || placeholderTerritory;
  const displayExperiences = experiences.length > 0 ? experiences : placeholderExperiences;

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
          <Link to="/regions" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Regions
          </Link>

          {/* Territory Header */}
          <div className="relative rounded-xl overflow-hidden mb-8">
            <div className="absolute inset-0 bg-black/40"></div>
            <img 
              src={displayTerritory.image_url} 
              alt={displayTerritory.name} 
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Region</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{displayTerritory.name}</h1>
            </div>
          </div>

          {/* Territory Description */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">About {displayTerritory.name}</h2>
            <p className="text-gray-600 whitespace-pre-line">
              {displayTerritory.description}
            </p>
          </div>

          {/* Experiences */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Experiences in {displayTerritory.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayExperiences.map((experience) => (
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
                      <span className="text-sm text-gray-600">4.8 (92 reviews)</span>
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
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TerritoryDetail;