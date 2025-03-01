-- Update the trigger function to handle territory_id from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role,
    territory_id
  )
  VALUES (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', 'User'), 
    coalesce(new.raw_user_meta_data->>'role', 'tourist'),
    new.raw_user_meta_data->>'territory_id'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();