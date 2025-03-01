-- Create a simpler migration that doesn't rely on complex PL/pgSQL blocks
-- First, ensure the territories exist
INSERT INTO territories (id, name, description, image_url)
VALUES 
  ('tikal', 'Tikal', 'Tikal is one of the largest archaeological sites and urban centers of the pre-Columbian Maya civilization. It is located in the archaeological region of the Petén Basin in northern Guatemala.', 'https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'),
  ('semuc-champey', 'Semuc Champey', 'Semuc Champey is a natural monument in the department of Alta Verapaz, Guatemala, near the Q''eqchi'' Maya town of Lanquín. It consists of a natural 300m limestone bridge, under which passes the Cahabón River.', 'https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'),
  ('chichicastenango', 'Chichicastenango', 'Chichicastenango is a town in the El Quiché department of Guatemala, known for its traditional K''iche'' Maya culture. The town has been a center for trade between Maya villages of the highlands for centuries.', 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- Create a default guide for each region if needed
-- We'll use a simpler approach without PL/pgSQL blocks
-- First, create a temporary table to store guide IDs
CREATE TEMPORARY TABLE temp_guides (
  territory_id text PRIMARY KEY,
  guide_id uuid
);

-- Insert a row for each territory with a NULL guide_id
INSERT INTO temp_guides (territory_id, guide_id)
VALUES 
  ('tikal', NULL),
  ('semuc-champey', NULL),
  ('chichicastenango', NULL);

-- Update the guide_id for each territory if a guide exists
UPDATE temp_guides t
SET guide_id = p.id
FROM profiles p
WHERE p.territory_id = t.territory_id
AND p.role = 'tour_guide'
AND p.id IS NOT NULL;

-- For any territory without a guide, use the first profile as a fallback
UPDATE temp_guides t
SET guide_id = (SELECT id FROM profiles LIMIT 1)
WHERE t.guide_id IS NULL;

-- Now add experiences for Tikal
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
  guide_id
FROM temp_guides
WHERE territory_id = 'tikal'
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
  guide_id
FROM temp_guides
WHERE territory_id = 'tikal'
ON CONFLICT (id) DO NOTHING;

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
  guide_id
FROM temp_guides
WHERE territory_id = 'semuc-champey'
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
  guide_id
FROM temp_guides
WHERE territory_id = 'semuc-champey'
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
  guide_id
FROM temp_guides
WHERE territory_id = 'semuc-champey'
ON CONFLICT (id) DO NOTHING;

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
  guide_id
FROM temp_guides
WHERE territory_id = 'chichicastenango'
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
  guide_id
FROM temp_guides
WHERE territory_id = 'chichicastenango'
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
  guide_id
FROM temp_guides
WHERE territory_id = 'chichicastenango'
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
  guide_id
FROM temp_guides
WHERE territory_id = 'chichicastenango'
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
  guide_id
FROM temp_guides
WHERE territory_id = 'chichicastenango'
ON CONFLICT (id) DO NOTHING;

-- Drop the temporary table
DROP TABLE temp_guides;