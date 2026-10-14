-- Humanora AI: Production Row-Level Security (RLS) Policy Migration
-- Version: 003
-- Description: Enforces strict user ownership and prevents unauthorized or cross-tenant data access.

-- 1. Ensure RLS is active on all core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- 2. Clean up overly permissive public policies and old definitions
DROP POLICY IF EXISTS "Allow public access to transformations" ON public.transformations;
DROP POLICY IF EXISTS "Allow public access to writing_sessions" ON public.writing_sessions;
DROP POLICY IF EXISTS "Allow access to own transformations" ON public.transformations;
DROP POLICY IF EXISTS "Allow service_role full access to transformations" ON public.transformations;
DROP POLICY IF EXISTS "Service role full access to transformations" ON public.transformations;
DROP POLICY IF EXISTS "Authenticated users view own transformations" ON public.transformations;
DROP POLICY IF EXISTS "Authenticated users insert own transformations" ON public.transformations;
DROP POLICY IF EXISTS "Authenticated users delete own transformations" ON public.transformations;

-- 3. Transformations Table Policies

-- 3A. Service role (Backend Server API) has full administrative access
CREATE POLICY "Service role full access to transformations"
    ON public.transformations
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3B. Authenticated users can only read their own transformations
CREATE POLICY "Authenticated users view own transformations"
    ON public.transformations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 3C. Authenticated users can insert transformations belonging to themselves
CREATE POLICY "Authenticated users insert own transformations"
    ON public.transformations
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 3D. Authenticated users can delete their own transformations
CREATE POLICY "Authenticated users delete own transformations"
    ON public.transformations
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 4. Writing Sessions Table Policies
DROP POLICY IF EXISTS "Service role full access to writing_sessions" ON public.writing_sessions;
DROP POLICY IF EXISTS "Authenticated users view own sessions" ON public.writing_sessions;
DROP POLICY IF EXISTS "Authenticated users manage own sessions" ON public.writing_sessions;

-- 4A. Service role full access
CREATE POLICY "Service role full access to writing_sessions"
    ON public.writing_sessions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 4B. Authenticated users view own writing sessions
CREATE POLICY "Authenticated users view own sessions"
    ON public.writing_sessions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 4C. Authenticated users manage own writing sessions
CREATE POLICY "Authenticated users manage own sessions"
    ON public.writing_sessions
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Profiles Table Policies
DROP POLICY IF EXISTS "Service role full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users update own profile" ON public.profiles;

CREATE POLICY "Service role full access to profiles"
    ON public.profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Authenticated users update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 6. Usage Records Table Policies
DROP POLICY IF EXISTS "Service role full access to usage_records" ON public.usage_records;
DROP POLICY IF EXISTS "Authenticated users view own usage" ON public.usage_records;

CREATE POLICY "Service role full access to usage_records"
    ON public.usage_records
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users view own usage"
    ON public.usage_records
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

