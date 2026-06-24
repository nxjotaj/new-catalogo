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
