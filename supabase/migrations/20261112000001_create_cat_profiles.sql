-- Migration: Create cat_profiles table with Row Level Security (RLS)
-- Adheres to Docs/Security Architecture and Hardening.md

-- 1. Create cat_profiles table
CREATE TABLE IF NOT EXISTS public.cat_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    cat_name TEXT NOT NULL CHECK (char_length(trim(cat_name)) >= 1 AND char_length(cat_name) <= 60),
    cat_breed TEXT NOT NULL DEFAULT 'Domestic Shorthair' CHECK (char_length(cat_breed) <= 60),
    station_name TEXT NOT NULL DEFAULT 'PawStation Unit 1' CHECK (char_length(trim(station_name)) >= 1 AND char_length(station_name) <= 80),
    station_preferences JSONB DEFAULT '{"portion_size_g": 35, "water_interval_h": 4, "low_water_threshold": 1500}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Index for rapid lookup by user_id
CREATE INDEX IF NOT EXISTS idx_cat_profiles_user_id ON public.cat_profiles (user_id);

-- 3. Enable Row Level Security (defense-in-depth)
ALTER TABLE public.cat_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Revoke public/anon access and grant least-privilege to authenticated role
REVOKE ALL ON public.cat_profiles FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cat_profiles TO authenticated;

-- 5. Granular RLS Policies enforcing user isolation
CREATE POLICY "Users can view their own cat profile"
ON public.cat_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cat profile"
ON public.cat_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cat profile"
ON public.cat_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cat profile"
ON public.cat_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
