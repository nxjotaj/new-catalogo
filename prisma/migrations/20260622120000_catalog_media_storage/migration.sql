INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'catalog-media',
  'catalog-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  CREATE POLICY "catalog_media_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'catalog-media');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE POLICY "catalog_media_anon_insert"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'catalog-media');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
