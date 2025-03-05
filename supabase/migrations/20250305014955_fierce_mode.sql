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

-- Create a function to check if a user has a role without using profiles table
CREATE OR REPLACE FUNCTION has_role(user_id uuid, role_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users
    WHERE id = user_id
    AND raw_user_meta_data->>'roles' LIKE '%' || role_name || '%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get a user's territory_id without using profiles table
CREATE OR REPLACE FUNCTION get_user_territory(user_id uuid)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT raw_user_meta_data->>'territory_id'
    FROM auth.users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Allow territory managers to manage profiles in their territory
CREATE POLICY "Territory managers can manage territory profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'territory_manager') AND
  territory_id = get_user_territory(auth.uid())
);

-- Grant necessary permissions to the security definer functions
GRANT EXECUTE ON FUNCTION has_role TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_territory TO PUBLIC;

-- Grant necessary permissions on auth.users to the security definer functions
GRANT SELECT ON auth.users TO authenticated;