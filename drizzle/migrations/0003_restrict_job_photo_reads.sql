DROP POLICY IF EXISTS "public read job photos" ON storage.objects;
CREATE POLICY "admin read job photos" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'job-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));