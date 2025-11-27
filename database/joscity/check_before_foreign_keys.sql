-- Check if users table exists and what the primary key column is
-- Run this BEFORE adding foreign key constraints

-- Check if users table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') 
        THEN '✅ users table EXISTS'
        ELSE '❌ users table DOES NOT EXIST - Create it first!'
    END AS users_table_status;

-- Check users table structure (if it exists)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if all required tables exist
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t.table_name)
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status
FROM (VALUES
    ('navbar_settings'),
    ('contact_page_settings'),
    ('events_page_settings'),
    ('events'),
    ('event_registrations'),
    ('services_page_settings'),
    ('services'),
    ('service_requests'),
    ('pricing_page_settings'),
    ('pricing_plans'),
    ('user_subscriptions'),
    ('guidelines_page_settings'),
    ('hero_page_settings'),
    ('footer_settings'),
    ('audit_logs')
) AS t(table_name)
ORDER BY table_name;

