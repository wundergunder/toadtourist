/*
  # Commission Tracking System

  1. New Tables
    - `commission_rates` - Stores configurable commission rates for each role
    - `commission_earnings` - Tracks actual earnings from bookings
    - `commission_payments` - Records when commissions are paid out
  
  2. Security
    - Enable RLS on all tables
    - Add policies for appropriate access control
  
  3. Functions
    - Add trigger to automatically calculate commissions on booking creation
*/

-- Create commission_rates table
CREATE TABLE IF NOT EXISTS commission_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  rate numeric NOT NULL CHECK (rate >= 0 AND rate <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(role)
);

-- Create commission_earnings table
CREATE TABLE IF NOT EXISTS commission_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  status text NOT NULL CHECK (status IN ('pending', 'paid')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create commission_payments table
CREATE TABLE IF NOT EXISTS commission_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  payment_method text NOT NULL,
  payment_reference text,
  payment_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE commission_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_payments ENABLE ROW LEVEL SECURITY;

-- Policies for commission_rates
CREATE POLICY "Admins can manage commission rates"
  ON commission_rates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.roles)
    )
  );

CREATE POLICY "Everyone can view commission rates"
  ON commission_rates
  FOR SELECT
  USING (true);

-- Policies for commission_earnings
CREATE POLICY "Users can view their own earnings"
  ON commission_earnings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all earnings"
  ON commission_earnings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.roles)
    )
  );

CREATE POLICY "Admins can update earnings"
  ON commission_earnings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.roles)
    )
  );

-- Policies for commission_payments
CREATE POLICY "Users can view their own payments"
  ON commission_payments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments"
  ON commission_payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.roles)
    )
  );

CREATE POLICY "Admins can create payments"
  ON commission_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.roles)
    )
  );

-- Insert default commission rates
INSERT INTO commission_rates (role, rate)
VALUES 
  ('hotel_operator', 10),
  ('territory_manager', 10),
  ('app', 10)
ON CONFLICT (role) DO UPDATE
SET rate = EXCLUDED.rate;

-- Create a function to calculate commissions when a booking is created
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
  SELECT rate INTO hotel_operator_rate
  FROM commission_rates
  WHERE role = 'hotel_operator';
  
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

-- Create trigger to calculate commissions on booking creation
DROP TRIGGER IF EXISTS calculate_commissions_on_booking ON bookings;
CREATE TRIGGER calculate_commissions_on_booking
AFTER INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION calculate_booking_commissions();

-- Create a function to mark earnings as paid when a payment is created
CREATE OR REPLACE FUNCTION mark_earnings_as_paid()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the status of all pending earnings for this user and role
  UPDATE commission_earnings
  SET 
    status = 'paid',
    updated_at = now()
  WHERE 
    user_id = NEW.user_id
    AND role = NEW.role
    AND status = 'pending'
    AND amount <= NEW.amount;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to mark earnings as paid when a payment is created
DROP TRIGGER IF EXISTS mark_earnings_paid_on_payment ON commission_payments;
CREATE TRIGGER mark_earnings_paid_on_payment
AFTER INSERT ON commission_payments
FOR EACH ROW
EXECUTE FUNCTION mark_earnings_as_paid();