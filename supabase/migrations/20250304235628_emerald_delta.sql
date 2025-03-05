-- Drop all existing profile policies to start fresh
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

-- Create simplified policies that avoid recursion

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow users to view public profile information
CREATE POLICY "Public profile information is viewable"
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

-- Allow territory managers to manage profiles in their territory
CREATE POLICY "Territory managers can manage territory profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM territories t
    WHERE t.id = profiles.territory_id
    AND EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.id = auth.uid()
      AND p2.territory_id = t.id
    )
  )
);

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'roles')::jsonb ? 'admin'
  )
);