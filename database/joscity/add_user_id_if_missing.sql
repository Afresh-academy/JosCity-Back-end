-- ============================================
-- ADD USER_ID COLUMN IF MISSING
-- ============================================
-- Simple script to add user_id column if it doesn't exist
-- This handles the case where the table exists but is missing user_id
-- 
-- Usage:
--   psql -U your_user -d postgres -f database/joscity/add_user_id_if_missing.sql
-- ============================================

-- Ensure joscity schema exists
CREATE SCHEMA IF NOT EXISTS joscity;

-- Set search path
SET search_path TO joscity, public;

-- Add user_id column if it doesn't exist (for joscity.users)
DO $$
BEGIN
    -- Check and add to joscity.users if table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'joscity' AND table_name = 'users'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'joscity' 
            AND table_name = 'users' 
            AND column_name = 'user_id'
        ) THEN
            -- Add user_id as SERIAL column
            ALTER TABLE joscity.users ADD COLUMN user_id SERIAL;
            
            -- Set as primary key if no primary key exists
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_schema = 'joscity'
                AND table_name = 'users'
                AND constraint_type = 'PRIMARY KEY'
            ) THEN
                ALTER TABLE joscity.users ADD PRIMARY KEY (user_id);
            END IF;
            
            RAISE NOTICE 'Added user_id column to joscity.users';
        ELSE
            RAISE NOTICE 'user_id column already exists in joscity.users';
        END IF;
    END IF;
    
    -- Check and add to public.users if table exists (in case table is in wrong schema)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND column_name = 'user_id'
        ) THEN
            -- Add user_id as SERIAL column
            ALTER TABLE public.users ADD COLUMN user_id SERIAL;
            
            -- Set as primary key if no primary key exists
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_schema = 'public'
                AND table_name = 'users'
                AND constraint_type = 'PRIMARY KEY'
            ) THEN
                ALTER TABLE public.users ADD PRIMARY KEY (user_id);
            END IF;
            
            RAISE NOTICE 'Added user_id column to public.users';
        ELSE
            RAISE NOTICE 'user_id column already exists in public.users';
        END IF;
    END IF;
END $$;

-- Verify the fix
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name = 'user_id'
ORDER BY table_schema;

