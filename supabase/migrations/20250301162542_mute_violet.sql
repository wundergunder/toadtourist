('tikal-el-mirador', 'El Mirador Helicopter Tour', 'Take a helicopter tour from Tikal to El Mirador, one of the largest and oldest Mayan cities, deep in the jungle. This remote archaeological site features La Danta, one of the largest pyramids in the world by volume.', 350, 8, 6, 6, ARRAY['https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('tikal-yaxha-sunset', 'Yaxhá Sunset Tour', 'Visit the archaeological site of Yaxhá, located between two lakes and featured in Survivor: Guatemala. Climb Temple 216 to watch the sunset over the jungle and lakes while enjoying a glass of wine.', 70, 6, 12, 12, ARRAY['https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  -- For Semuc Champey
  territory_id := 'semuc-champey';
  guide_email := 'guide.semuc@example.com';
  guide_name := 'Ana Caal';
  
  -- Check if guide exists
  SELECT id INTO guide_id FROM profiles WHERE email = guide_email LIMIT 1;
  
  -- If guide doesn't exist, create one
  IF guide_id IS NULL THEN
    guide_id := gen_random_uuid();
    
    INSERT INTO profiles (id, email, full_name, role, territory_id)
    VALUES (guide_id, guide_email, guide_name, 'tour_guide', territory_id);
  END IF;
  
  -- Add experiences for Semuc Champey
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('semuc-full-day', 'Semuc Champey Full Day Adventure', 'Experience all that Semuc Champey has to offer in this comprehensive day tour. Hike to the El Mirador viewpoint, swim in the turquoise pools, explore the K''anba Cave with candles, and enjoy river tubing on the Cahabón River.', 60, 8, 15, 15, ARRAY['https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('semuc-caves', 'K''anba Cave Candlelight Adventure', 'Explore the mysterious K''anba Cave by candlelight on this unique adventure. Wade through underground rivers, climb waterfalls, and discover stunning cave formations with only the light of your candle to guide you.', 40, 3, 10, 10, ARRAY['https://images.unsplash.com/photo-1520646924885-a4de175dc025?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1520646924885-a4de175dc025?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('semuc-river-tubing', 'Cahabón River Tubing', 'Float down the scenic Cahabón River on an inner tube, enjoying the lush jungle scenery and refreshing waters. This relaxing adventure offers a different perspective of the Semuc Champey region.', 25, 2, 12, 12, ARRAY['https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('semuc-chocolate-making', 'Traditional Chocolate Making Workshop', 'Learn how to make chocolate from scratch using traditional Q''eqchi'' Maya methods. Harvest cacao pods, roast and grind the beans, and create your own chocolate treats to take home.', 35, 3, 8, 8, ARRAY['https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('semuc-overnight', 'Overnight Jungle Camping Experience', 'Spend the night in the jungle near Semuc Champey in a comfortable camping setup. Enjoy an evening campfire, night hike to spot nocturnal wildlife, and early morning bird watching before the day tourists arrive.', 80, 20, 8, 8, ARRAY['https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('semuc-photography', 'Photography Tour: Capturing Semuc''s Beauty', 'Perfect your nature photography skills on this specialized tour designed for photography enthusiasts. Visit the most photogenic spots in Semuc Champey at the optimal times for lighting, with guidance from a professional nature photographer.', 50, 6, 8, 8, ARRAY['https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('semuc-birdwatching', 'Early Morning Birdwatching', 'Rise early to spot some of the 200+ bird species that inhabit the forests around Semuc Champey. Your expert guide will help you identify species like the keel-billed toucan, highland guan, and various hummingbirds.', 40, 4, 6, 6, ARRAY['https://images.unsplash.com/photo-1591608971362-f08b2a75731a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('semuc-cultural', 'Q''eqchi'' Maya Cultural Experience', 'Immerse yourself in the culture of the Q''eqchi'' Maya people who have inhabited this region for centuries. Visit a local community, learn about traditional crafts, participate in a cooking demonstration, and enjoy a meal with a local family.', 45, 5, 8, 8, ARRAY['https://images.unsplash.com/photo-1529064541268-a5681a352d96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1529064541268-a5681a352d96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('semuc-waterfall', 'Hidden Waterfalls Hike', 'Venture off the beaten path to discover hidden waterfalls in the jungle surrounding Semuc Champey. This moderate hike takes you to secluded cascades where you can swim in private pools away from the crowds.', 35, 4, 10, 10, ARRAY['https://images.unsplash.com/photo-1596786232430-dfa08ebf4e7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1596786232430-dfa08ebf4e7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('semuc-cliff-jumping', 'Cliff Jumping Adventure', 'Get your adrenaline pumping with cliff jumping into the deep, clear pools of Semuc Champey. This guided experience includes jumps of various heights (2-10 meters) for different comfort levels, with full safety instructions and supervision.', 30, 2, 10, 10, ARRAY['https://images.unsplash.com/photo-1502724808734-6bcfafb27423?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1502724808734-6bcfafb27423?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  -- For Chichicastenango
  territory_id := 'chichicastenango';
  guide_email := 'guide.chichi@example.com';
  guide_name := 'Luisa Toj';
  
  -- Check if guide exists
  SELECT id INTO guide_id FROM profiles WHERE email = guide_email LIMIT 1;
  
  -- If guide doesn't exist, create one
  IF guide_id IS NULL THEN
    guide_id := gen_random_uuid();
    
    INSERT INTO profiles (id, email, full_name, role, territory_id)
    VALUES (guide_id, guide_email, guide_name, 'tour_guide', territory_id);
  END IF;
  
  -- Add experiences for Chichicastenango
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('chichi-market-tour', 'Chichicastenango Market Insider Tour', 'Navigate the famous Chichicastenango market with a local guide who knows all its secrets. Explore the labyrinth of stalls selling textiles, masks, pottery, and produce. Learn bargaining techniques and the cultural significance of traditional crafts.', 35, 4, 10, 10, ARRAY['https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('chichi-mask-making', 'Traditional Mask Making Workshop', 'Learn the art of traditional Guatemalan mask making from master artisans. These colorful masks are used in traditional dances and ceremonies. Create your own mask to take home as a unique souvenir.', 40, 3, 8, 8, ARRAY['https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('chichi-santo-tomas', 'Santo Tomás Church Cultural Tour', 'Explore the 400-year-old Santo Tomás Church where Catholic and Maya traditions blend in fascinating ways. Witness indigenous spiritual practices on the church steps and learn about the unique religious syncretism of the K''iche'' Maya people.', 30, 2, 12, 12, ARRAY['https://images.unsplash.com/photo-1605216663980-b7ca6e9f2451?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1605216663980-b7ca6e9f2451?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('chichi-textile-tour', 'Textile Traditions & Weaving Demonstration', 'Discover the rich textile traditions of the K''iche'' Maya people. Learn about the symbolism in the patterns, the natural dyeing process, and watch skilled weavers demonstrate the backstrap loom technique that has been used for centuries.', 35, 3, 10, 10, ARRAY['https://images.unsplash.com/photo-1529064541268-a5681a352d96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1529064541268-a5681a352d96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('chichi-cooking-class', 'K''iche'' Maya Cooking Class', 'Learn to prepare traditional K''iche'' Maya dishes in this hands-on cooking class. Visit the market to select ingredients, then create dishes like pepián, subanik, and traditional corn tortillas. Enjoy your creations for lunch.', 45, 5, 8, 8, ARRAY['https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('chichi-spiritual', 'Maya Spiritual Ceremony', 'Participate in a traditional Maya spiritual ceremony led by an authentic Maya spiritual guide (ajq''ij). Learn about the Maya calendar, cosmology, and spiritual practices that have survived for centuries despite persecution.', 50, 3, 8, 8, ARRAY['https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('chichi-photography', 'Market Day Photography Tour', 'Capture the vibrant colors and fascinating culture of Chichicastenango''s famous market day with this photography-focused tour. Your guide will take you to the best vantage points and help you respectfully photograph local people and traditions.', 40, 4, 8, 8, ARRAY['https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('chichi-dance', 'Traditional Dance Performance & Workshop', 'Experience the colorful traditional dances of Guatemala, including the famous Dance of the Conquest. After watching a performance, join a workshop to learn some basic steps and the cultural significance of each dance.', 35, 3, 15, 15, ARRAY['https://images.unsplash.com/photo-1504609813442-a9924e2e4531?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1504609813442-a9924e2e4531?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('chichi-homestay', 'K''iche'' Maya Family Homestay', 'Experience daily life with a K''iche'' Maya family in a village near Chichicastenango. Share meals, participate in daily activities, and gain insight into contemporary Maya culture. This overnight experience offers authentic cultural exchange.', 70, 24, 4, 4, ARRAY['https://images.unsplash.com/photo-1566559532215-bbc9b4cc6d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1566559532215-bbc9b4cc6d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
  VALUES
    ('chichi-pottery', 'Traditional Pottery Workshop', 'Learn the ancient art of Maya pottery in this hands-on workshop. Create your own piece using traditional techniques and designs under the guidance of skilled local artisans. Your creation will be fired and available for pickup the next market day.', 40, 3, 8, 8, ARRAY['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'], territory_id, guide_id)
  ON CONFLICT (id) DO NOTHING;
END $$;