/*
  # Add Hotel Operator Role and Referral System

  1. New Tables
    - `referral_links` - Stores unique referral links for hotel operators
    - `referrals` - Tracks bookings made through referral links
    - `commissions` - Records commission amounts for hotel operators
  
  2. Changes
    - Add 'hotel_operator' to allowed roles
    - Update existing functions and policies to support the new role
  
  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each table
*/

-- Add hotel_operator to the list of allowed roles in user_roles table
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('admin', 'territory_manager', 'tour_guide', 'tourist', 'hotel_operator'));

-- Create referral_links table
CREATE TABLE IF NOT EXISTS referral_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  referral_link_id uuid NOT NULL REFERENCES referral_links(id),
  created_at timestamptz DEFAULT now()
);

-- Create commissions table
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 0),
  status text NOT NULL CHECK (status IN ('pending', 'paid')),
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Policies for referral_links
CREATE POLICY "Users can view their own referral links"
  ON referral_links
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Hotel operators can create their own referral links"
  ON referral_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'hotel_operator' = ANY(profiles.roles)
    )
  );

CREATE POLICY "Hotel operators can update their own referral links"
  ON referral_links
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'hotel_operator' = ANY(profiles.roles)
    )
  );

-- Policies for referrals
CREATE POLICY "Hotel operators can view their own referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM referral_links
      WHERE referral_links.id = referrals.referral_link_id
      AND referral_links.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.roles)
    )
  );

-- Policies for commissions
CREATE POLICY "Hotel operators can view their own commissions"
  ON commissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM referrals
      JOIN referral_links ON referrals.referral_link_id = referral_links.id
      WHERE commissions.referral_id = referrals.id
      AND referral_links.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all commissions"
  ON commissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.roles)
    )
  );

CREATE POLICY "Admins can update commissions"
  ON commissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.roles)
    )
  );

-- Create a function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer := 0;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate a 6-character code
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if the code already exists
    SELECT EXISTS(SELECT 1 FROM referral_links WHERE code = result) INTO code_exists;
    
    -- Exit loop if the code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a function to automatically create a referral link for new hotel operators
CREATE OR REPLACE FUNCTION create_default_referral_link()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user has the hotel_operator role
  IF 'hotel_operator' = ANY(NEW.roles) THEN
    -- Create a default referral link if one doesn't exist
    INSERT INTO referral_links (user_id, code, name)
    SELECT NEW.id, generate_referral_code(), 'Default Link'
    WHERE NOT EXISTS (
      SELECT 1 FROM referral_links WHERE user_id = NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to create a default referral link when a user gets the hotel_operator role
CREATE TRIGGER create_hotel_operator_referral_link
AFTER INSERT OR UPDATE OF roles ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_default_referral_link();

-- Create a function to calculate commission when a booking is made through a referral link
CREATE OR REPLACE FUNCTION calculate_referral_commission()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate 10% commission
  INSERT INTO commissions (referral_id, amount, status)
  SELECT 
    NEW.id,
    (SELECT total_price * 0.1 FROM bookings WHERE id = NEW.booking_id),
    'pending'
  WHERE EXISTS (
    SELECT 1 FROM bookings WHERE id = NEW.booking_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to calculate commission when a referral is created
CREATE TRIGGER calculate_commission_on_referral
AFTER INSERT ON referrals
FOR EACH ROW
EXECUTE FUNCTION calculate_referral_commission();