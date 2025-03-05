-- Add video_urls column to experiences table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'experiences' AND column_name = 'video_urls'
  ) THEN
    ALTER TABLE experiences ADD COLUMN video_urls text[] DEFAULT '{}';
  END IF;
END $$;

-- Update policies to include video_urls
DROP POLICY IF EXISTS "Tour guides can update their own experiences" ON experiences;
CREATE POLICY "Tour guides can update their own experiences"
ON experiences
FOR UPDATE
TO authenticated
USING (
  guide_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND 'tour_guide' = ANY(profiles.roles)
  )
);

DROP POLICY IF EXISTS "Territory managers can update experiences in their territory" ON experiences;
CREATE POLICY "Territory managers can update experiences in their territory"
ON experiences
FOR UPDATE
TO authenticated
USING (
  territory_id IN (
    SELECT territory_id FROM profiles
    WHERE profiles.id = auth.uid()
    AND 'territory_manager' = ANY(profiles.roles)
  )
);