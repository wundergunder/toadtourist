/*
  # Add Guatemala Regions

  1. New Data
    - Adds 10 popular tourist regions in Guatemala with descriptions and images
    - Each region has a unique ID, name, description, and image URL
  
  2. Changes
    - Inserts new regions into the territories table
    - Uses ON CONFLICT to avoid duplicates
*/

-- Insert the 10 most popular tourist regions in Guatemala
INSERT INTO territories (id, name, description, image_url)
VALUES 
  ('antigua-guatemala', 'Antigua Guatemala', 
   'A UNESCO World Heritage city known for its well-preserved colonial architecture, cobblestone streets, and vibrant cultural scene. Surrounded by volcanoes, Antigua offers a perfect blend of history, culture, and natural beauty with its colorful buildings, historic churches, and bustling markets.',
   'https://images.unsplash.com/photo-1605216663980-b7ca6e9f2451?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
  
  ('lake-atitlan', 'Lake Atitlán', 
   'A breathtaking volcanic lake surrounded by charming indigenous villages and three majestic volcanoes. Often described as one of the most beautiful lakes in the world, Lake Atitlán offers stunning natural scenery, traditional Mayan culture, and activities like kayaking, hiking, and exploring the unique character of each lakeside town.',
   'https://images.unsplash.com/photo-1617224908579-c92008fc08bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
  
  ('tikal', 'Tikal National Park', 
   'One of the most important Mayan archaeological sites in the world, located in the dense jungle of northern Guatemala. This UNESCO World Heritage site features towering temple pyramids that rise above the rainforest canopy, elaborate palaces, and plazas that once formed the heart of a powerful Mayan kingdom dating back to 400 BC.',
   'https://images.unsplash.com/photo-1608236415053-3691791bbffe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
  
  ('guatemala-city', 'Guatemala City', 
   'The capital and largest city of Guatemala, offering a mix of modern and historic attractions. Divided into zones, the city features the historic center with the National Palace and Metropolitan Cathedral, museums like Popol Vuh and Ixchel, modern shopping districts, and the scenic Relief Map in Minerva Park.',
   'https://images.unsplash.com/photo-1618739158007-a0b435b72fca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
  
  ('flores-yaxha', 'Flores and Yaxhá', 
   'Flores is a charming island town on Lake Petén Itzá, serving as a gateway to Mayan ruins. Connected to the mainland by a causeway, this picturesque town features colorful buildings, narrow streets, and a relaxed atmosphere. Nearby Yaxhá is a less-visited but impressive Mayan site offering sunset views over jungle lagoons.',
   'https://images.unsplash.com/photo-1547558902-c0e053ade894?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
  
  ('chichicastenango', 'Chichicastenango', 
   'Famous for its colorful indigenous market, one of the largest in Central America. Held on Thursdays and Sundays, the market transforms the town with vendors selling textiles, masks, pottery, and produce. The town is also home to the Santo Tomás Church, where Mayan and Catholic traditions blend in fascinating ways.',
   'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
  
  ('rio-dulce', 'Rio Dulce', 
   'A scenic river region connecting Lake Izabal to the Caribbean Sea. This lush river valley is known for its stunning natural beauty, wildlife, and the blend of Mayan and Caribbean cultures. Attractions include the Castillo de San Felipe fortress, hot springs, and boat trips through jungle-lined canyons to the coastal town of Livingston.',
   'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
  
  ('semuc-champey', 'Semuc Champey', 
   'A hidden paradise with natural limestone bridges and turquoise pools in the jungle of Alta Verapaz. This natural monument consists of a 300-meter limestone bridge over the Cahabón River, forming a series of stepped, turquoise pools perfect for swimming. Nearby attractions include the K''anba Caves and hiking to the El Mirador viewpoint.',
   'https://images.unsplash.com/photo-1552537376-3abf35237215?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
  
  ('quetzaltenango', 'Quetzaltenango (Xela)', 
   'Guatemala''s second-largest city, known for its volcano hikes and indigenous culture. Located in the western highlands, Xela (as locals call it) offers a more authentic Guatemalan experience with its colonial architecture, indigenous markets, and Spanish language schools. It''s also a base for hiking to Santa María Volcano and visiting the Fuentes Georginas hot springs.',
   'https://images.unsplash.com/photo-1603204043142-39139fa69387?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
  
  ('pacific-coast', 'Pacific Coast', 
   'Black sand beaches, sea turtle conservation, and some of the best surfing in the country. The Pacific Coast of Guatemala includes beaches like Monterrico, known for its sea turtle conservation projects and volcanic black sand, and El Paredón, which has become popular for surfing. The area offers a laid-back beach atmosphere different from the highlands.',
   'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;