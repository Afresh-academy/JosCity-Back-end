-- ============================================
-- CHECK USERS TABLE STRUCTURE
-- ============================================
-- This script checks the structure of the users table
-- to verify if user_id column exists and what columns are present
-- 
-- Usage:
--   psql -U your_user -d postgres -f database/joscity/check_users_table.sql
-- ============================================

SET search_path TO joscity;

-- Check if joscity schema exists
SELECT EXISTS (
    SELECT 1 FROM information_schema.schemata 
    WHERE schema_name = 'joscity'
) AS schema_exists;

-- Check if users table exists in joscity schema
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'joscity' AND table_name = 'users'
) AS table_exists_in_joscity;

-- Check if users table exists in public schema
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
) AS table_exists_in_public;

-- List all columns in joscity.users table (if it exists)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'joscity' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- List all columns in public.users table (if it exists)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Check primary key constraints
SELECT 
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users'
AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY tc.table_schema, tc.table_name;

-- Check if user_id column exists in joscity.users
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'joscity' 
    AND table_name = 'users' 
    AND column_name = 'user_id'
) AS user_id_exists_in_joscity;

-- Check if user_id column exists in public.users
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'user_id'
) AS user_id_exists_in_joscity;

