-- Use a simpler approach - create a default guide ID for each region
-- and use it for all experiences in that region

-- First, make sure the territories exist
INSERT INTO territories (id, name, description, image_url)
VALUES 
  ('tikal', 'Tikal', 'Tikal is one of the largest archaeological sites and urban centers of the pre-Columbian Maya civilization. It is located in the archaeological region of the Petén Basin in northern Guatemala.', 'https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'),
  ('semuc-champey', 'Semuc Champey', 'Semuc Champey is a natural monument in the department of Alta Verapaz, Guatemala, near the Q''eqchi'' Maya town of Lanquín. It consists of a natural 300m limestone bridge, under which passes the Cahabón River.', 'https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'),
  ('chichicastenango', 'Chichicastenango', 'Chichicastenango is a town in the El Quiché department of Guatemala, known for its traditional K''iche'' Maya culture. The town has been a center for trade between Maya villages of the highlands for centuries.', 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- For Tikal experiences
DO $$
DECLARE
  guide_id uuid;
BEGIN
  -- First check if we already have a guide for this region
  SELECT id INTO guide_id FROM profiles 
  WHERE territory_id = 'tikal' AND role = 'tour_guide' 
  LIMIT 1;
  
  -- If no guide exists, use a default ID
  IF guide_id IS NULL THEN
    -- Use the ID of any existing user as a fallback
    SELECT id INTO guide_id FROM profiles LIMIT 1;
  END IF;
  
  -- Add experiences for Tikal using the guide ID
  IF guide_id IS NOT NULL THEN
    -- El Mirador Helicopter Tour
    INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
    VALUES (
      'tikal-el-mirador',
      'El Mirador Helicopter Tour',
      'Take a helicopter tour from Tikal to El Mirador, one of the largest and oldest Mayan cities, deep in the jungle. This remote archaeological site features La Danta, one of the largest pyramids in the world by volume.',
      350,
      8,
      6,
      6,
      ARRAY['https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
      'tikal',
      guide_id
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Yaxhá Sunset Tour
    INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
    VALUES (
      'tikal-yaxha-sunset',
      'Yaxhá Sunset Tour',
      'Visit the archaeological site of Yaxhá, located between two lakes and featured in Survivor: Guatemala. Climb Temple 216 to watch the sunset over the jungle and lakes while enjoying a glass of wine.',
      70,
      6,
      12,
      12,
      ARRAY['https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
      'tikal',
      guide_id
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- For Semuc Champey experiences
DO $$
DECLARE
  guide_id uuid;
BEGIN
  -- First check if we already have a guide for this region
  SELECT id INTO guide_id FROM profiles 
  WHERE territory_id = 'semuc-champey' AND role = 'tour_guide' 
  LIMIT 1;
  
  -- If no guide exists, use a default ID
  IF guide_id IS NULL THEN
    -- Use the ID of any existing user as a fallback
    SELECT id INTO guide_id FROM profiles LIMIT 1;
  END IF;
  
  -- Add experiences for Semuc Champey using the guide ID
  IF guide_id IS NOT NULL THEN
    -- Semuc Champey Full Day Adventure
    INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
    VALUES (
      'semuc-full-day',
      'Semuc Champey Full Day Adventure',
      'Experience all that Semuc Champey has to offer in this comprehensive day tour. Hike to the El Mirador viewpoint, swim in the turquoise pools, explore the K''anba Cave with candles, and enjoy river tubing on the Cahabón River.',
      60,
      8,
      15,
      15,
      ARRAY['https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
      'semuc-champey',
      guide_id
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- K'anba Cave Candlelight Adventure
    INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
    VALUES (
      'semuc-caves',
      'K''anba Cave Candlelight Adventure',
      'Explore the mysterious K''anba Cave by candlelight on this unique adventure. Wade through underground rivers, climb waterfalls, and discover stunning cave formations with only the light of your candle to guide you.',
      40,
      3,
      10,
      10,
      ARRAY['https://images.unsplash.com/photo-1520646924885-a4de175dc025?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1520646924885-a4de175dc025?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
      'semuc-champey',
      guide_id
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Cahabón River Tubing
    INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
    VALUES (
      'semuc-river-tubing',
      'Cahabón River Tubing',
      'Float down the scenic Cahabón River on an inner tube, enjoying the lush jungle scenery and refreshing waters. This relaxing adventure offers a different perspective of the Semuc Champey region.',
      25,
      2,
      12,
      12,
      ARRAY['https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
      'semuc-champey',
      guide_id
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Traditional Chocolate Making Workshop
    INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
    VALUES (
      'semuc-chocolate-making',
      'Traditional Chocolate Making Workshop',
      'Learn how to make chocolate from scratch using traditional Q''eqchi'' Maya methods. Harvest cacao pods, roast and grind the beans, and create your own chocolate treats to take home.',
      35,
      3,
      8,
      8,
      ARRAY['https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
      'semuc-champey',
      guide_id
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Overnight Jungle Camping Experience
    INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
    VALUES (
      'semuc-overnight',
      'Overnight Jungle Camping Experience',
      'Spend the night in the jungle near Semuc Champey in a comfortable camping setup. Enjoy an evening campfire, night hike to spot nocturnal wildlife, and early morning bird watching before the day tourists arrive.',
      80,
      20,
      8,
      8,
      ARRAY['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
      'semuc-champey',
      guide_id
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- For Chichicastenango experiences
DO $$
DECLARE
  guide_id uuid;
BEGIN
  -- First check if we already have a guide for this region
  SELECT id INTO guide_id FROM profiles 
  WHERE territory_id = 'chichicastenango' AND role = 'tour_guide' 
  LIMIT 1;
  
  -- If no guide exists, use a default ID
  IF guide_id IS NULL THEN
    -- Use the ID of any existing user as a fallback
    SELECT id INTO guide_id FROM profiles LIMIT 1;
  END IF;
  
  -- Add experiences for Chichicastenango using the guide ID
  IF guide_id IS NOT NULL THEN
    -- Chichicastenango Market Insider Tour
    INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
    VALUES (
      'chichi-market-tour',
      'Chichicastenango Market Insider Tour',
      'Navigate the famous Chichicastenango market with a local guide who knows all its secrets. Explore the labyrinth of stalls selling textiles, masks, pottery, and produce. Learn bargaining techniques and the cultural significance of traditional crafts.',
      35,
      4,
      10,
      10,
      ARRAY['https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
      'chichicastenango',
      guide_id
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Traditional Mask Making Workshop
    INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
    VALUES (
      'chichi-mask-making',
      'Traditional Mask Making Workshop',
      'Learn the art of traditional Guatemalan mask making from master artisans. These colorful masks are used in traditional dances and ceremonies. Create your own mask to take home as a unique souvenir.',
      40,
      3,
      8,
      8,
      ARRAY['https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
      'chichicastenango',
      guide_id
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Santo Tomás Church Cultural Tour
    INSERT