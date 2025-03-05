-- Add featured flag to experiences table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'experiences' AND column_name = 'featured'
  ) THEN
    ALTER TABLE experiences ADD COLUMN featured boolean DEFAULT false;
  END IF;
END $$;

-- Add featured_order to experiences table for ordering on homepage
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'experiences' AND column_name = 'featured_order'
  ) THEN
    ALTER TABLE experiences ADD COLUMN featured_order integer;
  END IF;
END $$;

-- Add constraint to ensure only 3 featured experiences per territory
CREATE OR REPLACE FUNCTION check_featured_experiences()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.featured = true THEN
    IF (
      SELECT COUNT(*)
      FROM experiences
      WHERE territory_id = NEW.territory_id
      AND featured = true
      AND id != NEW.id
    ) >= 3 THEN
      RAISE EXCEPTION 'Only 3 featured experiences allowed per territory';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS enforce_featured_limit ON experiences;

-- Create trigger to enforce featured limit
CREATE TRIGGER enforce_featured_limit
BEFORE INSERT OR UPDATE ON experiences
FOR EACH ROW
WHEN (NEW.featured = true)
EXECUTE FUNCTION check_featured_experiences();

-- Add policy to allow territory managers to update featured status
CREATE POLICY "Territory managers can update featured status"
ON experiences
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.territory_id = experiences.territory_id
    AND 'territory_manager' = ANY(profiles.roles)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.territory_id = experiences.territory_id
    AND 'territory_manager' = ANY(profiles.roles)
  )
);