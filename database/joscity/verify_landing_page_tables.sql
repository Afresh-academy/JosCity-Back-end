-- Verification script for landing page management tables
-- Run this to check if all required tables exist

-- Create landing_page schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS landing_page;

-- Set search path to landing_page schema
SET search_path TO landing_page;

-- List of all required tables for landing page management
DO $$
DECLARE
    tbl_name TEXT;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    required_tables TEXT[] := ARRAY[
        'navbar_menu_items',
        'navbar_settings',
        'contact_page_settings',
        'contact_messages',
        'contact_information',
        'events_page_settings',
        'events',
        'event_registrations',
        'services_page_settings',
        'services',
        'service_requests',
        'pricing_page_settings',
        'pricing_plans',
        'pricing_plan_features',
        'user_subscriptions',
        'guidelines_page_settings',
        'guidelines',
        'hero_page_settings',
        'hero_slides',
        'footer_settings',
        'footer_links'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables t
            WHERE t.table_schema = 'landing_page' 
            AND t.table_name = tbl_name
        ) THEN
            missing_tables := array_append(missing_tables, tbl_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) IS NULL THEN
        RAISE NOTICE 'SUCCESS: All required landing page tables exist!';
    ELSE
        RAISE NOTICE 'WARNING: Missing tables found: %', array_to_string(missing_tables, ', ');
        RAISE NOTICE 'Please run create_all_page_settings.sql and schema.sql to create missing tables.';
    END IF;
END $$;

-- List all existing landing page tables
SELECT 
    t.table_name,
    CASE 
        WHEN t.table_name = ANY(ARRAY[
            'navbar_menu_items', 'navbar_settings',
            'contact_page_settings', 'contact_messages', 'contact_information',
            'events_page_settings', 'events', 'event_registrations',
            'services_page_settings', 'services', 'service_requests',
            'pricing_page_settings', 'pricing_plans', 'pricing_plan_features', 'user_subscriptions',
            'guidelines_page_settings', 'guidelines',
            'hero_page_settings', 'hero_slides',
            'footer_settings', 'footer_links'
        ]) THEN '✓ Required'
        ELSE '○ Optional'
    END as status
FROM information_schema.tables t
WHERE t.table_schema = 'landing_page'
  AND (
    t.table_name LIKE '%navbar%' 
    OR t.table_name LIKE '%contact%'
    OR t.table_name LIKE '%event%'
    OR t.table_name LIKE '%service%'
    OR t.table_name LIKE '%pricing%'
    OR t.table_name LIKE '%guideline%'
    OR t.table_name LIKE '%hero%'
    OR t.table_name LIKE '%footer%'
  )
ORDER BY t.table_name;

