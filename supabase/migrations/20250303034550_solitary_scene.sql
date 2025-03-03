-- Create a new storage bucket for media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for the media bucket
CREATE POLICY "Allow authenticated users to upload media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow public access to media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

CREATE POLICY "Allow users to update their own media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND owner = auth.uid());

CREATE POLICY "Allow users to delete their own media"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND owner = auth.uid());

-- Add video_urls column to experiences table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'experiences' AND column_name = 'video_urls'
  ) THEN
    ALTER TABLE experiences ADD COLUMN video_urls text[] DEFAULT '{}';
  END IF;
END $$;