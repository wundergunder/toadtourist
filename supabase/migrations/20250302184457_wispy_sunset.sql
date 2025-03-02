/*
  # Add Experience Images

  1. New Images
    - Add high-quality images for experiences across different territories
    - Update existing experiences with better image URLs
  2. Changes
    - Ensure all experiences have multiple images
    - Use high-quality, relevant Unsplash images
*/

-- Update existing experiences with better images
UPDATE experiences
SET image_urls = ARRAY[
  'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1572125675722-238a4f1f4ea2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1623991618729-acd138770029?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
]
WHERE id = 'jungle-kayaking';

UPDATE experiences
SET image_urls = ARRAY[
  'https://images.unsplash.com/photo-1566559532215-bbc9b4cc6d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1604152135912-04a022e23696?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
]
WHERE id = 'mayan-cooking';

UPDATE experiences
SET image_urls = ARRAY[
  'https://images.unsplash.com/photo-1596786232430-dfa08ebf4e7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1588392382834-a891154bca4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
]
WHERE id = 'waterfall-trek';

-- Add new experiences for Antigua Guatemala
INSERT INTO experiences (
  id, title, description, price, duration, max_spots, available_spots, 
  image_urls, territory_id, guide_id
)
SELECT 
  'antigua-coffee-tour',
  'Coffee Farm Tour & Tasting',
  'Visit a traditional coffee farm on the slopes of Volcán de Agua and learn about the entire coffee production process from bean to cup. This hands-on experience includes walking through coffee plantations, observing the harvesting process (seasonal), and participating in coffee processing. The tour culminates with a professional coffee tasting session where you''ll learn to identify different flavor notes and qualities of Guatemalan coffee.',
  40,
  4,
  12,
  12,
  ARRAY[
    'https://images.unsplash.com/photo-1611174275735-af3bf5653e7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1498804103079-a6351b050096?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  ],
  'antigua-guatemala',
  (SELECT id FROM profiles WHERE roles @> ARRAY['tour_guide']::text[] LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'antigua-coffee-tour');

INSERT INTO experiences (
  id, title, description, price, duration, max_spots, available_spots, 
  image_urls, territory_id, guide_id
)
SELECT 
  'antigua-cooking-class',
  'Traditional Guatemalan Cooking Class',
  'Learn to prepare authentic Guatemalan dishes in a colonial home kitchen. This immersive cooking class begins with a visit to the local market to select fresh ingredients, followed by hands-on preparation of traditional dishes like pepián (meat stew), chiles rellenos (stuffed peppers), and rellenitos (plantain dessert). Enjoy your creations for lunch along with stories about the cultural significance of each dish.',
  55,
  5,
  8,
  8,
  ARRAY[
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1605197161470-5d2a9af0ac7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  ],
  'antigua-guatemala',
  (SELECT id FROM profiles WHERE roles @> ARRAY['tour_guide']::text[] LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'antigua-cooking-class');

-- Add experiences for Lake Atitlan
INSERT INTO experiences (
  id, title, description, price, duration, max_spots, available_spots, 
  image_urls, territory_id, guide_id
)
SELECT 
  'atitlan-kayak-adventure',
  'Lake Atitlán Kayaking Adventure',
  'Paddle across the crystal-clear waters of Lake Atitlán on this guided kayaking tour. Starting from Panajachel, you''ll kayak along the shoreline, taking in breathtaking views of the surrounding volcanoes and visiting small lakeside Mayan villages. Stop at a secluded beach for swimming and enjoy a picnic lunch with local specialties. This tour is suitable for beginners and includes all necessary equipment.',
  45,
  4,
  10,
  10,
  ARRAY[
    'https://images.unsplash.com/photo-1472745942893-4b9f730c7668?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1617224908579-c92008fc08bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  ],
  'lake-atitlan',
  (SELECT id FROM profiles WHERE roles @> ARRAY['tour_guide']::text[] LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'atitlan-kayak-adventure');

INSERT INTO experiences (
  id, title, description, price, duration, max_spots, available_spots, 
  image_urls, territory_id, guide_id
)
SELECT 
  'atitlan-weaving-workshop',
  'Traditional Mayan Weaving Workshop',
  'Learn the ancient art of backstrap loom weaving from skilled Mayan artisans in San Juan La Laguna. This hands-on workshop begins with an explanation of the cultural significance of textiles in Mayan culture and the natural dyeing process using local plants. You''ll then learn the basics of backstrap loom weaving and create your own small textile piece to take home as a unique souvenir.',
  35,
  3,
  8,
  8,
  ARRAY[
    'https://images.unsplash.com/photo-1529064541268-a5681a352d96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1617224908579-c92008fc08bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  ],
  'lake-atitlan',
  (SELECT id FROM profiles WHERE roles @> ARRAY['tour_guide']::text[] LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'atitlan-weaving-workshop');

-- Add experiences for Tikal
INSERT INTO experiences (
  id, title, description, price, duration, max_spots, available_spots, 
  image_urls, territory_id, guide_id
)
SELECT 
  'tikal-sunrise-tour',
  'Tikal Sunrise Archaeological Tour',
  'Experience the magic of Tikal at sunrise, when the ancient city awakens with the sounds of howler monkeys and tropical birds. This early morning tour takes you to Temple IV, the tallest structure in Tikal, to watch the sunrise over the jungle canopy and ancient temples. As the day brightens, your expert guide will lead you through the main plazas, temples, and palaces, explaining the history and significance of this powerful Mayan kingdom.',
  65,
  6,
  15,
  15,
  ARRAY[
    'https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518638150340-f706e86654de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  ],
  'tikal',
  (SELECT id FROM profiles WHERE roles @> ARRAY['tour_guide']::text[] LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'tikal-sunrise-tour');

INSERT INTO experiences (
  id, title, description, price, duration, max_spots, available_spots, 
  image_urls, territory_id, guide_id
)
SELECT 
  'tikal-night-tour',
  'Tikal Night Tour & Stargazing',
  'Discover the mysteries of Tikal after dark on this unique night tour. As the sun sets, the ancient city takes on a mystical atmosphere. Your guide will lead you through the Great Plaza and Central Acropolis, sharing stories of Mayan astronomy, rituals, and legends. After exploring the ruins by flashlight, enjoy a traditional Mayan dinner followed by stargazing with an astronomy expert who will point out constellations and explain their significance in Mayan cosmology.',
  75,
  4,
  12,
  12,
  ARRAY[
    'https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  ],
  'tikal',
  (SELECT id FROM profiles WHERE roles @> ARRAY['tour_guide']::text[] LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'tikal-night-tour');

-- Add experiences for Semuc Champey
INSERT INTO experiences (
  id, title, description, price, duration, max_spots, available_spots, 
  image_urls, territory_id, guide_id
)
SELECT 
  'semuc-champey-adventure',
  'Semuc Champey Full Day Adventure',
  'Experience all that Semuc Champey has to offer in this comprehensive day tour. Hike to the El Mirador viewpoint for a breathtaking panoramic view of the limestone pools, then descend to swim in the crystal-clear turquoise waters. The adventure continues with exploration of the K''anba Cave by candlelight, where you''ll wade through underground rivers and climb small waterfalls. The day concludes with river tubing down the Cahabón River.',
  60,
  8,
  15,
  15,
  ARRAY[
    'https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596786232430-dfa08ebf4e7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1588392382834-a891154bca4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  ],
  'semuc-champey',
  (SELECT id FROM profiles WHERE roles @> ARRAY['tour_guide']::text[] LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'semuc-champey-adventure');

-- Add experiences for Chichicastenango
INSERT INTO experiences (
  id, title, description, price, duration, max_spots, available_spots, 
  image_urls, territory_id, guide_id
)
SELECT 
  'chichi-market-tour',
  'Chichicastenango Market Insider Tour',
  'Navigate the famous Chichicastenango market with a local guide who knows all its secrets. Explore the labyrinth of stalls selling textiles, masks, pottery, and produce. Learn bargaining techniques and the cultural significance of traditional crafts. Visit the Santo Tomás Church to observe the fascinating blend of Catholic and Maya traditions, and meet local artisans who will demonstrate their craft techniques.',
  35,
  4,
  10,
  10,
  ARRAY[
    'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1605216663980-b7ca6e9f2451?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  ],
  'chichicastenango',
  (SELECT id FROM profiles WHERE roles @> ARRAY['tour_guide']::text[] LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'chichi-market-tour');

-- Update territory images with better quality images
UPDATE territories
SET image_url = 'https://images.unsplash.com/photo-1605216663980-b7ca6e9f2451?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'antigua-guatemala';

UPDATE territories
SET image_url = 'https://images.unsplash.com/photo-1617224908579-c92008fc08bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'lake-atitlan';

UPDATE territories
SET image_url = 'https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'tikal';

UPDATE territories
SET image_url = 'https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'semuc-champey';

UPDATE territories
SET image_url = 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'chichicastenango';

UPDATE territories
SET image_url = 'https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'flores-yaxha';

UPDATE territories
SET image_url = 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'rio-dulce';