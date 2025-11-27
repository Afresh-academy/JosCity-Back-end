-- Standalone script to create all page settings tables
-- Run this if you're getting "relation does not exist" errors
-- Set search path to public schema
SET search_path TO public;

-- Contact Page Settings
CREATE TABLE IF NOT EXISTS contact_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Contact Us',
    heading VARCHAR(255) NOT NULL,
    subheading TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Events Page Settings
CREATE TABLE IF NOT EXISTS events_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Upcoming Events in Jos',
    heading VARCHAR(255),
    subheading TEXT,
    default_image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Services Page Settings
CREATE TABLE IF NOT EXISTS services_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Our Services',
    heading VARCHAR(255) NOT NULL,
    subheading TEXT,
    view_all_button_text VARCHAR(100) DEFAULT 'View All',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Pricing Page Settings
CREATE TABLE IF NOT EXISTS pricing_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Jos Smart City Pricing',
    heading VARCHAR(255) NOT NULL,
    subheading TEXT,
    subscribe_button_text VARCHAR(100) DEFAULT 'Subscribe Now',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Guidelines Page Settings
CREATE TABLE IF NOT EXISTS guidelines_page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_text VARCHAR(255) DEFAULT 'Guidelines',
    heading VARCHAR(255) DEFAULT 'PWA Guidelines',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Hero Page Settings
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

-- Navbar Settings
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

SELECT 'All page settings tables created successfully!' AS status;

