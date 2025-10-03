-- Migration: Create Supabase Storage bucket for guest speaker photos
-- This allows uploading and storing speaker profile images

-- Create storage bucket for speaker photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'speaker-photos',
  'speaker-photos',
  true,  -- Public bucket so images are accessible
  2097152,  -- 2MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']  -- Allowed image types
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated users to upload
CREATE POLICY "Authenticated users can upload speaker photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'speaker-photos');

-- Create storage policy to allow public read access
CREATE POLICY "Public can view speaker photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'speaker-photos');

-- Create storage policy to allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update speaker photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'speaker-photos');

-- Create storage policy to allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete speaker photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'speaker-photos');
