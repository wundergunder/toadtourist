/*
  # Fix for initial schema setup for Lazy Toad

  This migration checks for existing objects before creating them to avoid errors.
  It includes:
  - Check for existing policies before creating them
  - Ensure all tables and security policies are properly set up
*/

-- Check if tables exist and create them if they don't
DO $$ 
BEGIN
  -- Create territories table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'territories') THEN
    CREATE TABLE territories (
      id text PRIMARY KEY,
      name text NOT NULL,
      description text NOT NULL,
      image_url text NOT NULL,
      created_at timestamptz DEFAULT now()
    );
  END IF;

  -- Create profiles table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE TABLE profiles (
      id uuid PRIMARY KEY REFERENCES auth.users,
      email text NOT NULL,
      full_name text NOT NULL,
      role text NOT NULL CHECK (role IN ('admin', 'territory_manager', 'tour_guide', 'tourist')),
      territory_id text REFERENCES territories(id),
      created_at timestamptz DEFAULT now()
    );
  END IF;

  -- Create experiences table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'experiences') THEN
    CREATE TABLE experiences (
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
  END IF;

  -- Create bookings table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
    CREATE TABLE bookings (
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
  END IF;

  -- Create reviews table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
    CREATE TABLE reviews (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id uuid NOT NULL REFERENCES bookings(id),
      tourist_id uuid NOT NULL REFERENCES profiles(id),
      experience_id text NOT NULL REFERENCES experiences(id),
      rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment text NOT NULL,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Enable Row Level Security on all tables
DO $$ 
BEGIN
  EXECUTE 'ALTER TABLE territories ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE experiences ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE bookings ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE reviews ENABLE ROW LEVEL SECURITY';
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Territories Policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'territories' AND policyname = 'Territories are viewable by everyone') THEN
    CREATE POLICY "Territories are viewable by everyone"
      ON territories
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'territories' AND policyname = 'Territories can be created by admins') THEN
    CREATE POLICY "Territories can be created by admins"
      ON territories
      FOR INSERT
      TO authenticated
      WITH CHECK (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      ));
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'territories' AND policyname = 'Territories can be updated by admins') THEN
    CREATE POLICY "Territories can be updated by admins"
      ON territories
      FOR UPDATE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      ));
  END IF;

  -- Profiles Policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles') THEN
    CREATE POLICY "Admins can view all profiles"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      ));
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Territory managers can view profiles in their territory') THEN
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
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Tour guides can view tourist profiles who booked their experiences') THEN
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
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can update all profiles') THEN
    CREATE POLICY "Admins can update all profiles"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      ));
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Territory managers can update tour guide profiles in their territory') THEN
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
  END IF;

  -- Experiences Policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'experiences' AND policyname = 'Experiences are viewable by everyone') THEN
    CREATE POLICY "Experiences are viewable by everyone"
      ON experiences
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'experiences' AND policyname = 'Tour guides can create experiences') THEN
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
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'experiences' AND policyname = 'Tour guides can update their own experiences') THEN
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
  END IF;

  -- Bookings Policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Tourists can view their own bookings') THEN
    CREATE POLICY "Tourists can view their own bookings"
      ON bookings
      FOR SELECT
      TO authenticated
      USING (tourist_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Tour guides can view bookings for their experiences') THEN
    CREATE POLICY "Tour guides can view bookings for their experiences"
      ON bookings
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM experiences
        WHERE experiences.id = bookings.experience_id
        AND experiences.guide_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Territory managers can view bookings in their territory') THEN
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
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Admins can view all bookings') THEN
    CREATE POLICY "Admins can view all bookings"
      ON bookings
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      ));
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Tourists can create bookings') THEN
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
  END IF;

  -- Reviews Policies
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Reviews are viewable by everyone') THEN
    CREATE POLICY "Reviews are viewable by everyone"
      ON reviews
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Tourists can create reviews for their bookings') THEN
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
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Tourists can update their own reviews') THEN
    CREATE POLICY "Tourists can update their own reviews"
      ON reviews
      FOR UPDATE
      TO authenticated
      USING (tourist_id = auth.uid());
  END IF;

  -- Create policy to allow new users to create their own profile
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can create their own profile') THEN
    CREATE POLICY "Users can create their own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- Insert initial territory if it doesn't exist
INSERT INTO territories (id, name, description, image_url)
VALUES (
  'rio-dulce',
  'Rio Dulce',
  'A lush river valley in eastern Guatemala, known for its stunning natural beauty, wildlife, and the blend of Mayan and Caribbean cultures. The emerald waters of the Rio Dulce flow from Lake Izabal to the Caribbean Sea, creating a diverse ecosystem that''s home to hundreds of bird species, manatees, and other wildlife.',
  'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- Create or replace trigger function for user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', 'User'), 
    coalesce(new.raw_user_meta_data->>'role', 'tourist')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();