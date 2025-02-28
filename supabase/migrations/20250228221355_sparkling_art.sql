/*
  # Initial schema for ToadTourism

  1. New Tables
    - `territories`
      - `id` (text, primary key)
      - `name` (text, not null)
      - `description` (text, not null)
      - `image_url` (text, not null)
      - `created_at` (timestamptz, default now())
    
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, not null)
      - `full_name` (text, not null)
      - `role` (text, not null)
      - `territory_id` (text, references territories)
      - `created_at` (timestamptz, default now())
    
    - `experiences`
      - `id` (text, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `price` (numeric, not null)
      - `duration` (numeric, not null)
      - `max_spots` (integer, not null)
      - `available_spots` (integer, not null)
      - `image_urls` (text[], not null)
      - `territory_id` (text, references territories)
      - `guide_id` (uuid, references profiles)
      - `created_at` (timestamptz, default now())
    
    - `bookings`
      - `id` (uuid, primary key)
      - `experience_id` (text, references experiences)
      - `tourist_id` (uuid, references profiles)
      - `booking_date` (date, not null)
      - `num_people` (integer, not null)
      - `total_price` (numeric, not null)
      - `payment_method` (text, not null)
      - `payment_status` (text, not null)
      - `created_at` (timestamptz, default now())
    
    - `reviews`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, references bookings)
      - `tourist_id` (uuid, references profiles)
      - `experience_id` (text, references experiences)
      - `rating` (integer, not null)
      - `comment` (text, not null)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read and write their own data
    - Add policies for admin users to read and write all data
    - Add policies for territory managers to manage their territories
    - Add policies for tour guides to manage their experiences
*/

-- Create territories table
CREATE TABLE IF NOT EXISTS territories (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'territory_manager', 'tour_guide', 'tourist')),
  territory_id text REFERENCES territories(id),
  created_at timestamptz DEFAULT now()
);

-- Create experiences table
CREATE TABLE IF NOT EXISTS experiences (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  duration numeric NOT NULL CHECK (duration > 0),
  max_spots integer NOT NULL CHECK (max_spots > 0),
  available_spots integer NOT NULL CHECK (available_spots >= 0),
  image_urls text[] NOT NULL,
  territory_id text NOT NULL REFERENCES territories(id),
  guide_id uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id text NOT NULL REFERENCES experiences(id),
  tourist_id uuid NOT NULL REFERENCES profiles(id),
  booking_date date NOT NULL,
  num_people integer NOT NULL CHECK (num_people > 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card')),
  payment_status text NOT NULL CHECK (payment_status IN ('pending', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id),
  tourist_id uuid NOT NULL REFERENCES profiles(id),
  experience_id text NOT NULL REFERENCES experiences(id),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Territories Policies
CREATE POLICY "Territories are viewable by everyone"
  ON territories
  FOR SELECT
  USING (true);

CREATE POLICY "Territories can be created by admins"
  ON territories
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Territories can be updated by admins"
  ON territories
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Territory managers can view profiles in their territory"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles manager
    WHERE manager.id = auth.uid()
    AND manager.role = 'territory_manager'
    AND manager.territory_id = profiles.territory_id
  ));

CREATE POLICY "Tour guides can view tourist profiles who booked their experiences"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    profiles.role = 'tourist' AND
    EXISTS (
      SELECT 1 FROM experiences e
      JOIN bookings b ON e.id = b.experience_id
      WHERE e.guide_id = auth.uid()
      AND b.tourist_id = profiles.id
    )
  );

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Territory managers can update tour guide profiles in their territory"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    profiles.role = 'tour_guide' AND
    EXISTS (
      SELECT 1 FROM profiles manager
      WHERE manager.id = auth.uid()
      AND manager.role = 'territory_manager'
      AND manager.territory_id = profiles.territory_id
    )
  );

-- Experiences Policies
CREATE POLICY "Experiences are viewable by everyone"
  ON experiences
  FOR SELECT
  USING (true);

CREATE POLICY "Tour guides can create experiences"
  ON experiences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    guide_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tour_guide'
    )
  );

CREATE POLICY "Tour guides can update their own experiences"
  ON experiences
  FOR UPDATE
  TO authenticated
  USING (
    guide_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tour_guide'
    )
  );

-- Bookings Policies
CREATE POLICY "Tourists can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (tourist_id = auth.uid());

CREATE POLICY "Tour guides can view bookings for their experiences"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM experiences
    WHERE experiences.id = bookings.experience_id
    AND experiences.guide_id = auth.uid()
  ));

CREATE POLICY "Territory managers can view bookings in their territory"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles manager
    JOIN experiences e ON e.territory_id = manager.territory_id
    WHERE manager.id = auth.uid()
    AND manager.role = 'territory_manager'
    AND e.id = bookings.experience_id
  ));

CREATE POLICY "Admins can view all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Tourists can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tourist_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tourist'
    )
  );

-- Reviews Policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Tourists can create reviews for their bookings"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tourist_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reviews.booking_id
      AND bookings.tourist_id = auth.uid()
    )
  );

CREATE POLICY "Tourists can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (tourist_id = auth.uid());

-- Insert initial territory
INSERT INTO territories (id, name, description, image_url)
VALUES (
  'rio-dulce',
  'Rio Dulce',
  'A lush river valley in eastern Guatemala, known for its stunning natural beauty, wildlife, and the blend of Mayan and Caribbean cultures. The emerald waters of the Rio Dulce flow from Lake Izabal to the Caribbean Sea, creating a diverse ecosystem that''s home to hundreds of bird species, manatees, and other wildlife.',
  'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- Create trigger to handle profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'tourist');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();