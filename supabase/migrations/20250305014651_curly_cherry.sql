-- Drop all existing profile policies
DO $$ 
BEGIN
  EXECUTE (
    SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON profiles;', E'\n')
    FROM pg_policies 
    WHERE tablename = 'profiles'
  );
END $$;

-- Create new, simplified policies that avoid recursion and fix admin permissions

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

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles"
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

-- Allow territory managers to manage profiles in their territory
CREATE POLICY "Territory managers can manage territory profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM profiles manager
    WHERE manager.id = auth.uid()
    AND manager.territory_id = profiles.territory_id
    AND 'territory_manager' = ANY(manager.roles)
  )
);

-- Add policy to allow admins to update auth.users
CREATE POLICY "Admins can update users"
ON auth.users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM profiles admin
    WHERE admin.id = auth.uid() 
    AND 'admin' = ANY(admin.roles)
  )
);