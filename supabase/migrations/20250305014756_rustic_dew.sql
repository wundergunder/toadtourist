-- Drop all existing profile policies
DO $$ 
BEGIN
  EXECUTE (
    SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON profiles;', E'\n')
    FROM pg_policies 
    WHERE tablename = 'profiles'
  );
END $$;

-- Create a single, simple policy for SELECT that allows viewing all profiles
CREATE POLICY "Anyone can view profiles"
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

-- Create a function to check if a user is an admin without using profiles table
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users
    WHERE id = user_id
    AND raw_user_meta_data->>'roles' LIKE '%admin%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user is a territory manager
CREATE OR REPLACE FUNCTION is_territory_manager(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users
    WHERE id = user_id
    AND raw_user_meta_data->>'roles' LIKE '%territory_manager%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow admins to manage all profiles using the helper function
CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- Allow territory managers to manage profiles in their territory
CREATE POLICY "Territory managers can manage territory profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  is_territory_manager(auth.uid()) AND
  territory_id = (
    SELECT raw_user_meta_data->>'territory_id'
    FROM auth.users
    WHERE id = auth.uid()
  )
);