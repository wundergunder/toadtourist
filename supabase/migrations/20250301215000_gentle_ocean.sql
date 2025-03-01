/*
  # Fix RLS policies for experiences

  1. Security
    - Update RLS policies for experiences to allow territory managers to create and update experiences
    - Add policy for territory managers to manage experiences in their territory
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Tour guides can create experiences" ON experiences;
DROP POLICY IF EXISTS "Tour guides can update their own experiences" ON experiences;

-- Create new policies that allow both tour guides and territory managers to manage experiences
CREATE POLICY "Tour guides can create experiences"
ON experiences
FOR INSERT
TO authenticated
WITH CHECK (
  guide_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'tour_guide'
  )
);

CREATE POLICY "Territory managers can create experiences"
ON experiences
FOR INSERT
TO authenticated
WITH CHECK (
  territory_id IN (
    SELECT territory_id FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'territory_manager'
  )
);

CREATE POLICY "Tour guides can update their own experiences"
ON experiences
FOR UPDATE
TO authenticated
USING (
  guide_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'tour_guide'
  )
);

CREATE POLICY "Territory managers can update experiences in their territory"
ON experiences
FOR UPDATE
TO authenticated
USING (
  territory_id IN (
    SELECT territory_id FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'territory_manager'
  )
);

CREATE POLICY "Territory managers can delete experiences in their territory"
ON experiences
FOR DELETE
TO authenticated
USING (
  territory_id IN (
    SELECT territory_id FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'territory_manager'
  )
);

-- Ensure admins can manage all experiences
CREATE POLICY "Admins can manage all experiences"
ON experiences
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);