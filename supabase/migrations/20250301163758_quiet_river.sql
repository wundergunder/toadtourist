-- Create guides for each region using auth.users first
-- For Tikal guide
DO $$
DECLARE
  guide_id uuid;
BEGIN
  -- Check if guide already exists
  SELECT id INTO guide_id FROM profiles WHERE email = 'guide.tikal@example.com' LIMIT 1;
  
  -- If guide doesn't exist, create one
  IF guide_id IS NULL THEN
    -- Create auth user first with a specific ID
    guide_id := gen_random_uuid();
    
    -- Check if this ID already exists in profiles
    WHILE EXISTS (SELECT 1 FROM profiles WHERE id = guide_id) LOOP
      guide_id := gen_random_uuid();
    END LOOP;
    
    -- Insert into auth.users
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      guide_id,
      'guide.tikal@example.com',
      '{"full_name": "Carlos Xol", "role": "tour_guide"}'
    );
    
    -- Create profile
    INSERT INTO profiles (id, email, full_name, role, territory_id)
    VALUES (
      guide_id,
      'guide.tikal@example.com',
      'Carlos Xol',
      'tour_guide',
      'tikal'
    );
  END IF;
END $$;

-- Add experiences for Tikal
INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT
  'tikal-el-mirador',
  'El Mirador Helicopter Tour',
  'Take a helicopter tour from Tikal to El Mirador, one of the largest and oldest Mayan cities, deep in the jungle. This remote archaeological site features La Danta, one of the largest pyramids in the world by volume.',
  350,
  8,
  6,
  6,
  ARRAY['https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
  'tikal',
  id
FROM profiles
WHERE email = 'guide.tikal@example.com'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT
  'tikal-yaxha-sunset',
  'Yaxhá Sunset Tour',
  'Visit the archaeological site of Yaxhá, located between two lakes and featured in Survivor: Guatemala. Climb Temple 216 to watch the sunset over the jungle and lakes while enjoying a glass of wine.',
  70,
  6,
  12,
  12,
  ARRAY['https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
  'tikal',
  id
FROM profiles
WHERE email = 'guide.tikal@example.com'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- For Semuc Champey guide
DO $$
DECLARE
  guide_id uuid;
BEGIN
  -- Check if guide already exists
  SELECT id INTO guide_id FROM profiles WHERE email = 'guide.semuc@example.com' LIMIT 1;
  
  -- If guide doesn't exist, create one
  IF guide_id IS NULL THEN
    -- Create auth user first with a specific ID
    guide_id := gen_random_uuid();
    
    -- Check if this ID already exists in profiles
    WHILE EXISTS (SELECT 1 FROM profiles WHERE id = guide_id) LOOP
      guide_id := gen_random_uuid();
    END LOOP;
    
    -- Insert into auth.users
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      guide_id,
      'guide.semuc@example.com',
      '{"full_name": "Ana Caal", "role": "tour_guide"}'
    );
    
    -- Create profile
    INSERT INTO profiles (id, email, full_name, role, territory_id)
    VALUES (
      guide_id,
      'guide.semuc@example.com',
      'Ana Caal',
      'tour_guide',
      'semuc-champey'
    );
  END IF;
END $$;

-- Add experiences for Semuc Champey
INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT
  'semuc-full-day',
  'Semuc Champey Full Day Adventure',
  'Experience all that Semuc Champey has to offer in this comprehensive day tour. Hike to the El Mirador viewpoint, swim in the turquoise pools, explore the K''anba Cave with candles, and enjoy river tubing on the Cahabón River.',
  60,
  8,
  15,
  15,
  ARRAY['https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
  'semuc-champey',
  id
FROM profiles
WHERE email = 'guide.semuc@example.com'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT
  'semuc-caves',
  'K''anba Cave Candlelight Adventure',
  'Explore the mysterious K''anba Cave by candlelight on this unique adventure. Wade through underground rivers, climb waterfalls, and discover stunning cave formations with only the light of your candle to guide you.',
  40,
  3,
  10,
  10,
  ARRAY['https://images.unsplash.com/photo-1520646924885-a4de175dc025?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1520646924885-a4de175dc025?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
  'semuc-champey',
  id
FROM profiles
WHERE email = 'guide.semuc@example.com'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT
  'semuc-river-tubing',
  'Cahabón River Tubing',
  'Float down the scenic Cahabón River on an inner tube, enjoying the lush jungle scenery and refreshing waters. This relaxing adventure offers a different perspective of the Semuc Champey region.',
  25,
  2,
  12,
  12,
  ARRAY['https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
  'semuc-champey',
  id
FROM profiles
WHERE email = 'guide.semuc@example.com'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT
  'semuc-chocolate-making',
  'Traditional Chocolate Making Workshop',
  'Learn how to make chocolate from scratch using traditional Q''eqchi'' Maya methods. Harvest cacao pods, roast and grind the beans, and create your own chocolate treats to take home.',
  35,
  3,
  8,
  8,
  ARRAY['https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
  'semuc-champey',
  id
FROM profiles
WHERE email = 'guide.semuc@example.com'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT
  'semuc-overnight',
  'Overnight Jungle Camping Experience',
  'Spend the night in the jungle near Semuc Champey in a comfortable camping setup. Enjoy an evening campfire, night hike to spot nocturnal wildlife, and early morning bird watching before the day tourists arrive.',
  80,
  20,
  8,
  8,
  ARRAY['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
  'semuc-champey',
  id
FROM profiles
WHERE email = 'guide.semuc@example.com'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- For Chichicastenango guide
DO $$
DECLARE
  guide_id uuid;
BEGIN
  -- Check if guide already exists
  SELECT id INTO guide_id FROM profiles WHERE email = 'guide.chichi@example.com' LIMIT 1;
  
  -- If guide doesn't exist, create one
  IF guide_id IS NULL THEN
    -- Create auth user first with a specific ID
    guide_id := gen_random_uuid();
    
    -- Check if this ID already exists in profiles
    WHILE EXISTS (SELECT 1 FROM profiles WHERE id = guide_id) LOOP
      guide_id := gen_random_uuid();
    END LOOP;
    
    -- Insert into auth.users
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      guide_id,
      'guide.chichi@example.com',
      '{"full_name": "Luisa Toj", "role": "tour_guide"}'
    );
    
    -- Create profile
    INSERT INTO profiles (id, email, full_name, role, territory_id)
    VALUES (
      guide_id,
      'guide.chichi@example.com',
      'Luisa Toj',
      'tour_guide',
      'chichicastenango'
    );
  END IF;
END $$;

-- Add experiences for Chichicastenango
INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT
  'chichi-market-tour',
  'Chichicastenango Market Insider Tour',
  'Navigate the famous Chichicastenango market with a local guide who knows all its secrets. Explore the labyrinth of stalls selling textiles, masks, pottery, and produce. Learn bargaining techniques and the cultural significance of traditional crafts.',
  35,
  4,
  10,
  10,
  ARRAY['https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
  'chichicastenango',
  id
FROM profiles
WHERE email = 'guide.chichi@example.com'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT
  'chichi-mask-making',
  'Traditional Mask Making Workshop',
  'Learn the art of traditional Guatemalan mask making from master artisans. These colorful masks are used in traditional dances and ceremonies. Create your own mask to take home as a unique souvenir.',
  40,
  3,
  8,
  8,
  ARRAY['https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
  'chichicastenango',
  id
FROM profiles
WHERE email = 'guide.chichi@example.com'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT
  'chichi-santo-tomas',
  'Santo Tomás Church Cultural Tour',
  'Explore the 400-year-old Santo Tomás Church where Catholic and Maya traditions blend in fascinating ways. Witness indigenous spiritual practices on the church steps and learn about the unique religious syncretism of the K''iche'' Maya people.',
  30,
  2,
  12,
  12,
  ARRAY['https://images.unsplash.com/photo-1605216663980-b7ca6e9f2451?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1605216663980-b7ca6e9f2451?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
  'chichicastenango',
  id
FROM profiles
WHERE email = 'guide.chichi@example.com'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT
  'chichi-textile-tour',
  'Textile Traditions & Weaving Demonstration',
  'Discover the rich textile traditions of the K''iche'' Maya people. Learn about the symbolism in the patterns, the natural dyeing process, and watch skilled weavers demonstrate the backstrap loom technique that has been used for centuries.',
  35,
  3,
  10,
  10,
  ARRAY['https://images.unsplash.com/photo-1529064541268-a5681a352d96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1529064541268-a5681a352d96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
  'chichicastenango',
  id
FROM profiles
WHERE email = 'guide.chichi@example.com'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT
  'chichi-cooking-class',
  'K''iche'' Maya Cooking Class',
  'Learn to prepare traditional K''iche'' Maya dishes in this hands-on cooking class. Visit the market to select ingredients, then create dishes like pepián, subanik, and traditional corn tortillas. Enjoy your creations for lunch.',
  45,
  5,
  8,
  8,
  ARRAY['https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'],
  'chichicastenango',
  id
FROM profiles
WHERE email = 'guide.chichi@example.com'
LIMIT 1
ON CONFLICT (id) DO NOTHING;