-- ============================================
-- DATABASE DIAGNOSTIC SCRIPT
-- ============================================
-- This script checks where the users table exists
-- and what columns it has in both joscity and public schemas
-- 
-- Usage:
--   psql -U your_user -d postgres -f database/joscity/diagnose_database.sql
-- ============================================

-- Check which schemas exist
SELECT '=== SCHEMAS ===' as info;
SELECT schema_name FROM information_schema.schemata 
WHERE schema_name IN ('joscity', 'public')
ORDER BY schema_name;

-- Check where users table exists
SELECT '=== USERS TABLE LOCATIONS ===' as info;
SELECT 
    table_schema,
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_name = 'users'
AND table_schema IN ('joscity', 'public')
ORDER BY table_schema;

-- Check columns in joscity.users (if exists)
SELECT '=== COLUMNS IN joscity.users ===' as info;
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

-- Check columns in public.users (if exists)
SELECT '=== COLUMNS IN public.users ===' as info;
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

-- Check if user_id column exists in joscity.users
SELECT '=== user_id COLUMN CHECK (joscity) ===' as info;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'joscity' 
            AND table_name = 'users' 
            AND column_name = 'user_id'
        ) THEN 'EXISTS'
        ELSE 'MISSING'
    END as user_id_status;

-- Check if user_id column exists in public.users
SELECT '=== user_id COLUMN CHECK (public) ===' as info;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND column_name = 'user_id'
        ) THEN 'EXISTS'
        ELSE 'MISSING'
    END as user_id_status;

-- Check primary keys
SELECT '=== PRIMARY KEY CONSTRAINTS ===' as info;
SELECT 
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users'
AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY tc.table_schema;

-- Check current search_path (if connected)
SELECT '=== CURRENT SEARCH_PATH ===' as info;
SHOW search_path;

