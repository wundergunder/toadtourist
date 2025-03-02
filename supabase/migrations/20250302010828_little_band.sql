/*
  # Fix Hotel Operator Creation

  1. Changes
     - Add a more robust trigger function for handling new users
     - Ensure proper handling of roles array
     - Fix potential issues with the hotel_operator role
*/

-- Update the trigger function to properly handle roles array and be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_roles text[];
  role_item text;
BEGIN
  -- Get roles from metadata or default to tourist
  IF new.raw_user_meta_data->>'roles' IS NOT NULL THEN
    -- Convert JSON array to text array
    default_roles := '{}';
    FOR role_item IN SELECT jsonb_array_elements_text(new.raw_user_meta_data->'roles')
    LOOP
      default_roles := array_append(default_roles, role_item);
    END LOOP;
  ELSE
    -- For backward compatibility, check for single role
    IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
      default_roles := ARRAY[new.raw_user_meta_data->>'role'];
    ELSE
      default_roles := ARRAY['tourist'];
    END IF;
  END IF;
  
  -- Ensure tourist role is always included
  IF NOT 'tourist' = ANY(default_roles) THEN
    default_roles := array_append(default_roles, 'tourist');
  END IF;

  -- Insert into profiles table with error handling
  BEGIN
    INSERT INTO public.profiles (
      id, 
      email, 
      full_name, 
      role,  -- Keep for backward compatibility
      roles,
      territory_id,
      avatar_url,
      bio,
      hotel_name
    )
    VALUES (
      new.id, 
      new.email, 
      coalesce(new.raw_user_meta_data->>'full_name', 'User'),
      coalesce(new.raw_user_meta_data->>'role', 'tourist'),  -- Keep for backward compatibility
      default_roles,
      new.raw_user_meta_data->>'territory_id',
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'bio',
      new.raw_user_meta_data->>'hotel_name'
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE NOTICE 'Error creating profile for user %: %', new.id, SQLERRM;
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Ensure hotel_name column exists in profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'hotel_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN hotel_name text;
  END IF;
END $$;

-- Ensure the roles column exists and has a default value
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'roles'
  ) THEN
    ALTER TABLE profiles ADD COLUMN roles text[] DEFAULT ARRAY['tourist'];
  END IF;
END $$;

-- Update existing profiles to ensure they have the roles array populated
UPDATE profiles
SET roles = ARRAY[role]
WHERE roles IS NULL OR array_length(roles, 1) IS NULL;