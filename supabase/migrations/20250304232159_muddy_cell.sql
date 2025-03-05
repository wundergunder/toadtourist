-- Add commission_level to profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'commission_level'
  ) THEN
    ALTER TABLE profiles ADD COLUMN commission_level numeric DEFAULT 10 CHECK (commission_level >= 0 AND commission_level <= 100);
  END IF;
END $$;

-- Create a function to validate hotel operator commission level
CREATE OR REPLACE FUNCTION validate_hotel_operator_commission()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate commission_level for hotel operators
  IF 'hotel_operator' = ANY(NEW.roles) THEN
    -- Ensure commission_level is set and within valid range
    IF NEW.commission_level IS NULL OR NEW.commission_level < 0 OR NEW.commission_level > 100 THEN
      NEW.commission_level := 10; -- Set default if invalid
    END IF;
  ELSE
    -- For non-hotel operators, commission_level should be NULL
    NEW.commission_level := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate commission level
DROP TRIGGER IF EXISTS validate_hotel_operator_commission_trigger ON profiles;
CREATE TRIGGER validate_hotel_operator_commission_trigger
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION validate_hotel_operator_commission();

-- Add policies for territory managers to manage hotel operators
CREATE POLICY "Territory managers can view hotel operators in their territory"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles manager
    WHERE manager.id = auth.uid()
    AND manager.territory_id = profiles.territory_id
    AND 'territory_manager' = ANY(manager.roles)
    AND 'hotel_operator' = ANY(profiles.roles)
  )
  OR id = auth.uid()
);

CREATE POLICY "Territory managers can update hotel operators in their territory"
ON profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles manager
    WHERE manager.id = auth.uid()
    AND manager.territory_id = profiles.territory_id
    AND 'territory_manager' = ANY(manager.roles)
    AND 'hotel_operator' = ANY(profiles.roles)
  )
);

-- Create a function to calculate commission for a referral
CREATE OR REPLACE FUNCTION calculate_referral_commission()
RETURNS TRIGGER AS $$
DECLARE
  booking_total numeric;
  hotel_operator_id uuid;
  commission_rate numeric;
BEGIN
  -- Get the booking total
  SELECT total_price INTO booking_total
  FROM bookings
  WHERE id = NEW.booking_id;
  
  -- Get the hotel operator ID
  SELECT user_id INTO hotel_operator_id
  FROM referral_links
  WHERE id = NEW.referral_link_id;
  
  -- Get the hotel operator's commission rate
  SELECT COALESCE(commission_level, 10) INTO commission_rate
  FROM profiles
  WHERE id = hotel_operator_id;
  
  -- Create commission record
  INSERT INTO commissions (
    referral_id,
    amount,
    status
  ) VALUES (
    NEW.id,
    (booking_total * commission_rate / 100),
    'pending'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS calculate_commission_on_referral ON referrals;

-- Create trigger to calculate commission when a referral is created
CREATE TRIGGER calculate_commission_on_referral
AFTER INSERT ON referrals
FOR EACH ROW
EXECUTE FUNCTION calculate_referral_commission();