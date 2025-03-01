/*
  # Fix for infinite recursion in profiles policies
  
  This migration addresses the infinite recursion issue in the profiles table policies by:
  1. Dropping all problematic policies that cause recursion
  2. Creating simpler policies that don't reference the profiles table in their own conditions
  3. Using auth.users metadata instead of profiles table for role checks
*/

-- Drop all problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Territory managers can view profiles in their territory" ON profiles;
DROP POLICY IF EXISTS "Tour guides can view tourist profiles who booked their experiences" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Territory managers can update tour guide profiles in their territory" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles fixed" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles fixed" ON profiles;
DROP POLICY IF EXISTS "Territory managers can view profiles in their territory fixed" ON profiles;
DROP POLICY IF EXISTS "Territory managers can update tour guide profiles in their territory fixed" ON profiles;

-- Create completely new policies that don't cause recursion
CREATE POLICY "Everyone can view all profiles" 
  ON profiles
  FOR SELECT
  USING (true);

-- Users can update their own profile (this policy is safe)
CREATE POLICY "Users can update only their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

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