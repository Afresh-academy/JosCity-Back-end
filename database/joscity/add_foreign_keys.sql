-- ============================================
-- ADD FOREIGN KEY CONSTRAINTS TO USERS TABLE
-- ============================================
-- 
-- Run this script AFTER:
-- 1. Your users table exists
-- 2. All tables from schema.sql have been created successfully
-- 3. You've verified your users table primary key column name (user_id or id)
-- 
-- IMPORTANT: If your users table uses 'id' instead of 'user_id', 
-- replace 'user_id' with 'id' in all statements below

-- Check users table structure first (uncomment to run):
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND table_schema = 'public';

-- Add foreign key constraints
-- Note: These will fail if constraints already exist - that's okay!

ALTER TABLE navbar_settings 
  ADD CONSTRAINT fk_navbar_settings_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE contact_page_settings 
  ADD CONSTRAINT fk_contact_page_settings_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE events_page_settings 
  ADD CONSTRAINT fk_events_page_settings_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE events 
  ADD CONSTRAINT fk_events_created_by 
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE event_registrations 
  ADD CONSTRAINT fk_event_registrations_user_id 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE services_page_settings 
  ADD CONSTRAINT fk_services_page_settings_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE service_requests 
  ADD CONSTRAINT fk_service_requests_user_id 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE pricing_page_settings 
  ADD CONSTRAINT fk_pricing_page_settings_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE user_subscriptions 
  ADD CONSTRAINT fk_user_subscriptions_user_id 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE guidelines_page_settings 
  ADD CONSTRAINT fk_guidelines_page_settings_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE hero_page_settings 
  ADD CONSTRAINT fk_hero_page_settings_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE footer_settings 
  ADD CONSTRAINT fk_footer_settings_updated_by 
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE audit_logs 
  ADD CONSTRAINT fk_audit_logs_user_id 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- Verify constraints were added
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f' 
  AND confrelid = 'users'::regclass
ORDER BY table_name;

