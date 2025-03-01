/*
  # Fix for infinite recursion in profiles policy
  
  This migration fixes the infinite recursion issue in the profiles policy by:
  1. Dropping problematic policies that cause circular dependencies
  2. Creating new policies with safer conditions that avoid self-referencing
*/

-- Drop all problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Territory managers can view profiles in their territory" ON profiles;
DROP POLICY IF EXISTS "Tour guides can view tourist profiles who booked their experiences" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Territory managers can update tour guide profiles in their territory" ON profiles;

-- Create safer versions of the policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles
  FOR SELECT
  USING (true);

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

-- Fix the admin update policy
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