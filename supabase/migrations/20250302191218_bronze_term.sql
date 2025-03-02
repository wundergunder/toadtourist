-- Delete specific sample experiences
DELETE FROM experiences
WHERE id IN (
  'guatemala-city-scuba',  -- The scuba diving experience shown in the image
  'guatemala-city-cooking', -- The Mayan cooking class in Guatemala City
  'guatemala-city-waterfall' -- The waterfall trek in Guatemala City
);

-- Also delete any experiences that are incorrectly associated with Guatemala City
-- since Guatemala City is landlocked and wouldn't have scuba diving
DELETE FROM experiences 
WHERE territory_id = 'guatemala-city' 
AND (
  title ILIKE '%scuba%' 
  OR title ILIKE '%diving%'
  OR title ILIKE '%underwater%'
);

-- Make sure we don't have any experiences with missing images
UPDATE experiences
SET image_urls = ARRAY[
  'https://images.unsplash.com/photo-1544551763-92ab472cad5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
]
WHERE array_length(image_urls, 1) IS NULL OR image_urls[1] IS NULL OR image_urls[1] = '';