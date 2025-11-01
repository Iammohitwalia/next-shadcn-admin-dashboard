-- Create storage bucket for employee photos and media
-- Run this in Supabase SQL Editor after creating the bucket in the dashboard

-- Create the storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('strixmedia', 'strixmedia', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for strixmedia bucket

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to strixmedia"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'strixmedia' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Policy: Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update their uploads in strixmedia"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'strixmedia' AND
  auth.uid()::text = (storage.foldername(name))[2]
)
WITH CHECK (
  bucket_id = 'strixmedia' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Policy: Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete their uploads in strixmedia"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'strixmedia' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Policy: Allow public read access to strixmedia bucket
CREATE POLICY "Public can read from strixmedia"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'strixmedia');

-- Policy: Allow authenticated users to read from strixmedia
CREATE POLICY "Authenticated users can read from strixmedia"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'strixmedia');

