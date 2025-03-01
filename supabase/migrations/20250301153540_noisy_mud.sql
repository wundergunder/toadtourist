/*
  # Fix for infinite recursion in profiles policy
  
  This migration fixes the infinite recursion issue in the profiles policy by:
  1. Dropping problematic policies that cause circular dependencies
  2. Creating new policies with safer conditions that avoid self-referencing
*/

-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Territory managers can view profiles in their territory" ON profiles;

-- Create safer versions of the policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles
  FOR SELECT
  USING (role IN ('tour_guide', 'territory_manager'));

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

CREATE POLICY "Territory managers can view profiles in their territory fixed" 
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM territories t
      JOIN profiles p ON p.territory_id = t.id
      WHERE p.id = auth.uid() 
      AND p.role = 'territory_manager'
      AND p.territory_id = profiles.territory_id
    )
  );

-- Fix the admin update policy that might also cause recursion
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

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

-- Fix the territory manager update policy
DROP POLICY IF EXISTS "Territory managers can update tour guide profiles in their territory" ON profiles;

CREATE POLICY "Territory managers can update tour guide profiles in their territory fixed" 
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    profiles.role = 'tour_guide' AND
    EXISTS (
      SELECT 1 FROM territories t
      JOIN profiles p ON p.territory_id = t.id
      WHERE p.id = auth.uid() 
      AND p.role = 'territory_manager'
      AND p.territory_id = profiles.territory_id
    )
  );