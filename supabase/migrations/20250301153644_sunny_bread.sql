/*
  # Fix for policy already exists error
  
  This migration fixes the "policy already exists" error by:
  1. Using IF NOT EXISTS for all policy creations
  2. Safely dropping and recreating the trigger function
*/

-- Drop problematic policies only if they exist
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Territory managers can view profiles in their territory" ON profiles;
DROP POLICY IF EXISTS "Tour guides can view tourist profiles who booked their experiences" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Territory managers can update tour guide profiles in their territory" ON profiles;

-- Create safer versions of the policies with IF NOT EXISTS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone') THEN
    CREATE POLICY "Public profiles are viewable by everyone" 
      ON profiles
      FOR SELECT
      USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles fixed') THEN
    CREATE POLICY "Admins can view all profiles fixed" 
      ON profiles
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid() 
          AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can update all profiles fixed') THEN
    CREATE POLICY "Admins can update all profiles fixed" 
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid() 
          AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
      );
  END IF;
END $$;

-- Create a simpler trigger function that doesn't cause recursion
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