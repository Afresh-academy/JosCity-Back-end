-- Quick fix: Create navbar_settings table if it doesn't exist
-- Run this script if you get "relation navbar_settings does not exist" error

-- Ensure we're in the public schema
SET search_path TO public;

-- Create the table
CREATE TABLE IF NOT EXISTS navbar_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_url TEXT,
    logo_alt VARCHAR(255),
    get_started_button_text VARCHAR(100) DEFAULT 'Get Started',
    get_started_button_route VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_navbar_settings_updated_at ON navbar_settings;
CREATE TRIGGER update_navbar_settings_updated_at 
    BEFORE UPDATE ON navbar_settings
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default data if table is empty
INSERT INTO navbar_settings (get_started_button_text, get_started_button_route, is_active)
SELECT 'Get Started', '/welcome', true
WHERE NOT EXISTS (SELECT 1 FROM navbar_settings);

-- Verify table was created
SELECT 'navbar_settings table created successfully!' AS status;

