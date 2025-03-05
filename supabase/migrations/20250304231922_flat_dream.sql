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
  (
    -- Allow territory managers to view hotel operators in their territory
    EXISTS (
      SELECT 1 FROM profiles manager
      WHERE manager.id = auth.uid()
      AND manager.territory_id = profiles.territory_id
      AND 'territory_manager' = ANY(manager.roles)
    )
    AND 'hotel_operator' = ANY(profiles.roles)
  )
  OR
  -- Users can always view their own profile
  id = auth.uid()
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
  )
  AND 'hotel_operator' = ANY(profiles.roles)
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles manager
    WHERE manager.id = auth.uid()
    AND manager.territory_id = NEW.territory_id
    AND 'territory_manager' = ANY(manager.roles)
  )
  AND 'hotel_operator' = ANY(NEW.roles)
);

-- Update commission calculation function to use hotel operator's custom commission level
CREATE OR REPLACE FUNCTION calculate_booking_commissions()
RETURNS TRIGGER AS $$
DECLARE
  booking_total numeric;
  hotel_operator_id uuid;
  territory_manager_id uuid;
  territory_id text;
  hotel_operator_rate numeric;
  territory_manager_rate numeric;
  app_rate numeric;
  referral_link_id uuid;
BEGIN
  -- Get the booking total
  booking_total := NEW.total_price;
  
  -- Get the territory_id for this booking
  SELECT e.territory_id INTO territory_id
  FROM experiences e
  WHERE e.id = NEW.experience_id;
  
  -- Get the territory manager for this territory
  SELECT p.id INTO territory_manager_id
  FROM profiles p
  WHERE p.territory_id = territory_id
  AND 'territory_manager' = ANY(p.roles)
  LIMIT 1;
  
  -- Check if this booking came from a referral
  SELECT r.referral_link_id INTO referral_link_id
  FROM referrals r
  WHERE r.booking_id = NEW.id;
  
  -- If there's a referral, get the hotel operator
  IF referral_link_id IS NOT NULL THEN
    SELECT rl.user_id INTO hotel_operator_id
    FROM referral_links rl
    WHERE rl.id = referral_link_id;
  END IF;
  
  -- Get commission rates
  -- For hotel operators, use their custom commission_level if set
  IF hotel_operator_id IS NOT NULL THEN
    SELECT COALESCE(p.commission_level, cr.rate) INTO hotel_operator_rate
    FROM commission_rates cr
    LEFT JOIN profiles p ON p.id = hotel_operator_id
    WHERE cr.role = 'hotel_operator';
  END IF;
  
  SELECT rate INTO territory_manager_rate
  FROM commission_rates
  WHERE role = 'territory_manager';
  
  SELECT rate INTO app_rate
  FROM commission_rates
  WHERE role = 'app';
  
  -- Create commission earnings records
  
  -- Hotel operator commission (only if there's a referral)
  IF hotel_operator_id IS NOT NULL THEN
    INSERT INTO commission_earnings (
      booking_id, user_id, role, amount, status
    ) VALUES (
      NEW.id,
      hotel_operator_id,
      'hotel_operator',
      (booking_total * hotel_operator_rate / 100),
      'pending'
    );
  END IF;
  
  -- Territory manager commission
  IF territory_manager_id IS NOT NULL THEN
    INSERT INTO commission_earnings (
      booking_id, user_id, role, amount, status
    ) VALUES (
      NEW.id,
      territory_manager_id,
      'territory_manager',
      (booking_total * territory_manager_rate / 100),
      'pending'
    );
  END IF;
  
  -- App commission (no specific user)
  INSERT INTO commission_earnings (
    booking_id, role, amount, status
  ) VALUES (
    NEW.id,
    'app',
    (booking_total * app_rate / 100),
    'pending'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;