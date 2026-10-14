-- Run this snippet in Supabase SQL Editor to grant permissions and fix RLS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Allow access to own transformations" ON public.transformations;
DROP POLICY IF EXISTS "Allow public access to transformations" ON public.transformations;
CREATE POLICY "Allow public access to transformations"
    ON public.transformations
    FOR ALL
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to writing_sessions" ON public.writing_sessions;
CREATE POLICY "Allow public access to writing_sessions"
    ON public.writing_sessions
    FOR ALL
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);
