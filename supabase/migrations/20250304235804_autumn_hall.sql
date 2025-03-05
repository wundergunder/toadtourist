-- Drop all existing profile policies
DO $$ 
BEGIN
  -- Get all policy names for the profiles table
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
  END LOOP;
END $$;

-- Create new, simplified policies that avoid recursion completely

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
    FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'roles')::jsonb ? 'territory_manager'
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
    FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'roles')::jsonb ? 'territory_manager'
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
    FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'roles')::jsonb ? 'admin'
  )
);