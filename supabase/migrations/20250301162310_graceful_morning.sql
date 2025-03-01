/*
  # Add Guatemala Regions and Experiences
  
  1. New Data
    - 5 new territories (regions) in Guatemala
    - 10 sample experiences for each region
    - Each experience has detailed information and images
  
  2. Regions Added:
    - Antigua Guatemala
    - Lake Atitlán
    - Tikal
    - Semuc Champey
    - Chichicastenango
*/

-- Add Antigua Guatemala region
INSERT INTO territories (id, name, description, image_url)
VALUES (
  'antigua-guatemala',
  'Antigua Guatemala',
  'A UNESCO World Heritage site known for its preserved Spanish Baroque architecture, cobblestone streets, and vibrant cultural scene. Surrounded by three volcanoes, this colonial gem offers a perfect blend of history, culture, and natural beauty. Visitors can explore ancient churches, monasteries, and plazas while enjoying the city''s renowned coffee, chocolate, and culinary traditions.',
  'https://images.unsplash.com/photo-1605216663980-b7ca6e9f2451?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- Add Lake Atitlán region
INSERT INTO territories (id, name, description, image_url)
VALUES (
  'lake-atitlan',
  'Lake Atitlán',
  'Often described as one of the most beautiful lakes in the world, Lake Atitlán is a stunning volcanic crater lake surrounded by picturesque villages and three majestic volcanoes. Each village around the lake has its own distinct character and traditions, offering visitors a chance to experience authentic Mayan culture. The lake provides opportunities for kayaking, swimming, hiking, and spiritual retreats.',
  'https://images.unsplash.com/photo-1617224908579-c92008fc08bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- Add Tikal region
INSERT INTO territories (id, name, description, image_url)
VALUES (
  'tikal',
  'Tikal',
  'One of the largest and most important archaeological sites of the ancient Mayan civilization, Tikal is a UNESCO World Heritage site located in the heart of the Guatemalan rainforest. The massive temples and palaces rising above the jungle canopy create an awe-inspiring sight. Visitors can explore ancient plazas, temples, and residential complexes while spotting wildlife like howler monkeys, toucans, and coatis.',
  'https://images.unsplash.com/photo-1591781696307-20653c66df86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- Add Semuc Champey region
INSERT INTO territories (id, name, description, image_url)
VALUES (
  'semuc-champey',
  'Semuc Champey',
  'A natural wonder hidden in the dense jungle of central Guatemala, Semuc Champey features a 300-meter limestone bridge with a series of stepped, turquoise pools flowing on top. Below, the Cahabón River disappears underground, creating this unique geological formation. Visitors can swim in the crystal-clear pools, hike to the El Mirador viewpoint, explore nearby caves, and tube down the river.',
  'https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- Add Chichicastenango region
INSERT INTO territories (id, name, description, image_url)
VALUES (
  'chichicastenango',
  'Chichicastenango',
  'Famous for hosting one of the largest and most vibrant indigenous markets in Central America, Chichicastenango (often called "Chichi") offers an authentic glimpse into traditional K''iche'' Maya culture. The twice-weekly market fills the streets with colorful textiles, handicrafts, flowers, and local produce. The town is also home to the 400-year-old Santo Tomás Church, where Maya and Catholic traditions blend in fascinating ways.',
  'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- Create a sample guide for each region if none exists
DO $$
DECLARE
  guide_id uuid;
  guide_email text;
  guide_name text;
  territory_id text;
BEGIN
  -- For Antigua Guatemala
  territory_id := 'antigua-guatemala';
  guide_email := 'guide.antigua@example.com';
  guide_name := 'Isabella Morales';
  
  -- Check if guide exists
  SELECT id INTO guide_id FROM profiles WHERE email = guide_email LIMIT 1;
  
  -- If guide doesn't exist, create one
  IF guide_id IS NULL THEN
    guide_id := gen_random_uuid();
    
    INSERT INTO profiles (id, email, full_name, role, territory_id)
    VALUES (guide_id, guide_email, guide_name, 'tour_guide', territory_id);
  END IF;
  
  -- Add experiences for Antigua Guatemala
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('antigua-coffee-tour', 'Coffee Farm & Tasting Tour', 'Visit a working coffee plantation and learn about the entire process from seed to cup. Guatemala is known for its exceptional coffee, and this tour takes you through the cultivation, harvesting, processing, and roasting stages. End with a guided tasting of different coffee varieties.', 35, 3, 12, 12, ARRAY['https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('antigua-cooking-class', 'Traditional Guatemalan Cooking Class', 'Learn to prepare authentic Guatemalan dishes in this hands-on cooking class. Start with a visit to the local market to select fresh ingredients, then create traditional dishes like pepián, chiles rellenos, and rellenitos under the guidance of a local chef.', 45, 4, 8, 8, ARRAY['https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('pacaya-volcano-hike', 'Pacaya Volcano Sunset Hike', 'Hike up the active Pacaya Volcano and witness stunning sunset views. This guided trek takes you through pine forests to the volcanic plateau where you can see flowing lava (when active) and roast marshmallows using the volcano''s heat.', 40, 5, 15, 15, ARRAY['https://images.unsplash.com/photo-1621415814107-24ee5f6fa548?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1621415814107-24ee5f6fa548?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('antigua-chocolate-workshop', 'Chocolate Making Workshop', 'Discover the ancient Mayan chocolate traditions in this interactive workshop. Learn about cacao cultivation, processing, and create your own chocolate bars and drinks using traditional methods and local ingredients.', 30, 2, 10, 10, ARRAY['https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('antigua-photography-tour', 'Colonial Architecture Photography Tour', 'Capture the beauty of Antigua''s colonial architecture on this guided photography tour. Visit the most photogenic spots in the city, learn composition techniques, and discover the history behind the stunning buildings and ruins.', 35, 3, 8, 8, ARRAY['https://images.unsplash.com/photo-1605216663980-b7ca6e9f2451?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1605216663980-b7ca6e9f2451?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('antigua-textile-workshop', 'Traditional Textile Workshop', 'Learn about Guatemala''s rich textile traditions in this hands-on workshop. Study the symbolism in Mayan weaving patterns, try backstrap loom weaving, and create your own small textile piece to take home.', 40, 4, 6, 6, ARRAY['https://images.unsplash.com/photo-1529064541268-a5681a352d96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1529064541268-a5681a352d96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('antigua-macadamia-farm', 'Macadamia Farm & Sustainability Tour', 'Visit an organic macadamia farm that combines sustainable agriculture with social responsibility. Learn about their reforestation efforts, sample macadamia products, and enjoy a pancake breakfast with fresh macadamia butter.', 25, 3, 15, 15, ARRAY['https://images.unsplash.com/photo-1600189020840-e9918c25269d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600189020840-e9918c25269d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('antigua-salsa-dancing', 'Salsa Dancing Night', 'Learn the basics of salsa dancing from professional instructors, then put your skills to the test at a local dance venue. No experience necessary - just bring your enthusiasm and dancing shoes!', 30, 4, 20, 20, ARRAY['https://images.unsplash.com/photo-1504609813442-a9924e2e4531?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1504609813442-a9924e2e4531?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('antigua-jade-workshop', 'Jade Jewelry Workshop', 'Learn about the cultural significance of jade in Mayan civilization and create your own jade jewelry piece under the guidance of skilled artisans. Take home your handcrafted jade pendant or earrings.', 50, 3, 8, 8, ARRAY['https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('antigua-street-food-tour', 'Street Food & Local Eats Tour', 'Sample the best of Antigua''s street food and local eateries on this guided culinary adventure. Try traditional dishes like chuchitos, rellenitos, atol, and more while learning about the cultural significance of each food.', 35, 3, 10, 10, ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  -- For Lake Atitlán
  territory_id := 'lake-atitlan';
  guide_email := 'guide.atitlan@example.com';
  guide_name := 'Miguel Tzul';
  
  -- Check if guide exists
  SELECT id INTO guide_id FROM profiles WHERE email = guide_email LIMIT 1;
  
  -- If guide doesn't exist, create one
  IF guide_id IS NULL THEN
    guide_id := gen_random_uuid();
    
    INSERT INTO profiles (id, email, full_name, role, territory_id)
    VALUES (guide_id, guide_email, guide_name, 'tour_guide', territory_id);
  END IF;
  
  -- Add experiences for Lake Atitlán
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('atitlan-village-tour', 'Three Villages Boat Tour', 'Explore three distinct Mayan villages around Lake Atitlán by boat. Visit San Juan La Laguna known for natural dye textiles, Santiago Atitlán to see the folk saint Maximón, and San Pedro La Laguna with its vibrant art scene.', 45, 6, 12, 12, ARRAY['https://images.unsplash.com/photo-1617224908579-c92008fc08bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1617224908579-c92008fc08bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('atitlan-kayak-adventure', 'Sunrise Kayaking Adventure', 'Paddle across the calm morning waters of Lake Atitlán as the sun rises over the volcanoes. This guided kayaking tour offers breathtaking views and the chance to spot local fishermen using traditional fishing methods.', 35, 3, 8, 8, ARRAY['https://images.unsplash.com/photo-1472152083436-a6eede6efad9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1472152083436-a6eede6efad9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('san-pedro-volcano-hike', 'San Pedro Volcano Hike', 'Challenge yourself with this guided hike up San Pedro Volcano. The trail winds through coffee plantations and cloud forest before reaching the summit, where you''ll enjoy panoramic views of Lake Atitlán and surrounding volcanoes.', 40, 5, 10, 10, ARRAY['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('atitlan-weaving-workshop', 'Traditional Backstrap Loom Weaving', 'Learn the ancient art of backstrap loom weaving from skilled Mayan women in San Juan La Laguna. Create your own small textile piece using traditional techniques and natural dyed threads.', 30, 3, 6, 6, ARRAY['https://images.unsplash.com/photo-1464820453369-31d2c0b651af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1464820453369-31d2c0b651af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('atitlan-coffee-tour', 'Organic Coffee Farm Tour', 'Visit a small-scale organic coffee farm on the slopes of San Pedro Volcano. Learn about sustainable coffee production, from seed to cup, and participate in coffee picking (seasonal). Includes coffee tasting and traditional lunch.', 35, 4, 10, 10, ARRAY['https://images.unsplash.com/photo-1611174275735-af1f4e9f4d30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1611174275735-af1f4e9f4d30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('atitlan-mayan-ceremony', 'Traditional Mayan Ceremony', 'Participate in an authentic Mayan spiritual ceremony led by a local shaman. Learn about ancient Mayan cosmology, calendar systems, and spiritual practices that continue to this day.', 40, 2, 8, 8, ARRAY['https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('atitlan-cooking-class', 'Mayan Home Cooking Class', 'Join a local family in their home to learn traditional Tz''utujil Mayan recipes. Prepare dishes like pepián, hilachas, and rellenitos using fresh, local ingredients, then enjoy the meal together.', 40, 4, 8, 8, ARRAY['https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('atitlan-paragliding', 'Paragliding Over Lake Atitlán', 'Soar like a bird over the stunning Lake Atitlán on this tandem paragliding adventure. Launch from the highlands above the lake and glide over the water with breathtaking views of the volcanoes and villages below.', 85, 2, 6, 6, ARRAY['https://images.unsplash.com/photo-1503507420689-7b961cc77da5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1503507420689-7b961cc77da5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('atitlan-medicinal-plants', 'Medicinal Plants Walk', 'Join a local healer to learn about traditional Mayan medicinal plants. Hike through diverse ecosystems around Lake Atitlán, identifying plants and learning about their healing properties and traditional uses.', 30, 3, 10, 10, ARRAY['https://images.unsplash.com/photo-1466780446965-2072a3de8a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1466780446965-2072a3de8a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('atitlan-stand-up-paddle', 'Stand-Up Paddleboarding', 'Explore Lake Atitlán on a stand-up paddleboard during this guided tour. Paddle along the shoreline, visit hidden coves, and enjoy the tranquility of the lake with volcanoes towering above. No experience necessary - beginners welcome!', 35, 2, 8, 8, ARRAY['https://images.unsplash.com/photo-1517176118179-65244903d13c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1517176118179-65244903d13c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  -- For Tikal
  territory_id := 'tikal';
  guide_email := 'guide.tikal@example.com';
  guide_name := 'Carlos Xol';
  
  -- Check if guide exists
  SELECT id INTO guide_id FROM profiles WHERE email = guide_email LIMIT 1;
  
  -- If guide doesn't exist, create one
  IF guide_id IS NULL THEN
    guide_id := gen_random_uuid();
    
    INSERT INTO profiles (id, email, full_name, role, territory_id)
    VALUES (guide_id, guide_email, guide_name, 'tour_guide', territory_id);
  END IF;
  
  -- Add experiences for Tikal
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('tikal-sunrise-tour', 'Tikal Sunrise Archaeological Tour', 'Experience the magic of Tikal at sunrise with this early morning tour. Watch the sun rise over the ancient temples while howler monkeys call from the jungle canopy. Your expert guide will share insights about Mayan history, architecture, and daily life.', 60, 6, 15, 15, ARRAY['https://images.unsplash.com/photo-1591781696307-20653c66df86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1591781696307-20653c66df86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('tikal-night-tour', 'Tikal After Dark: Nocturnal Wildlife Tour', 'Explore Tikal National Park after sunset to discover the nocturnal wildlife that emerges after dark. Spot kinkajous, night monkeys, tarantulas, and more with your expert guide. The ancient temples take on a mystical quality under the stars.', 50, 3, 10, 10, ARRAY['https://images.unsplash.com/photo-1566159196870-3f042aa7e3a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1566159196870-3f042aa7e3a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('tikal-birdwatching', 'Birdwatching in Tikal National Park', 'Tikal is a paradise for birdwatchers with over 300 species recorded in the park. Join our expert ornithologist for a guided birdwatching tour to spot toucans, parrots, trogons, and if you''re lucky, the elusive ocellated turkey.', 45, 4, 8, 8, ARRAY['https://images.unsplash.com/photo-1591608971362-f08b2a75731a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('tikal-photography', 'Photography Expedition: Temples & Wildlife', 'Capture the perfect shots of Tikal''s temples and wildlife on this photography-focused tour. Your guide will take you to the best vantage points and help you spot photogenic wildlife, while offering tips for temple and nature photography.', 55, 5, 8, 8, ARRAY['https://images.unsplash.com/photo-1591781696307-20653c66df86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1591781696307-20653c66df86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('tikal-camping', 'Overnight Camping in Tikal', 'Experience Tikal like few visitors do by camping overnight within the national park. Fall asleep to the sounds of the jungle and wake up to howler monkeys at dawn. Includes guided sunset and sunrise tours of the ruins.', 90, 24, 10, 10, ARRAY['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('tikal-archaeology', 'Archaeology Deep Dive: Beyond the Tourist Trail', 'Go beyond the main tourist areas to explore lesser-known archaeological sites within Tikal. This in-depth tour is led by an archaeologist who will share detailed information about Mayan construction techniques, hieroglyphs, and recent discoveries.', 65, 7, 8, 8, ARRAY['https://images.unsplash.com/photo-1591781696307-20653c66df86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1591781696307-20653c66df86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('tikal-astronomy', 'Mayan Astronomy Night', 'Learn about Mayan astronomy and how it influenced their architecture, calendar, and daily life. Observe the night sky as the ancient Maya did and discover how they tracked celestial bodies with remarkable precision.', 40, 3, 12, 12, ARRAY['https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('tikal-jungle-survival', 'Jungle Survival Skills Workshop', 'Learn basic jungle survival skills from local guides who grew up in the rainforest. Discover how to find water, identify edible plants, build a shelter, and navigate using natural landmarks.', 50, 5, 10, 10, ARRAY['https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('tikal-el-mirador', 'El Mirador Helicopter Tour', 'Take a helicopter tour from Tikal to El Mirador, one of the largest and oldest Mayan cities, deep in the jungle. This remote archaeological site features La Danta, one of the largest pyramids in the world by volume.', 350, 8, 6, 6, ARRAY['https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib