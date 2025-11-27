-- Active: 1763927870265@@aws-1-eu-west-1.pooler.supabase.com@5432@postgres
-- JosCity Database Schema
-- PostgreSQL tables for all pages (except Admin and NewsFeed)
-- Database: joscity

-- Set search path to public schema (Supabase default)
SET search_path TO public;

-- IMPORTANT: Foreign Key Note
-- This schema includes foreign key references to a 'users' table that should exist
-- from your authentication schema. If you get errors about missing 'users' table:
-- 
-- Option 1 (Recommended): Create your users table first before running this schema
-- 
-- Option 2: Temporarily remove foreign key constraints by replacing:
--   "UUID REFERENCES users(id) ON DELETE SET NULL" 
--   with just:
--   "UUID"
-- Then add constraints later using the ALTER TABLE statements provided at the end of this file

-- UUID Generation
-- This schema uses gen_random_uuid() which is available by default in:
-- - Supabase (all versions)
-- - PostgreSQL 13+ 
-- - PostgreSQL 12 with pgcrypto extension enabled
-- 
-- If you need uuid-ossp extension instead, replace all gen_random_uuid() 
-- with uuid_generate_v4() and uncomment the line below:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- NAVBAR PAGE TABLES
-- ============================================

-- Navigation Menu Items Table
CREATE TABLE IF NOT EXISTS navbar_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label VARCHAR(100) NOT NULL,
    link_type VARCHAR(50) NOT NULL CHECK (link_type IN ('scroll', 'route', 'external')),
    link_target VARCHAR(500),
    scroll_target_id VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    requires_auth BOOLEAN DEFAULT false,
    icon_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_navbar_menu_items_active ON navbar_menu_items(is_active);
CREATE INDEX idx_navbar_menu_items_order ON navbar_menu_items(display_order);

-- Navbar Settings Table
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

-- ============================================
-- CONTACT PAGE TABLES
-- ============================================

-- Contact Page Settings Table
CREATE TABLE IF NOT EXISTS contact_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Contact Us',
    heading VARCHAR(255) NOT NULL,
    subheading TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);


-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(500),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    replied_at TIMESTAMP WITH TIME ZONE,
    reply_message TEXT
);

CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);

-- Contact Information Table (for storing phone, email, location details)
CREATE TABLE IF NOT EXISTS contact_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_type VARCHAR(50) NOT NULL CHECK (contact_type IN ('phone', 'email', 'location')),
    title VARCHAR(255) NOT NULL,
    primary_value VARCHAR(500) NOT NULL,
    secondary_value VARCHAR(500),
    icon_color VARCHAR(7),
    icon_background VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_information_type ON contact_information(contact_type);
CREATE INDEX idx_contact_information_active ON contact_information(is_active);

-- ============================================
-- EVENTS PAGE TABLES
-- ============================================

-- Events Page Settings Table
CREATE TABLE IF NOT EXISTS events_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Upcoming Events in Jos',
    heading VARCHAR(255),
    subheading TEXT,
    default_image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    end_date DATE,
    end_time TIME,
    location VARCHAR(500),
    venue VARCHAR(255),
    image_url TEXT,
    event_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    ticket_price DECIMAL(10, 2),
    ticket_currency VARCHAR(10) DEFAULT 'NGN',
    registration_required BOOLEAN DEFAULT false,
    registration_deadline DATE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'attended')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_amount DECIMAL(10, 2),
    payment_reference VARCHAR(255),
    checked_in_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(status);

-- ============================================
-- SERVICES PAGE TABLES
-- ============================================

-- Services Page Settings Table
CREATE TABLE IF NOT EXISTS services_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Our Services',
    heading VARCHAR(255) NOT NULL,
    subheading TEXT,
    view_all_button_text VARCHAR(100) DEFAULT 'View All',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_color VARCHAR(7) NOT NULL,
    icon_svg TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    service_url VARCHAR(500),
    requires_authentication BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_display_order ON services(display_order);

-- Service Requests Table
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    user_id UUID,
    request_type VARCHAR(100),
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'cancelled')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID,
    response TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_requests_service_id ON service_requests(service_id);
CREATE INDEX idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);

-- ============================================
-- PRICING PAGE TABLES
-- ============================================

-- Pricing Page Settings Table
CREATE TABLE IF NOT EXISTS pricing_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Jos Smart City Pricing',
    heading VARCHAR(255) NOT NULL,
    subheading TEXT,
    subscribe_button_text VARCHAR(100) DEFAULT 'Subscribe Now',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Pricing Plans Table
CREATE TABLE IF NOT EXISTS pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'NGN',
    billing_period VARCHAR(50) DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly', 'one-time')),
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricing_plans_plan_key ON pricing_plans(plan_key);
CREATE INDEX idx_pricing_plans_active ON pricing_plans(is_active);

-- Pricing Plan Features Table
CREATE TABLE IF NOT EXISTS pricing_plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES pricing_plans(id) ON DELETE CASCADE,
    feature_name VARCHAR(255) NOT NULL,
    is_included BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricing_plan_features_plan_id ON pricing_plan_features(plan_id);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_id UUID NOT NULL REFERENCES pricing_plans(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT true,
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);

-- ============================================
-- GUIDELINES PAGE TABLES
-- ============================================

-- Guidelines Page Settings Table
CREATE TABLE IF NOT EXISTS guidelines_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Guidelines',
    heading VARCHAR(255) DEFAULT 'PWA Guidelines',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Guidelines Table
CREATE TABLE IF NOT EXISTS guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(255),
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    author_image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guidelines_active ON guidelines(is_active);
CREATE INDEX idx_guidelines_display_order ON guidelines(display_order);

-- ============================================
-- HERO PAGE TABLES
-- ============================================

-- Hero Page Settings Table
CREATE TABLE IF NOT EXISTS hero_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slide_duration_seconds INTEGER DEFAULT 5,
    auto_advance BOOLEAN DEFAULT true,
    show_navigation_dots BOOLEAN DEFAULT true,
    show_prev_next_arrows BOOLEAN DEFAULT true,
    default_badge_text VARCHAR(255),
    primary_button_text VARCHAR(100) DEFAULT 'Get Started',
    primary_button_route VARCHAR(500),
    secondary_button_text VARCHAR(100),
    secondary_button_route VARCHAR(500),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Hero Slides Table
CREATE TABLE IF NOT EXISTS hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    image_url TEXT NOT NULL,
    image_alt VARCHAR(255),
    slide_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    link_url VARCHAR(500),
    link_text VARCHAR(100),
    button_text VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hero_slides_active ON hero_slides(is_active);
CREATE INDEX idx_hero_slides_order ON hero_slides(slide_order);

-- ============================================
-- FOOTER PAGE TABLES
-- ============================================

-- Footer Links Table
CREATE TABLE IF NOT EXISTS footer_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_text VARCHAR(255) NOT NULL,
    link_url VARCHAR(500) NOT NULL,
    section VARCHAR(100) NOT NULL CHECK (section IN ('quick_links', 'services', 'legal', 'social')),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    opens_in_new_tab BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_footer_links_section ON footer_links(section);
CREATE INDEX idx_footer_links_active ON footer_links(is_active);

-- Footer Settings Table
CREATE TABLE IF NOT EXISTS footer_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_url TEXT,
    tagline TEXT,
    copyright_text TEXT,
    social_media JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- ============================================
-- COMMON TABLES
-- ============================================

-- Audit Log Table (for tracking changes)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_information_updated_at BEFORE UPDATE ON contact_information
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON pricing_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guidelines_updated_at BEFORE UPDATE ON guidelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON hero_slides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_footer_links_updated_at BEFORE UPDATE ON footer_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_footer_settings_updated_at BEFORE UPDATE ON footer_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_navbar_menu_items_updated_at BEFORE UPDATE ON navbar_menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for navbar_settings if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'navbar_settings') THEN
        DROP TRIGGER IF EXISTS update_navbar_settings_updated_at ON navbar_settings;
        CREATE TRIGGER update_navbar_settings_updated_at BEFORE UPDATE ON navbar_settings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create triggers for page settings tables (conditional)
DO $$
BEGIN
    -- Contact Page Settings
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_page_settings') THEN
        DROP TRIGGER IF EXISTS update_contact_page_settings_updated_at ON contact_page_settings;
        CREATE TRIGGER update_contact_page_settings_updated_at BEFORE UPDATE ON contact_page_settings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Events Page Settings
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events_page_settings') THEN
        DROP TRIGGER IF EXISTS update_events_page_settings_updated_at ON events_page_settings;
        CREATE TRIGGER update_events_page_settings_updated_at BEFORE UPDATE ON events_page_settings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Services Page Settings
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services_page_settings') THEN
        DROP TRIGGER IF EXISTS update_services_page_settings_updated_at ON services_page_settings;
        CREATE TRIGGER update_services_page_settings_updated_at BEFORE UPDATE ON services_page_settings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Pricing Page Settings
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pricing_page_settings') THEN
        DROP TRIGGER IF EXISTS update_pricing_page_settings_updated_at ON pricing_page_settings;
        CREATE TRIGGER update_pricing_page_settings_updated_at BEFORE UPDATE ON pricing_page_settings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Guidelines Page Settings
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'guidelines_page_settings') THEN
        DROP TRIGGER IF EXISTS update_guidelines_page_settings_updated_at ON guidelines_page_settings;
        CREATE TRIGGER update_guidelines_page_settings_updated_at BEFORE UPDATE ON guidelines_page_settings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Hero Page Settings
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hero_page_settings') THEN
        DROP TRIGGER IF EXISTS update_hero_page_settings_updated_at ON hero_page_settings;
        CREATE TRIGGER update_hero_page_settings_updated_at BEFORE UPDATE ON hero_page_settings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================
-- INITIAL DATA (Optional - can be inserted via admin panel)
-- ============================================

-- Insert default pricing plans
INSERT INTO pricing_plans (plan_key, name, price, billing_period, is_popular, display_order) VALUES
    ('platinum', 'Platinium Membership Package', 20000.00, 'monthly', false, 1),
    ('gold', 'Gold Membership Package', 10000.00, 'monthly', false, 2),
    ('silver', 'Silver Membership Package', 5000.00, 'monthly', false, 3),
    ('bronze', 'Bronze Membership Package', 2000.00, 'monthly', false, 4)
ON CONFLICT (plan_key) DO NOTHING;

-- Insert default pricing plan features
INSERT INTO pricing_plan_features (plan_id, feature_name, is_included, display_order)
SELECT 
    p.id,
    f.feature_name,
    f.is_included,
    f.display_order
FROM pricing_plans p
CROSS JOIN (VALUES
    ('platinum', '10% Discount', true, 1),
    ('platinum', 'Premium Partners', true, 2),
    ('platinum', 'Free Monthly Service', true, 3),
    ('platinum', 'Unlimited brands/users', true, 4),
    ('platinum', 'VIP perks', true, 5),
    ('gold', '10% Discount', true, 1),
    ('gold', 'Premium Partners', true, 2),
    ('gold', 'Free Monthly Service', true, 3),
    ('gold', 'Unlimited brands/users', false, 4),
    ('gold', 'VIP perks', false, 5),
    ('silver', '10% Discount', true, 1),
    ('silver', 'Premium Partners', true, 2),
    ('silver', 'Free Monthly Service', false, 3),
    ('silver', 'Unlimited brands/users', false, 4),
    ('silver', 'VIP perks', false, 5),
    ('bronze', '10% Discount', true, 1),
    ('bronze', 'Premium Partners', false, 2),
    ('bronze', 'Free Monthly Service', false, 3),
    ('bronze', 'Unlimited brands/users', false, 4),
    ('bronze', 'VIP perks', false, 5)
) AS f(plan_key, feature_name, is_included, display_order)
WHERE p.plan_key = f.plan_key
ON CONFLICT DO NOTHING;

-- Insert default navbar menu items (only if table is empty)
INSERT INTO navbar_menu_items (label, link_type, scroll_target_id, display_order, is_active)
SELECT label, link_type, scroll_target_id, display_order, is_active FROM (VALUES
    ('Home', 'scroll', 'home', 1, true::BOOLEAN),
    ('About', 'scroll', 'about', 2, true::BOOLEAN),
    ('Guidelines', 'scroll', 'guidelines', 3, true::BOOLEAN),
    ('Services', 'scroll', 'services', 4, true::BOOLEAN),
    ('Contact Us', 'scroll', 'contact', 5, true::BOOLEAN)
) AS v(label, link_type, scroll_target_id, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM navbar_menu_items);

-- Insert default page settings (only if table exists and is empty)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_page_settings') THEN
        INSERT INTO contact_page_settings (badge_text, heading, subheading)
        SELECT 'Contact Us', 'Get in Touch', 'Our support team is available 24/7 to assist you'
        WHERE NOT EXISTS (SELECT 1 FROM contact_page_settings);
    END IF;
END $$;

-- Insert default events page settings
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events_page_settings') THEN
        INSERT INTO events_page_settings (badge_text)
        SELECT 'Upcoming Events in Jos'
        WHERE NOT EXISTS (SELECT 1 FROM events_page_settings);
    END IF;
END $$;

-- Insert default services page settings
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services_page_settings') THEN
        INSERT INTO services_page_settings (badge_text, heading, subheading, view_all_button_text)
        SELECT 'Our Services', 'Comprehensive City Services', 'Everything you need to interact with city services, all digitized and accessible 24/7', 'View All'
        WHERE NOT EXISTS (SELECT 1 FROM services_page_settings);
    END IF;
END $$;

-- Insert default pricing page settings
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pricing_page_settings') THEN
        INSERT INTO pricing_page_settings (badge_text, heading, subheading, subscribe_button_text)
        SELECT 'Jos Smart City Pricing', 'Our Pricing Plans', 'Join Jos Smart City and unlock a world of exclusive discounts, rewards, and seamless access to essential services — connecting residents, businesses, and visitors through one powerful digital membership platform that brings your city''s marketplace, wallet, and community together.', 'Subscribe Now'
        WHERE NOT EXISTS (SELECT 1 FROM pricing_page_settings);
    END IF;
END $$;

-- Insert default guidelines page settings
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'guidelines_page_settings') THEN
        INSERT INTO guidelines_page_settings (badge_text, heading)
        SELECT 'Guidelines', 'PWA Guidelines'
        WHERE NOT EXISTS (SELECT 1 FROM guidelines_page_settings);
    END IF;
END $$;

-- Insert default hero page settings
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hero_page_settings') THEN
        INSERT INTO hero_page_settings (slide_duration_seconds, auto_advance, primary_button_text)
        SELECT 5, true, 'Get Started'
        WHERE NOT EXISTS (SELECT 1 FROM hero_page_settings);
    END IF;
END $$;

-- Insert default navbar settings (only if table exists and is empty)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'navbar_settings') THEN
        INSERT INTO navbar_settings (get_started_button_text, get_started_button_route, is_active)
        SELECT 'Get Started', '/welcome', true
        WHERE NOT EXISTS (SELECT 1 FROM navbar_settings);
    END IF;
END $$;

-- ============================================
-- FOREIGN KEY CONSTRAINTS (Add after users table exists)
-- ============================================
-- 
-- IMPORTANT: Check your users table structure first!
-- Your users table might use 'user_id' instead of 'id' as the primary key.
-- 
-- Run this check first:
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'users' AND table_schema = 'public' AND column_default LIKE '%PRIMARY%';
-- 
-- If your users table uses 'user_id' as primary key, replace 'id' with 'user_id' in the statements below.
-- 
-- Run these ALTER TABLE statements AFTER:
-- 1. Your users table exists
-- 2. All tables in this schema have been created successfully
-- 3. You've verified the primary key column name (id or user_id)
-- 
-- Uncomment the statements below when ready:

-- ALTER TABLE navbar_settings 
--   ADD CONSTRAINT fk_navbar_settings_updated_by 
--   FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;

-- ALTER TABLE contact_page_settings 
--   ADD CONSTRAINT fk_contact_page_settings_updated_by 
--   FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;
-- 
-- ALTER TABLE events_page_settings 
--   ADD CONSTRAINT fk_events_page_settings_updated_by 
--   FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;
-- 
-- ALTER TABLE events 
--   ADD CONSTRAINT fk_events_created_by 
--   FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL;
-- 
-- ALTER TABLE event_registrations 
--   ADD CONSTRAINT fk_event_registrations_user_id 
--   FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;
-- 
-- ALTER TABLE services_page_settings 
--   ADD CONSTRAINT fk_services_page_settings_updated_by 
--   FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;
-- 
-- ALTER TABLE service_requests 
--   ADD CONSTRAINT fk_service_requests_user_id 
--   FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;
-- 
-- ALTER TABLE pricing_page_settings 
--   ADD CONSTRAINT fk_pricing_page_settings_updated_by 
--   FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;
-- 
-- ALTER TABLE user_subscriptions 
--   ADD CONSTRAINT fk_user_subscriptions_user_id 
--   FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
-- 
-- ALTER TABLE guidelines_page_settings 
--   ADD CONSTRAINT fk_guidelines_page_settings_updated_by 
--   FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;
-- 
-- ALTER TABLE hero_page_settings 
--   ADD CONSTRAINT fk_hero_page_settings_updated_by 
--   FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;
-- 
-- ALTER TABLE footer_settings 
--   ADD CONSTRAINT fk_footer_settings_updated_by 
--   FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;
-- 
-- ALTER TABLE audit_logs 
--   ADD CONSTRAINT fk_audit_logs_user_id 
--   FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;

