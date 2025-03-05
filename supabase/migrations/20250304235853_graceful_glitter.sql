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

-- Create new, simplified policies that avoid recursion

-- Allow users to view their own profile
CREATE POLICY "View own profile"
ON profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow users to view basic profile info of tour guides and territory managers
CREATE POLICY "View public profiles"
ON profiles
FOR SELECT
USING (
  'tour_guide' = ANY(roles) OR 
  'territory_manager' = ANY(roles)
);

-- Allow users to update their own profile
CREATE POLICY "Update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Allow users to create their own profile
CREATE POLICY "Create own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Allow territory managers to view profiles in their territory
CREATE POLICY "Territory managers view territory profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  territory_id IN (
    SELECT territory_id 
    FROM profiles manager 
    WHERE manager.id = auth.uid() 
    AND 'territory_manager' = ANY(manager.roles)
  )
);

-- Allow territory managers to update profiles in their territory
CREATE POLICY "Territory managers update territory profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  territory_id IN (
    SELECT territory_id 
    FROM profiles manager 
    WHERE manager.id = auth.uid() 
    AND 'territory_manager' = ANY(manager.roles)
  )
);

-- Allow admins to manage all profiles
CREATE POLICY "Admins manage all profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM profiles admin
    WHERE admin.id = auth.uid() 
    AND 'admin' = ANY(admin.roles)
  )
);