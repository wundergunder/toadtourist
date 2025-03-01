/*
  # Add multi-role support to profiles table

  1. Changes
    - Modify profiles table to use roles array instead of single role
    - Create user_roles table for role management
    - Update trigger function to handle roles array
  2. Security
    - Update RLS policies to work with roles array
*/

-- First, check if the profiles table exists
DO $$ 
BEGIN
  -- Add roles array column to profiles table if it doesn't exist
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    -- Add roles array column
    ALTER TABLE profiles ADD COLUMN roles text[] DEFAULT ARRAY['tourist'];
    
    -- Migrate existing role data to roles array
    UPDATE profiles SET roles = ARRAY[role];
    
    -- We'll keep the role column for now for backward compatibility
    -- but we'll use the roles array for new functionality
  END IF;
END $$;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'territory_manager', 'tour_guide', 'tourist')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own roles"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own roles"
  ON user_roles
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.roles)
    )
  );

-- Update the trigger function to handle roles array
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_roles text[];
BEGIN
  -- Get roles from metadata or default to tourist
  IF new.raw_user_meta_data->>'roles' IS NOT NULL THEN
    default_roles := ARRAY(SELECT jsonb_array_elements_text(new.raw_user_meta_data->'roles'));
  ELSE
    default_roles := ARRAY['tourist'];
  END IF;
  
  -- Ensure tourist role is always included
  IF NOT 'tourist' = ANY(default_roles) THEN
    default_roles := array_append(default_roles, 'tourist');
  END IF;

  -- Insert into profiles table
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role,  -- Keep for backward compatibility
    roles,
    territory_id
  )
  VALUES (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'tourist'),  -- Keep for backward compatibility
    default_roles,
    new.raw_user_meta_data->>'territory_id'
  );
  
  -- Insert into user_roles table
  FOREACH role IN ARRAY default_roles
  LOOP
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();