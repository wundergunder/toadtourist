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

  -- Sunrise Monkey Tour
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-monkey-tour',
    'Sunrise Monkey Tour',
    'Start your day with an unforgettable sunrise tour to observe the diverse wildlife of Rio Dulce, particularly its resident monkey populations. As dawn breaks, the jungle comes alive with the sounds of howler monkeys and hundreds of bird species beginning their day. Your expert guide will take you by boat through narrow channels and mangrove forests where you''re likely to spot howler monkeys, spider monkeys, and white-faced capuchins in their natural habitat.

The early morning light provides perfect conditions for wildlife viewing and photography. Along the way, you''ll also have opportunities to spot various bird species, including toucans, herons, and kingfishers. Your guide will share knowledge about the local ecosystem, monkey behavior, and conservation efforts in the area.

The tour includes a stop at a scenic spot to enjoy a traditional Guatemalan breakfast while watching the sun rise over the river. You''ll also visit several known monkey territories and a bird nesting site.

Includes:
- Early morning boat transportation
- Professional naturalist guide
- Breakfast and coffee/tea
- Binoculars for wildlife viewing
- Rain ponchos if needed',
    45,
    4,
    8,
    8,
    ARRAY[
      'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572125675722-238a4f1f4ea2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-monkey-tour');

  -- Sunset Cruise
  INSERT INTO experiences (
    id, title, description, price, duration, max_spots, available_spots, 
    image_urls, territory_id, guide_id
  )
  SELECT 
    'rio-dulce-sunset-cruise',
    'Sunset Cruise',
    'Experience the magic of Rio Dulce at sunset on this enchanting evening cruise. As the day winds down, you''ll cruise through the most scenic parts of the river, watching the sky transform with vibrant colors reflected in the calm waters. The tour takes you through the dramatic limestone cliffs of the river canyon, known as "El Cañon," where the towering walls create a spectacular setting for sunset viewing.

During the cruise, you''ll enjoy appetizers and drinks while your guide shares stories about the region''s history, including tales of Spanish colonial times and the ancient Maya who once inhabited these shores. The timing is perfect to spot birds returning to their nests and possibly catch glimpses of nocturnal wildlife beginning to stir.

The cruise includes a stop at a scenic viewpoint perfect for photos, and on the return journey, you''ll experience the peaceful transition from dusk to nightfall on the river. Watch as the first stars appear and listen to the changing sounds of the jungle as day turns to night.

Includes:
- Evening boat cruise
- Professional guide
- Appetizers and drinks (including wine or beer)
- Blankets for comfort
- Photography tips for sunset shots',
    55,
    3,
    12,
    12,
    ARRAY[
      'https://images.unsplash.com/photo-1586902197503-e71026292412?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502472584811-0a2f2feb8968?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ],
    'rio-dulce',
    guide_id
  WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE id = 'rio-dulce-sunset-cruise');
END $$;