-- ============================================
-- LANDING PAGE COMPLETE SETUP
-- ============================================
-- This file creates the landing_page schema, all tables, and seeds initial data
-- Run this file once to set up the entire landing page database structure
-- ============================================

-- Create landing_page schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS landing_page;

-- Set search path to landing_page schema
SET search_path TO landing_page, public;

-- ============================================
-- NAVBAR PAGE TABLES
-- ============================================

-- Navigation Menu Items Table
CREATE TABLE IF NOT EXISTS landing_page.navbar_menu_items (
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

CREATE INDEX IF NOT EXISTS idx_navbar_menu_items_active ON landing_page.navbar_menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_navbar_menu_items_order ON landing_page.navbar_menu_items(display_order);

-- Navbar Settings Table
CREATE TABLE IF NOT EXISTS landing_page.navbar_settings (
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
CREATE TABLE IF NOT EXISTS landing_page.contact_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Contact Us',
    heading VARCHAR(255) NOT NULL,
    subheading TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS landing_page.contact_messages (
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

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON landing_page.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON landing_page.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON landing_page.contact_messages(email);

-- Contact Information Table
CREATE TABLE IF NOT EXISTS landing_page.contact_information (
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

CREATE INDEX IF NOT EXISTS idx_contact_information_type ON landing_page.contact_information(contact_type);
CREATE INDEX IF NOT EXISTS idx_contact_information_active ON landing_page.contact_information(is_active);

-- ============================================
-- EVENTS PAGE TABLES
-- ============================================

-- Events Page Settings Table
CREATE TABLE IF NOT EXISTS landing_page.events_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Upcoming Events in Jos',
    heading VARCHAR(255),
    subheading TEXT,
    default_image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Events Table
CREATE TABLE IF NOT EXISTS landing_page.events (
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

CREATE INDEX IF NOT EXISTS idx_events_event_date ON landing_page.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON landing_page.events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON landing_page.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON landing_page.events(created_at DESC);

-- Event Registrations Table
CREATE TABLE IF NOT EXISTS landing_page.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES landing_page.events(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON landing_page.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON landing_page.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON landing_page.event_registrations(status);

-- ============================================
-- SERVICES PAGE TABLES
-- ============================================

-- Services Page Settings Table
CREATE TABLE IF NOT EXISTS landing_page.services_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Our Services',
    heading VARCHAR(255) NOT NULL,
    subheading TEXT,
    view_all_button_text VARCHAR(100) DEFAULT 'View All',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Services Table
CREATE TABLE IF NOT EXISTS landing_page.services (
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

CREATE INDEX IF NOT EXISTS idx_services_category ON landing_page.services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON landing_page.services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON landing_page.services(display_order);

-- Service Requests Table
CREATE TABLE IF NOT EXISTS landing_page.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES landing_page.services(id) ON DELETE RESTRICT,
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

CREATE INDEX IF NOT EXISTS idx_service_requests_service_id ON landing_page.service_requests(service_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON landing_page.service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON landing_page.service_requests(status);

-- ============================================
-- PRICING PAGE TABLES
-- ============================================

-- Pricing Page Settings Table
CREATE TABLE IF NOT EXISTS landing_page.pricing_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Jos Smart City Pricing',
    heading VARCHAR(255) NOT NULL,
    subheading TEXT,
    subscribe_button_text VARCHAR(100) DEFAULT 'Subscribe Now',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Pricing Plans Table
CREATE TABLE IF NOT EXISTS landing_page.pricing_plans (
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

CREATE INDEX IF NOT EXISTS idx_pricing_plans_plan_key ON landing_page.pricing_plans(plan_key);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_active ON landing_page.pricing_plans(is_active);

-- Pricing Plan Features Table
CREATE TABLE IF NOT EXISTS landing_page.pricing_plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES landing_page.pricing_plans(id) ON DELETE CASCADE,
    feature_name VARCHAR(255) NOT NULL,
    is_included BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pricing_plan_features_plan_id ON landing_page.pricing_plan_features(plan_id);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS landing_page.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_id UUID NOT NULL REFERENCES landing_page.pricing_plans(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT true,
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON landing_page.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON landing_page.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON landing_page.user_subscriptions(status);

-- ============================================
-- GUIDELINES PAGE TABLES
-- ============================================

-- Guidelines Page Settings Table
CREATE TABLE IF NOT EXISTS landing_page.guidelines_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Guidelines',
    heading VARCHAR(255) DEFAULT 'PWA Guidelines',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Guidelines Table
CREATE TABLE IF NOT EXISTS landing_page.guidelines (
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

CREATE INDEX IF NOT EXISTS idx_guidelines_active ON landing_page.guidelines(is_active);
CREATE INDEX IF NOT EXISTS idx_guidelines_display_order ON landing_page.guidelines(display_order);

-- ============================================
-- HERO PAGE TABLES
-- ============================================

-- Hero Page Settings Table
CREATE TABLE IF NOT EXISTS landing_page.hero_page_settings (
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
CREATE TABLE IF NOT EXISTS landing_page.hero_slides (
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

CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON landing_page.hero_slides(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON landing_page.hero_slides(slide_order);

-- ============================================
-- FOOTER PAGE TABLES
-- ============================================

-- Footer Links Table
CREATE TABLE IF NOT EXISTS landing_page.footer_links (
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

CREATE INDEX IF NOT EXISTS idx_footer_links_section ON landing_page.footer_links(section);
CREATE INDEX IF NOT EXISTS idx_footer_links_active ON landing_page.footer_links(is_active);

-- Footer Settings Table
CREATE TABLE IF NOT EXISTS landing_page.footer_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_url TEXT,
    tagline TEXT,
    copyright_text TEXT,
    social_media JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION landing_page.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON landing_page.contact_messages;
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON landing_page.contact_messages
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_information_updated_at ON landing_page.contact_information;
CREATE TRIGGER update_contact_information_updated_at BEFORE UPDATE ON landing_page.contact_information
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON landing_page.events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON landing_page.events
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON landing_page.services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON landing_page.services
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_requests_updated_at ON landing_page.service_requests;
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON landing_page.service_requests
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_plans_updated_at ON landing_page.pricing_plans;
CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON landing_page.pricing_plans
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON landing_page.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON landing_page.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_guidelines_updated_at ON landing_page.guidelines;
CREATE TRIGGER update_guidelines_updated_at BEFORE UPDATE ON landing_page.guidelines
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_hero_slides_updated_at ON landing_page.hero_slides;
CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON landing_page.hero_slides
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_footer_links_updated_at ON landing_page.footer_links;
CREATE TRIGGER update_footer_links_updated_at BEFORE UPDATE ON landing_page.footer_links
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_footer_settings_updated_at ON landing_page.footer_settings;
CREATE TRIGGER update_footer_settings_updated_at BEFORE UPDATE ON landing_page.footer_settings
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_navbar_menu_items_updated_at ON landing_page.navbar_menu_items;
CREATE TRIGGER update_navbar_menu_items_updated_at BEFORE UPDATE ON landing_page.navbar_menu_items
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_navbar_settings_updated_at ON landing_page.navbar_settings;
CREATE TRIGGER update_navbar_settings_updated_at BEFORE UPDATE ON landing_page.navbar_settings
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_page_settings_updated_at ON landing_page.contact_page_settings;
CREATE TRIGGER update_contact_page_settings_updated_at BEFORE UPDATE ON landing_page.contact_page_settings
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_page_settings_updated_at ON landing_page.events_page_settings;
CREATE TRIGGER update_events_page_settings_updated_at BEFORE UPDATE ON landing_page.events_page_settings
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_page_settings_updated_at ON landing_page.services_page_settings;
CREATE TRIGGER update_services_page_settings_updated_at BEFORE UPDATE ON landing_page.services_page_settings
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_page_settings_updated_at ON landing_page.pricing_page_settings;
CREATE TRIGGER update_pricing_page_settings_updated_at BEFORE UPDATE ON landing_page.pricing_page_settings
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_guidelines_page_settings_updated_at ON landing_page.guidelines_page_settings;
CREATE TRIGGER update_guidelines_page_settings_updated_at BEFORE UPDATE ON landing_page.guidelines_page_settings
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

DROP TRIGGER IF EXISTS update_hero_page_settings_updated_at ON landing_page.hero_page_settings;
CREATE TRIGGER update_hero_page_settings_updated_at BEFORE UPDATE ON landing_page.hero_page_settings
    FOR EACH ROW EXECUTE FUNCTION landing_page.update_updated_at_column();

-- ============================================
-- SEED INITIAL DATA
-- ============================================

-- Navbar Menu Items
INSERT INTO landing_page.navbar_menu_items (label, link_type, scroll_target_id, display_order, is_active, requires_auth)
VALUES
    ('Home', 'scroll', 'home', 1, true, false),
    ('About', 'scroll', 'about', 2, true, false),
    ('Guidelines', 'scroll', 'guidelines', 3, true, false),
    ('Services', 'scroll', 'services', 4, true, false),
    ('Contact Us', 'scroll', 'contact', 5, true, false)
ON CONFLICT DO NOTHING;

-- Navbar Settings
INSERT INTO landing_page.navbar_settings (logo_url, logo_alt, get_started_button_text, get_started_button_route, is_active)
SELECT '/image/primary-logo.png', 'JosCity Logo', 'Get Started', '/welcome', true
WHERE NOT EXISTS (SELECT 1 FROM landing_page.navbar_settings);

-- Hero Page Settings
INSERT INTO landing_page.hero_page_settings (
    slide_duration_seconds, auto_advance, show_navigation_dots, show_prev_next_arrows,
    default_badge_text, primary_button_text, primary_button_route, secondary_button_text, secondary_button_route
)
SELECT 5, true, true, false, 'Powered by Cbrilliance AI tech LTD', 'Get Started', '/welcome', 'Learn More', NULL
WHERE NOT EXISTS (SELECT 1 FROM landing_page.hero_page_settings);

-- Hero Slides
INSERT INTO landing_page.hero_slides (title, subtitle, description, image_url, image_alt, slide_order, is_active, button_text)
VALUES
    ('Welcome to ', 'Jos Smart City, The-Digital Economy', 'Access all municipal services, pay bills, and engage with your city - all in one place.', '/image/hero-image.png', 'Jos Smart City Hero', 0, true, 'Get Started'),
    ('Anticipate', 'Jos City Carnival!', 'Purchase tickets, manage bookings, and connect with your event - all in one convenient location', '/image/plateau-legs.png', 'Jos City Carnival', 1, true, 'Get Started'),
    ('Exciting Event Ahead at', 'Jos Central Market!', 'Join us for an ourdoor event where you can explore all municipal services, settle your bills, and connect with your communityall in one exciting location!', '/image/terminus.png', 'Jos Central Market', 2, true, 'Get Started')
ON CONFLICT DO NOTHING;

-- Services Page Settings
INSERT INTO landing_page.services_page_settings (badge_text, heading, subheading, view_all_button_text)
SELECT 'Our Services', 'Comprehensive City Services', 'Everything you need to interact with city services, all digitized and accessible 24/7', 'View All'
WHERE NOT EXISTS (SELECT 1 FROM landing_page.services_page_settings);

-- Services
INSERT INTO landing_page.services (service_key, title, description, icon_color, icon_svg, category, is_active, display_order)
VALUES
    ('electricity', 'Electricity Services', 'Pay bills, report outages, and track consumption online', '#FFC107', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>', 'Utilities', true, 1),
    ('water', 'Water Services', 'Manage water bills and service requests efficiently', '#2196F3', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5C10.5 2.5 9.5 5 9.5 7C9.5 8.5 10 10 12 12.5C14 10 14.5 8.5 14.5 7C14.5 5 13.5 2.5 12 2.5Z" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12.5V20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>', 'Utilities', true, 2),
    ('transportation', 'Transportation', 'Access public transport schedules and smart ticketing', '#00C950', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="16" height="9" rx="1" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="5.5" y="9.5" width="3.5" height="3" fill="none" stroke="white" strokeWidth="1.5"/><rect x="10" y="9.5" width="3.5" height="3" fill="none" stroke="white" strokeWidth="1.5"/><rect x="14.5" y="9.5" width="3.5" height="3" fill="none" stroke="white" strokeWidth="1.5"/><circle cx="7.5" cy="19" r="1.5" fill="none" stroke="white" strokeWidth="2"/><circle cx="16.5" cy="19" r="1.5" fill="none" stroke="white" strokeWidth="2"/></svg>', 'Transport', true, 3),
    ('egovernance', 'E-Governance', 'Digital government services and documentation', '#9C27B0', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 4H17V20H7V4Z" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 4H14V10H20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="9" y1="8" x2="15" y2="8" stroke="white" strokeWidth="1.5"/><line x1="9" y1="11" x2="13" y2="11" stroke="white" strokeWidth="1.5"/><line x1="9" y1="14" x2="15" y2="14" stroke="white" strokeWidth="1.5"/></svg>', 'Government', true, 4),
    ('permits', 'Permits & Licenses', 'Apply for permits, licenses, and certifications online', '#FF9800', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 4H18V20H6V4Z" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 5H16V7H8V5Z" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>', 'Government', true, 5)
ON CONFLICT (service_key) DO UPDATE
SET title = EXCLUDED.title, description = EXCLUDED.description, icon_color = EXCLUDED.icon_color, icon_svg = EXCLUDED.icon_svg, category = EXCLUDED.category, is_active = EXCLUDED.is_active, display_order = EXCLUDED.display_order, updated_at = CURRENT_TIMESTAMP;

-- Pricing Page Settings
INSERT INTO landing_page.pricing_page_settings (badge_text, heading, subheading, subscribe_button_text)
SELECT 'Jos Smart City Pricing', 'Our Pricing Plans', 'Join Jos Smart City and unlock a world of exclusive discounts, rewards, and seamless access to essential services — connecting residents, businesses, and visitors through one powerful digital membership platform that brings your city''s marketplace, wallet, and community together.', 'Subscribe Now'
WHERE NOT EXISTS (SELECT 1 FROM landing_page.pricing_page_settings);

-- Pricing Plans
INSERT INTO landing_page.pricing_plans (plan_key, name, price, currency, billing_period, is_popular, is_active, display_order, description)
VALUES
    ('platinum', 'Platinium Membership Package', 20000.00, 'NGN', 'monthly', false, true, 1, 'Premium membership with all features'),
    ('gold', 'Gold Membership Package', 10000.00, 'NGN', 'monthly', false, true, 2, 'Gold membership with most features'),
    ('silver', 'Silver Membership Package', 5000.00, 'NGN', 'monthly', false, true, 3, 'Silver membership with essential features'),
    ('bronze', 'Bronze Membership Package', 2000.00, 'NGN', 'monthly', false, true, 4, 'Bronze membership with basic features')
ON CONFLICT (plan_key) DO UPDATE
SET name = EXCLUDED.name, price = EXCLUDED.price, currency = EXCLUDED.currency, billing_period = EXCLUDED.billing_period, is_popular = EXCLUDED.is_popular, is_active = EXCLUDED.is_active, display_order = EXCLUDED.display_order, description = EXCLUDED.description, updated_at = CURRENT_TIMESTAMP;

-- Pricing Plan Features
INSERT INTO landing_page.pricing_plan_features (plan_id, feature_name, is_included, display_order)
SELECT p.id, f.feature_name, f.is_included, f.display_order
FROM landing_page.pricing_plans p
CROSS JOIN (VALUES
    ('platinum', '10% Discount', true, 1), ('platinum', 'Premium Partners', true, 2), ('platinum', 'Free Monthly Service', true, 3), ('platinum', 'Unlimited brands/users', true, 4), ('platinum', 'VIP perks', true, 5),
    ('gold', '10% Discount', true, 1), ('gold', 'Premium Partners', true, 2), ('gold', 'Free Monthly Service', true, 3), ('gold', 'Unlimited brands/users', false, 4), ('gold', 'VIP perks', false, 5),
    ('silver', '10% Discount', true, 1), ('silver', 'Premium Partners', true, 2), ('silver', 'Free Monthly Service', false, 3), ('silver', 'Unlimited brands/users', false, 4), ('silver', 'VIP perks', false, 5),
    ('bronze', '10% Discount', true, 1), ('bronze', 'Premium Partners', false, 2), ('bronze', 'Free Monthly Service', false, 3), ('bronze', 'Unlimited brands/users', false, 4), ('bronze', 'VIP perks', false, 5)
) AS f(plan_key, feature_name, is_included, display_order)
WHERE p.plan_key = f.plan_key
ON CONFLICT DO NOTHING;

-- Guidelines Page Settings
INSERT INTO landing_page.guidelines_page_settings (badge_text, heading)
SELECT 'Guidelines', 'PWA Guidelines'
WHERE NOT EXISTS (SELECT 1 FROM landing_page.guidelines_page_settings);

-- Guidelines
INSERT INTO landing_page.guidelines (quote, author_name, author_role, rating, display_order, is_active)
VALUES
    ('Welcome to the Jos Smart City PWA! We''re here to help you navigate and enjoy your city with ease. In this phase of the app, kindly click on the green ''Get Started'' button to redirect you to an account type panel, select your type of account, carefully fill in your details, an email would be sent to you if submitted successfully, with a login button, your email address and an OTP, kindly change your password after logging in. Your Information is protected and will not be shared with anyone.', 'AfrESH Support', 'Support Team', 5, 0, true)
ON CONFLICT DO NOTHING;

-- Contact Page Settings
INSERT INTO landing_page.contact_page_settings (badge_text, heading, subheading)
SELECT 'Contact Us', 'Get in Touch', 'Our support team is available 24/7 to assist you'
WHERE NOT EXISTS (SELECT 1 FROM landing_page.contact_page_settings);

-- Events Page Settings
INSERT INTO landing_page.events_page_settings (badge_text)
SELECT 'Upcoming Events in Jos'
WHERE NOT EXISTS (SELECT 1 FROM landing_page.events_page_settings);

-- Footer Settings
INSERT INTO landing_page.footer_settings (logo_url, tagline, copyright_text, social_media)
SELECT '/image/primary-logo.png', 'Your gateway to smart city services and digital governance.', '© 2025 JosCity Smart Services. All rights reserved. Developed by AfrESH', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM landing_page.footer_settings);

-- Footer Links
INSERT INTO landing_page.footer_links (link_text, link_url, section, display_order, is_active)
VALUES
    ('Services', '#services', 'quick_links', 1, true), ('About Us', '#about', 'quick_links', 2, true), ('Contact', '#contact', 'quick_links', 3, true), ('FAQs', '#faqs', 'quick_links', 4, true),
    ('Bill Payments', '#bill-payments', 'services', 1, true), ('Permits', '#permits', 'services', 2, true), ('Licenses', '#licenses', 'services', 3, true), ('Complaints', '#complaints', 'services', 4, true),
    ('Privacy Policy', '#privacy-policy', 'legal', 1, true), ('Terms of Service', '#terms-of-service', 'legal', 2, true), ('Cookie Policy', '#cookie-policy', 'legal', 3, true), ('Accessibility', '#accessibility', 'legal', 4, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- SETUP COMPLETE
-- ============================================

