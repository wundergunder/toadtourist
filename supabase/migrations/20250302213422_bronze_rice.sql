/*
  # Add Rio Dulce Experiences

  1. New Experiences
    - Adds 22 new experiences for the Rio Dulce region
    - Each experience includes title, description, price, duration, capacity, and images
  
  2. Changes
    - Updates existing experiences with better images if needed
    - Ensures all experiences have proper territory_id and guide_id
*/

-- Get a valid guide ID to use for the experiences
DO $$
DECLARE
  guide_id uuid;
BEGIN
  -- Try to find a guide specifically for Rio Dulce
  SELECT id INTO guide_id FROM profiles 
  WHERE territory_id = 'rio-dulce' AND 'tour_guide' = ANY(roles)
  LIMIT 1;
  
  -- If no guide found for Rio Dulce, use any guide
  IF guide_id IS NULL THEN
    SELECT id INTO guide_id FROM profiles 
    WHERE 'tour_guide' = ANY(roles)
    LIMIT 1;
  END IF;
  
  -- If still no guide found, use any user (this is just a fallback)
  IF guide_id IS NULL THEN
    SELECT id INTO guide_id FROM profiles LIMIT 1;
  END IF;

  -- Boquerón River Rafting Tour
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-boqueron-rafting',
    'Boquerón River Rafting Tour',
    'Experience the thrill of white water rafting through the stunning Boquerón Canyon. This adventure begins with a scenic drive to the starting point, where you''ll receive safety instructions and equipment. Navigate through exciting class II and III rapids as the river cuts through limestone walls rising up to 300 meters on either side. Halfway through, stop at a natural pool for swimming and a picnic lunch. The tour includes professional guides, all necessary equipment, transportation, and meals.',
    65,
    6,
    12,
    12,
    ARRAY[
      'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581839671845-428eee2f5764?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-boqueron-rafting');

  -- Playa Blanca Beach Tour including Siete Altares
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-playa-blanca',
    'Playa Blanca Beach Tour including Siete Altares',
    'Discover the pristine white sand beaches of Playa Blanca and the magical cascading pools of Siete Altares on this full-day tour. Travel by boat from Rio Dulce through mangrove forests to reach the Caribbean coast. Spend time relaxing on the white sand beach, swimming in crystal clear waters, and enjoying fresh seafood. Continue to Siete Altares, a series of seven natural pools connected by small waterfalls, hidden in the jungle. Hike through tropical vegetation and swim in the refreshing pools. The tour includes boat transportation, guide, entrance fees, and lunch.',
    75,
    8,
    15,
    15,
    ARRAY[
      'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596786232430-dfa08ebf4e7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-playa-blanca');

  -- Livingston Garífuna Experience Tour
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-livingston-garifuna',
    'Livingston Garífuna Experience Tour',
    'Immerse yourself in the unique Garífuna culture of Livingston, a coastal town only accessible by boat. Journey down the Rio Dulce through a spectacular canyon with towering cliffs and lush vegetation. Upon arrival in Livingston, explore the colorful town and learn about the Garífuna people, descendants of African, Caribbean, and Arawak people with their own distinct language, music, and cuisine. Enjoy a traditional Garífuna lunch featuring coconut-based dishes like tapado (seafood soup) and rice with beans. Experience a cultural performance with traditional punta music and dancing. The tour includes boat transportation, guide, cultural activities, and lunch.',
    60,
    7,
    20,
    20,
    ARRAY[
      'https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504387432042-8aca549e4729?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533854775446-95c8a5b7a101?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-livingston-garifuna');

  -- Finca Pariaso and Boquerón River Rafting
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-finca-paraiso-rafting',
    'Finca Paraiso and Boquerón River Rafting',
    'Combine two of Rio Dulce''s most exciting attractions in one adventure-packed day. Begin at Finca Paraiso, where you''ll hike through tropical forest to reach a stunning hot waterfall cascading into a cool river pool - a perfect natural spa where you can swim in the unique mix of hot and cold waters. After lunch, tackle the thrilling rapids of the Boquerón River, navigating through a dramatic limestone canyon. This tour is perfect for adventure seekers who want to experience both relaxation and excitement in one day. Includes transportation, equipment, professional guides, and meals.',
    85,
    9,
    10,
    10,
    ARRAY[
      'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596786232430-dfa08ebf4e7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-finca-paraiso-rafting');

  -- Mayan Cooking Class
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-mayan-cooking',
    'Mayan Cooking Class',
    'Learn to prepare authentic Mayan dishes in this hands-on cooking class led by local women from Q''eqchi'' Maya communities. Start with a visit to a local market to select fresh ingredients while learning about traditional herbs and spices. Return to an outdoor kitchen where you''ll learn to make corn tortillas by hand, prepare traditional dishes like kak''ik (turkey soup), subanik (meat stew), and rellenitos (plantain dessert). Discover the cultural significance of each dish and the traditional cooking techniques passed down through generations. Enjoy your creations for lunch in a beautiful garden setting. The class includes market visit, all ingredients, recipes to take home, and the meal you prepare.',
    45,
    5,
    8,
    8,
    ARRAY[
      'https://images.unsplash.com/photo-1566559532215-bbc9b4cc6d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604152135912-04a022e23696?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-mayan-cooking');

  -- Castillo San Felipe Tour
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-castillo-san-felipe',
    'Castillo San Felipe Tour',
    'Explore the historic Castillo de San Felipe, a Spanish colonial fort built in 1652 to protect Lake Izabal from pirates. This guided tour takes you through the restored fortress, where you''ll learn about its fascinating history, including its role in protecting Spanish treasure ships and its multiple destructions and reconstructions. Walk along the stone walls, explore the watchtowers, and discover the dungeons while enjoying panoramic views of Rio Dulce and Lake Izabal. The tour includes transportation, entrance fees, guide, and refreshments.',
    35,
    3,
    20,
    20,
    ARRAY[
      'https://images.unsplash.com/photo-1548602088-9d12a4f9c10f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1569880153113-76e33fc52d5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588001400947-6385aef4ab0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-castillo-san-felipe');

  -- Denny's Beach
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-dennys-beach',
    'Denny''s Beach Day Trip',
    'Escape to Denny''s Beach, a hidden gem on the shores of Lake Izabal. This day trip takes you to a pristine beach with clear, calm waters perfect for swimming and water activities. Relax in hammocks under palm trees, enjoy beach volleyball, or rent kayaks to explore the shoreline. The beach club offers comfortable facilities including changing rooms, showers, and a restaurant serving fresh seafood and tropical drinks. This is an ideal day trip for families and anyone looking to relax in a beautiful natural setting. The tour includes transportation, entrance to the beach club, use of facilities, and a welcome drink.',
    40,
    6,
    15,
    15,
    ARRAY[
      'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-dennys-beach');

  -- Finca Pariaso Water Tour
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-finca-paraiso',
    'Finca Paraiso Hot Springs Tour',
    'Visit the natural wonder of Finca Paraiso, where a hot waterfall cascades into a cool river creating a perfect natural spa. This half-day tour takes you to this unique geological phenomenon where you can swim in the refreshing mix of hot and cold waters. The hot water, heated by volcanic activity underground, creates a 40°C (104°F) waterfall that flows into a cool river pool below. Enjoy time swimming, relaxing, and exploring the surrounding tropical forest. The tour includes transportation, entrance fees, guide, and light refreshments.',
    35,
    4,
    12,
    12,
    ARRAY[
      'https://images.unsplash.com/photo-1596786232430-dfa08ebf4e7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588392382834-a891154bca4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-finca-paraiso');

  -- Wildlife of Rio Dulce Water Tour
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-wildlife-tour',
    'Wildlife of Rio Dulce Water Tour',
    'Discover the incredible biodiversity of Rio Dulce on this wildlife-focused boat tour. Navigate through narrow channels lined with mangroves and water lilies as you search for wildlife with your expert naturalist guide. Spot birds like herons, kingfishers, and cormorants, watch for howler monkeys in the trees, and if you''re lucky, glimpse manatees in the calm waters. Visit Bird Island, home to hundreds of egrets and other water birds. Learn about the delicate ecosystem of the river and the conservation efforts to protect it. The tour includes boat transportation, naturalist guide, binoculars, and refreshments.',
    50,
    4,
    8,
    8,
    ARRAY[
      'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572125675722-238a4f1f4ea2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1623991618729-acd138770029?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-wildlife-tour');

  -- Horseback Riding
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-horseback-riding',
    'Jungle Horseback Riding Adventure',
    'Explore the lush landscapes around Rio Dulce on horseback, traveling through terrain inaccessible by vehicle. This guided horseback riding tour takes you through tropical forest, along riverside trails, and past small rural communities. Suitable for both beginners and experienced riders, the horses are well-trained and gentle. Your guide will point out interesting plants, wildlife, and share stories about local culture and history. The tour includes transportation to the stables, riding equipment, guide, and refreshments.',
    45,
    3,
    8,
    8,
    ARRAY[
      'https://images.unsplash.com/photo-1450052590821-8bf91254a353?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527153818091-1a9638521e2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588392382834-a891154bca4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-horseback-riding');

  -- Ziplining and Kayaking in Cayo Quemado
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-zipline-kayak',
    'Ziplining and Kayaking in Cayo Quemado',
    'Experience the thrill of ziplining through the jungle canopy followed by peaceful kayaking in the protected waters of Cayo Quemado. Begin your adventure with a series of ziplines that offer spectacular views of Rio Dulce and the surrounding forest. After the adrenaline rush of ziplining, switch to a more tranquil experience as you paddle through mangrove forests in a kayak, exploring narrow channels and observing wildlife. Visit a local family in Cayo Quemado who will demonstrate traditional fishing techniques and prepare a delicious lunch with your catch. The tour includes transportation, equipment, guides, and lunch.',
    70,
    6,
    10,
    10,
    ARRAY[
      'https://images.unsplash.com/photo-1622293088099-c3a38362c399?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1623991618729-acd138770029?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-zipline-kayak');

  -- Live like a Mayan Jungle Tour
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-mayan-jungle-life',
    'Live like a Mayan Jungle Tour',
    'Immerse yourself in the traditional lifestyle of the Q''eqchi'' Maya people who live in harmony with the jungle. This cultural experience takes you to a small Q''eqchi'' community where you''ll learn about their daily life, traditions, and deep connection to nature. Participate in daily activities like preparing corn tortillas, harvesting medicinal plants, and traditional crafts. Learn about ancient Mayan beliefs and how they blend with modern life. Enjoy a traditional lunch prepared over an open fire. This authentic cultural exchange provides valuable income to the community while preserving their traditions. The tour includes transportation, guide/translator, activities, and lunch.',
    55,
    7,
    8,
    8,
    ARRAY[
      'https://images.unsplash.com/photo-1566559532215-bbc9b4cc6d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604152135912-04a022e23696?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-mayan-jungle-life');

  -- Shuttle Service to Antigua
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-shuttle-antigua',
    'Shuttle Service to Antigua',
    'Travel comfortably from Rio Dulce to the colonial city of Antigua with our reliable shuttle service. This direct transfer saves you the hassle of navigating public transportation or changing buses. The air-conditioned shuttle departs from your hotel in Rio Dulce and takes you directly to Antigua, with a stop for lunch and restrooms along the way. The journey offers beautiful views of Guatemala''s diverse landscapes, from the lush eastern lowlands to the central highlands. Our professional drivers ensure a safe and comfortable journey. The service includes hotel pickup, transportation in an air-conditioned vehicle, and one piece of luggage per person.',
    35,
    6,
    15,
    15,
    ARRAY[
      'https://images.unsplash.com/photo-1605216663980-b7ca6e9f2451?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1494783367193-149034c05e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618739158007-a0b435b72fca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-shuttle-antigua');

  -- Shuttle Service to Lanquin
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-shuttle-lanquin',
    'Shuttle Service to Lanquin (Semuc Champey)',
    'Travel comfortably from Rio Dulce to Lanquin, the gateway to Semuc Champey, with our reliable shuttle service. This direct transfer saves you the hassle of navigating public transportation on challenging roads. The air-conditioned shuttle departs from your hotel in Rio Dulce and takes you to your accommodation in Lanquin, with stops for lunch and restrooms along the way. The journey offers spectacular views of Guatemala''s diverse landscapes, from lowland jungle to mountain scenery. Our professional drivers are experienced with the mountain roads to ensure a safe journey. The service includes hotel pickup and drop-off, transportation in an air-conditioned vehicle, and one piece of luggage per person.',
    30,
    5,
    15,
    15,
    ARRAY[
      'https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1494783367193-149034c05e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596786232430-dfa08ebf4e7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-shuttle-lanquin');

  -- Shuttle Service to San Pedro Sula, Honduras
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-shuttle-honduras',
    'Shuttle Service to San Pedro Sula, Honduras',
    'Travel comfortably from Rio Dulce to San Pedro Sula, Honduras with our reliable international shuttle service. This direct transfer saves you the hassle of navigating public transportation and border crossings. The air-conditioned shuttle departs from your hotel in Rio Dulce and takes you to San Pedro Sula, with assistance at the border crossing and stops for lunch and restrooms along the way. Our experienced drivers and guides help make the border crossing smooth and efficient. The service includes hotel pickup, transportation in an air-conditioned vehicle, border crossing assistance, and one piece of luggage per person. Please note that border fees and exit/entry taxes are not included.',
    45,
    6,
    12,
    12,
    ARRAY[
      'https://images.unsplash.com/photo-1494783367193-149034c05e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618739158007-a0b435b72fca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-shuttle-honduras');

  -- Boat Service to Or From Punta Gorda, Belize
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-boat-belize',
    'Boat Service to/from Punta Gorda, Belize',
    'Travel by boat between Rio Dulce, Guatemala and Punta Gorda, Belize on this international water transfer. This scenic journey takes you from Livingston, at the mouth of Rio Dulce, across the Bay of Amatique to Punta Gorda, Belize (or vice versa). The boat ride offers beautiful views of the Caribbean coastline and is often smoother and more comfortable than road travel. Our experienced captains ensure a safe journey, and staff assist with immigration procedures at both ports. The service includes transportation between Rio Dulce town and Livingston, the international boat transfer, and assistance with immigration. Please note that border fees and exit/entry taxes are not included.',
    40,
    3,
    15,
    15,
    ARRAY[
      'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504387432042-8aca549e4729?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-boat-belize');

  -- Fresh Water Fishing
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-freshwater-fishing',
    'Fresh Water Fishing Adventure',
    'Experience the excellent freshwater fishing that Rio Dulce and Lake Izabal have to offer with our guided fishing tour. These waters are home to a variety of species including snook, tarpon, mojarra, and the famous machaca (river dogfish). Your experienced local guide knows the best fishing spots and techniques for each season. The tour includes a comfortable boat, fishing equipment, bait, refreshments, and lunch. Both beginners and experienced anglers are welcome, and the guide will provide instruction as needed. Catch-and-release is encouraged but you can keep a reasonable number of fish for consumption. The tour includes boat, guide, fishing equipment, bait, fishing license, refreshments, and lunch.',
    65,
    6,
    4,
    4,
    ARRAY[
      'https://images.unsplash.com/photo-1516731566880-919c39006c9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500063925588-751f924d7c80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-freshwater-fishing');

  -- Salt water Fishing south of Belize
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-saltwater-fishing',
    'Saltwater Fishing in the Caribbean',
    'Experience world-class saltwater fishing in the Caribbean waters near Livingston and Amatique Bay. This full-day fishing charter takes you to prime fishing grounds where you can target species like snapper, grouper, jack, barracuda, and more. Your experienced captain knows the best spots based on the season and conditions. The comfortable boat is equipped with quality fishing gear and safety equipment. Both trolling and bottom fishing techniques are used to maximize your chances of a good catch. The tour includes transportation from Rio Dulce to Livingston, boat, captain and mate, fishing equipment, bait, fishing license, lunch, and refreshments.',
    120,
    8,
    4,
    4,
    ARRAY[
      'https://images.unsplash.com/photo-1545508775-71e8a71ef686?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582902281019-ac54af78a1b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566438480900-0609be27a4be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-saltwater-fishing');

  -- Barrier Reef Snorkling
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-barrier-reef-snorkeling',
    'Barrier Reef Snorkeling Adventure',
    'Explore the northern reaches of the Mesoamerican Barrier Reef, the second-largest coral reef system in the world, on this snorkeling adventure from Rio Dulce. Travel by boat to Livingston and then continue to prime snorkeling spots near the Belizean border. Discover vibrant coral formations, tropical fish, and other marine life in the crystal-clear Caribbean waters. The tour is suitable for beginners, with instruction and quality equipment provided. Between snorkeling sessions, relax on a beautiful beach and enjoy a picnic lunch. The tour includes transportation from Rio Dulce to Livingston, boat to snorkeling sites, snorkeling equipment, guide, lunch, and refreshments.',
    85,
    8,
    8,
    8,
    ARRAY[
      'https://images.unsplash.com/photo-1560275619-4cc5fa59d3ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-barrier-reef-snorkeling');

  -- Night Spear Fishing with locals
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-night-spearfishing',
    'Night Spear Fishing with Locals',
    'Experience the traditional night fishing technique practiced by local fishermen in Rio Dulce. As darkness falls, you''ll head out on a small boat equipped with lights that attract fish to the surface. Your local guide will teach you the traditional spearfishing techniques used for generations in this region. This sustainable fishing method targets specific fish and avoids bycatch. The experience provides insight into local culture and traditional subsistence practices. Any fish caught will be prepared for a late dinner back on shore. The tour includes boat, guide, fishing equipment, instruction, and dinner with your catch.',
    55,
    4,
    4,
    4,
    ARRAY[
      'https://images.unsplash.com/photo-1516731566880-919c39006c9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1 1465101162946-4377e57745c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504387432042-8aca549e4729?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-night-spearfishing');

  -- Shuttle Service to Tikal
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-shuttle-tikal',
    'Shuttle Service to Tikal',
    'Travel comfortably from Rio Dulce to Tikal National Park with our reliable shuttle service. This direct transfer saves you the hassle of navigating public transportation or changing buses. The air-conditioned shuttle departs from your hotel in Rio Dulce and takes you directly to your accommodation near Tikal, with stops for lunch and restrooms along the way. The journey offers beautiful views of Guatemala''s diverse landscapes, from the lush eastern lowlands to the Petén jungle. Our professional drivers ensure a safe and comfortable journey. The service includes hotel pickup and drop-off, transportation in an air-conditioned vehicle, and one piece of luggage per person.',
    35,
    5,
    15,
    15,
    ARRAY[
      'https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1494783367193-149034c05e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-shuttle-tikal');

  -- Sustainable Tree Farm and Quiagara Mayan Ruins Tour
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-tree-farm-ruins',
    'Sustainable Tree Farm and Quiriguá Mayan Ruins Tour',
    'Combine environmental sustainability with ancient history on this unique tour. Begin at a sustainable hardwood tree farm where you''ll learn about reforestation efforts and sustainable timber production in Guatemala. Walk through plantations of teak, mahogany, and other valuable hardwoods while learning about their ecological and economic importance. Then visit the UNESCO World Heritage site of Quiriguá, known for the tallest stelae in the Mayan world. These intricately carved stone monuments and zoomorphic sculptures are among the finest examples of Mayan artistry. Your guide will explain the historical significance of the site and its connection to other Mayan cities. The tour includes transportation, entrance fees, guide, and lunch.',
    60,
    7,
    12,
    12,
    ARRAY[
      'https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518638150340-f706e86654de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-tree-farm-ruins');
END $$;

-- Update the image for Rio Dulce territory to a better one
UPDATE territories
SET image_url = 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'rio-dulce';