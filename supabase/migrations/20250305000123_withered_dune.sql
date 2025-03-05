-- Drop all existing profile policies
DO $$ 
BEGIN
  EXECUTE (
    SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON profiles;', E'\n')
    FROM pg_policies 
    WHERE tablename = 'profiles'
  );
END $$;

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
CREATE POLICY "Territory managers can update territory profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM auth.users u
    WHERE u.id = auth.uid()
    AND (u.raw_user_meta_data->>'territory_id')::text = profiles.territory_id
    AND (u.raw_user_meta_data->>'roles')::jsonb ? 'territory_manager'
  )
);

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM auth.users u
    WHERE u.id = auth.uid()
    AND (u.raw_user_meta_data->>'roles')::jsonb ? 'admin'
  )
);