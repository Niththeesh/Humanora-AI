-- Humanora AI: Initial Schema Migration (Supabase PostgreSQL)
-- Version: 001
-- Description: Creates profiles, writing sessions, transformations, and usage quota enforcement tables.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles (Optional / auth-linked)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    full_name TEXT,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
    monthly_word_limit INTEGER NOT NULL DEFAULT 50000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Writing Sessions
CREATE TABLE IF NOT EXISTS public.writing_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    title TEXT DEFAULT 'Untitled Session',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for session queries
CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.writing_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.writing_sessions(user_id);

-- 3. Transformations / Writing History
CREATE TABLE IF NOT EXISTS public.transformations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.writing_sessions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN (
        'natural', 'academic', 'professional', 'casual', 'concise',
        'expand', 'grammar', 'tone', 'paraphrase', 'summary',
        'standard', 'advanced', 'creative'
    )),
    tone_value NUMERIC(4, 2) DEFAULT 0.50,
    intensity TEXT DEFAULT 'balanced' CHECK (intensity IN ('subtle', 'balanced', 'deep')),
    original_text TEXT NOT NULL,
    humanized_text TEXT NOT NULL,
    original_word_count INTEGER NOT NULL DEFAULT 0,
    humanized_word_count INTEGER NOT NULL DEFAULT 0,
    original_char_count INTEGER NOT NULL DEFAULT 0,
    humanized_char_count INTEGER NOT NULL DEFAULT 0,
    engine_used TEXT NOT NULL DEFAULT 'gemini' CHECK (engine_used IN ('gemini', 'linguistic-engine')),
    model_version TEXT,
    latency_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup by session or user
CREATE INDEX IF NOT EXISTS idx_transformations_session_id ON public.transformations(session_id);
CREATE INDEX IF NOT EXISTS idx_transformations_user_id ON public.transformations(user_id);
CREATE INDEX IF NOT EXISTS idx_transformations_created_at ON public.transformations(created_at DESC);

-- 4. Daily Usage Records (Rate-limiting & Quota Enforcement)
CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    request_type TEXT NOT NULL DEFAULT 'transform',
    characters_processed INTEGER NOT NULL DEFAULT 0,
    words_processed INTEGER NOT NULL DEFAULT 0,
    ip_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usage_session_time ON public.usage_records(session_token, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_user_time ON public.usage_records(user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- 5. Grant table and sequence permissions to PostgREST roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 6. Policies for Standalone Workspace & Authenticated Users
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

