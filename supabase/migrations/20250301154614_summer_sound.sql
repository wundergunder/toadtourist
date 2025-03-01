/*
  # Add sample experiences

  1. New Data
    - Add sample experiences for the Rio Dulce territory
    - Create experiences with proper details and images
  2. Purpose
    - Provide initial data for the application to display
    - Ensure users have content to interact with
*/

-- Insert sample experiences if they don't exist
INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT 
  'jungle-kayaking',
  'Jungle Kayaking Adventure',
  'Paddle through the lush mangroves and spot wildlife on this guided kayaking tour. Our experienced guides will take you through hidden waterways where you can observe birds, monkeys, and possibly manatees in their natural habitat.

This tour begins at our base camp where you will receive safety instructions and equipment. We will then transport you to the starting point on the river where you will board your kayak. The journey takes you through narrow channels lined with mangroves, opening occasionally into wider lagoons rich with wildlife.

Along the way, your guide will point out interesting plants and animals, explaining their ecological importance. You will have opportunities to take photos and simply enjoy the tranquility of this unique ecosystem.

This tour is suitable for beginners and includes all necessary equipment including life jackets, paddles, and dry bags for your belongings. We recommend bringing sunscreen, insect repellent, a hat, and water.',
  45,
  3,
  12,
  8,
  ARRAY[
    'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1572125675722-238a4f1f4ea2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1623991618729-acd138770029?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  ],
  'rio-dulce',
  (SELECT id FROM profiles WHERE role = 'tour_guide' ORDER BY created_at LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'jungle-kayaking');

INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT 
  'mayan-cooking',
  'Mayan Cooking Class',
  'Learn to prepare traditional Mayan dishes with local ingredients and ancient techniques. This hands-on cooking class takes place in a traditional kitchen where you will learn about the cultural significance of Mayan cuisine while preparing a delicious meal to enjoy together.

You will start by visiting a local market to select fresh ingredients, guided by our expert chef who will explain the traditional uses of various herbs and spices in Mayan cooking. Back in the kitchen, you will learn to prepare several dishes including traditional corn tortillas, pepián (meat stew with roasted seeds and chilies), and jocón (chicken in a green tomatillo and cilantro sauce).

Throughout the class, our chef will share stories about the history and cultural importance of each dish. At the end, you will sit down to enjoy the meal you have prepared, accompanied by traditional beverages.

This experience is suitable for all skill levels and includes all ingredients and equipment. Just bring your appetite and curiosity!',
  35,
  4,
  8,
  4,
  ARRAY[
    'https://images.unsplash.com/photo-1566559532215-bbc9b4cc6d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1604152135912-04a022e23696?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  ],
  'rio-dulce',
  (SELECT id FROM profiles WHERE role = 'tour_guide' ORDER BY created_at LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'mayan-cooking');

INSERT INTO experiences (id, title, description, price, duration, max_spots, available_spots, image_urls, territory_id, guide_id)
SELECT 
  'waterfall-trek',
  'Hidden Waterfall Trek',
  'Hike through the rainforest to discover hidden waterfalls and natural swimming pools. This guided trek takes you off the beaten path to some of the most beautiful and secluded spots in the region.

The journey begins with a drive to the trailhead, followed by a moderate hike through dense jungle. Your guide will point out interesting plants and wildlife along the way, sharing knowledge about the local ecosystem and traditional uses of various plants.

After about an hour of hiking, you will reach the first of several waterfalls. Each offers a unique experience, from gentle cascades perfect for photographs to deeper pools ideal for swimming. You will have time to relax, swim, and enjoy a packed lunch in this pristine natural setting.

The trek is of moderate difficulty and requires a reasonable level of fitness. We recommend bringing swimwear, a towel, comfortable hiking shoes, and a change of clothes. All safety equipment and a light lunch are provided.',
  55,
  6,
  15,
  12,
  ARRAY[
    'https://images.unsplash.com/photo-1596786232430-dfa08ebf4e7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1588392382834-a891154bca4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  ],
  'rio-dulce',
  (SELECT id FROM profiles WHERE role = 'tour_guide' ORDER BY created_at LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'waterfall-trek');

-- Create a sample tour guide if none exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'tour_guide') THEN
    -- Create a user in auth.users
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      gen_random_uuid(),
      'guide@example.com',
      '{"full_name": "Carlos Mendez", "role": "tour_guide"}'
    );
    
    -- The trigger will create the profile
  END IF;
END $$;