/*
  # Clean up database entries

  1. Remove experiences and regions that aren't in the Supabase tables
  2. Update image URLs for existing entries
*/

-- First, let's identify the territories we want to keep
CREATE TEMPORARY TABLE valid_territories AS
SELECT id FROM territories
WHERE id IN (
  'antigua-guatemala',
  'lake-atitlan',
  'tikal',
  'guatemala-city',
  'flores-yaxha',
  'chichicastenango',
  'rio-dulce',
  'semuc-champey',
  'quetzaltenango',
  'pacific-coast'
);

-- Delete experiences that belong to territories not in our valid list
DELETE FROM experiences
WHERE territory_id NOT IN (SELECT id FROM valid_territories);

-- Delete territories that are not in our valid list
DELETE FROM territories
WHERE id NOT IN (SELECT id FROM valid_territories);

-- Update image URLs for territories to ensure they're high quality
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
SET image_url = 'https://images.unsplash.com/photo-1618739158007-a0b435b72fca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'guatemala-city';

UPDATE territories
SET image_url = 'https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'flores-yaxha';

UPDATE territories
SET image_url = 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'chichicastenango';

UPDATE territories
SET image_url = 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'rio-dulce';

UPDATE territories
SET image_url = 'https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'semuc-champey';

UPDATE territories
SET image_url = 'https://images.unsplash.com/photo-1603204043142-39139fa69387?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'quetzaltenango';

UPDATE territories
SET image_url = 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE id = 'pacific-coast';

-- Define valid experiences
CREATE TEMPORARY TABLE valid_experiences AS
SELECT id FROM experiences
WHERE id IN (
  'jungle-kayaking',
  'mayan-cooking',
  'waterfall-trek',
  'antigua-coffee-tour',
  'antigua-cooking-class',
  'atitlan-kayak-adventure',
  'atitlan-weaving-workshop',
  'tikal-sunrise-tour',
  'tikal-night-tour',
  'semuc-champey-adventure',
  'chichi-market-tour',
  'tikal-el-mirador',
  'tikal-yaxha-sunset',
  'semuc-full-day',
  'semuc-caves',
  'semuc-river-tubing',
  'semuc-chocolate-making',
  'semuc-overnight',
  'chichi-mask-making',
  'chichi-santo-tomas',
  'chichi-textile-tour',
  'chichi-cooking-class'
);

-- Delete experiences that are not in our valid list
DELETE FROM experiences
WHERE id NOT IN (SELECT id FROM valid_experiences);

-- Update image URLs for key experiences
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

-- Drop temporary tables
DROP TABLE valid_territories;
DROP TABLE valid_experiences;