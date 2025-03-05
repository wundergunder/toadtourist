-- Drop all existing profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Everyone can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles fixed" ON profiles;
DROP POLICY IF EXISTS "Territory managers can view profiles in their territory" ON profiles;
DROP POLICY IF EXISTS "Territory managers can view profiles in their territory fixed" ON profiles;
DROP POLICY IF EXISTS "Tour guides can view tourist profiles who booked their experiences" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles fixed" ON profiles;
DROP POLICY IF EXISTS "Territory managers can update tour guide profiles in their territory" ON profiles;
DROP POLICY IF EXISTS "Territory managers can update tour guide profiles in their territory fixed" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Territory managers can manage hotel operators" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Public profile information is viewable" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Territory managers can manage territory profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "View own profile" ON profiles;
DROP POLICY IF EXISTS "View public profiles" ON profiles;
DROP POLICY IF EXISTS "Update own profile" ON profiles;
DROP POLICY IF EXISTS "Create own profile" ON profiles;
DROP POLICY IF EXISTS "Territory managers view territory profiles" ON profiles;
DROP POLICY IF EXISTS "Territory managers update territory profiles" ON profiles;
DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles;

-- Create new, simplified policies that avoid recursion

-- Allow anyone to view any profile (basic public info)
CREATE POLICY "Public profiles are viewable"
ON profiles
FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Allow users to create their own profile
CREATE POLICY "Users can create own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Allow territory managers to update profiles in their territory
-- This uses auth.jwt() to avoid recursion
CREATE POLICY "Territory managers can update territory profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  territory_id IN (
    SELECT territory_id 
    FROM auth.jwt() j 
    WHERE j.sub = auth.uid() 
    AND j.raw->>'territory_id' IS NOT NULL
  )
);

-- Allow admins to manage all profiles
-- This uses auth.jwt() to avoid recursion
CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM auth.jwt() j 
    WHERE j.sub = auth.uid() 
    AND (j.raw->'user_metadata'->>'roles')::jsonb ? 'admin'
  )
);