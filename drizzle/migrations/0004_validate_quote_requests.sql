DROP POLICY IF EXISTS "anyone can request quote" ON public.quote_requests;
CREATE POLICY "anyone can request quote" ON public.quote_requests FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 100
  AND char_length(btrim(phone)) BETWEEN 6 AND 30
  AND char_length(btrim(suburb)) BETWEEN 1 AND 100
  AND char_length(btrim(details)) BETWEEN 1 AND 2000
  AND (email IS NULL OR (char_length(email) <= 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
);