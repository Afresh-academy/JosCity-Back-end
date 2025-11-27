CREATE SCHEMA IF NOT EXISTS landing_page;

SET search_path TO landing_page, public;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'landing_page' 
        AND table_name = 'navbar_menu_items'
    ) THEN
        RAISE EXCEPTION 'ERROR: Tables do not exist! Please run setup_landing_page.sql first to create the landing_page schema and tables.';
    END IF;
END $$;

INSERT INTO landing_page.navbar_menu_items (label, link_type, scroll_target_id, display_order, is_active, requires_auth)
VALUES
    ('Home', 'scroll', 'home', 1, true, false),
    ('About', 'scroll', 'about', 2, true, false),
    ('Guidelines', 'scroll', 'guidelines', 3, true, false),
    ('Services', 'scroll', 'services', 4, true, false),
    ('Contact Us', 'scroll', 'contact', 5, true, false)
ON CONFLICT DO NOTHING;

INSERT INTO landing_page.navbar_settings (logo_url, logo_alt, get_started_button_text, get_started_button_route, is_active)
SELECT '/image/primary-logo.png', 'JosCity Logo', 'Get Started', '/welcome', true
WHERE NOT EXISTS (SELECT 1 FROM landing_page.navbar_settings)
ON CONFLICT DO NOTHING;

UPDATE landing_page.navbar_settings
SET
    logo_url = '/image/primary-logo.png',
    logo_alt = 'JosCity Logo',
    get_started_button_text = 'Get Started',
    get_started_button_route = '/welcome',
    is_active = true,
    updated_at = CURRENT_TIMESTAMP
WHERE id = (SELECT id FROM landing_page.navbar_settings LIMIT 1);

INSERT INTO landing_page.hero_page_settings (
    slide_duration_seconds,
    auto_advance,
    show_navigation_dots,
    show_prev_next_arrows,
    default_badge_text,
    primary_button_text,
    primary_button_route,
    secondary_button_text,
    secondary_button_route
)
SELECT
    5,
    true,
    true,
    false,
    'Powered by Cbrilliance AI tech LTD',
    'Get Started',
    '/welcome',
    'Learn More',
    NULL
WHERE NOT EXISTS (SELECT 1 FROM landing_page.hero_page_settings)
ON CONFLICT DO NOTHING;

UPDATE landing_page.hero_page_settings
SET
    slide_duration_seconds = 5,
    auto_advance = true,
    show_navigation_dots = true,
    show_prev_next_arrows = false,
    default_badge_text = 'Powered by Cbrilliance AI tech LTD',
    primary_button_text = 'Get Started',
    primary_button_route = '/welcome',
    secondary_button_text = 'Learn More',
    secondary_button_route = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE id = (SELECT id FROM landing_page.hero_page_settings LIMIT 1);

INSERT INTO landing_page.hero_slides (title, subtitle, description, image_url, image_alt, slide_order, is_active, link_url, link_text, button_text)
VALUES
    (
        'Welcome to ',
        'Jos Smart City, The-Digital Economy',
        'Access all municipal services, pay bills, and engage with your city - all in one place.',
        '/image/hero-image.png',
        'Jos Smart City Hero',
        0,
        true,
        NULL,
        NULL,
        'Get Started'
    ),
    (
        'Anticipate',
        'Jos City Carnival!',
        'Purchase tickets, manage bookings, and connect with your event - all in one convenient location',
        '/image/plateau-legs.png',
        'Jos City Carnival',
        1,
        true,
        NULL,
        NULL,
        'Get Started'
    ),
    (
        'Exciting Event Ahead at',
        'Jos Central Market!',
        'Join us for an ourdoor event where you can explore all municipal services, settle your bills, and connect with your communityall in one exciting location!',
        '/image/terminus.png',
        'Jos Central Market',
        2,
        true,
        NULL,
        NULL,
        'Get Started'
    )
ON CONFLICT DO NOTHING;

INSERT INTO landing_page.services_page_settings (badge_text, heading, subheading, view_all_button_text)
SELECT
    'Our Services',
    'Comprehensive City Services',
    'Everything you need to interact with city services, all digitized and accessible 24/7',
    'View All'
WHERE NOT EXISTS (SELECT 1 FROM landing_page.services_page_settings)
ON CONFLICT DO NOTHING;

UPDATE landing_page.services_page_settings
SET
    badge_text = 'Our Services',
    heading = 'Comprehensive City Services',
    subheading = 'Everything you need to interact with city services, all digitized and accessible 24/7',
    view_all_button_text = 'View All',
    updated_at = CURRENT_TIMESTAMP
WHERE id = (SELECT id FROM landing_page.services_page_settings LIMIT 1);

INSERT INTO landing_page.services (service_key, title, description, icon_color, icon_svg, category, is_active, display_order, service_url, requires_authentication)
VALUES
    (
        'electricity',
        'Electricity Services',
        'Pay bills, report outages, and track consumption online',
        '#FFC107',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>',
        'Utilities',
        true,
        1,
        NULL,
        false
    ),
    (
        'water',
        'Water Services',
        'Manage water bills and service requests efficiently',
        '#2196F3',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5C10.5 2.5 9.5 5 9.5 7C9.5 8.5 10 10 12 12.5C14 10 14.5 8.5 14.5 7C14.5 5 13.5 2.5 12 2.5Z" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12.5V20" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>',
        'Utilities',
        true,
        2,
        NULL,
        false
    ),
    (
        'transportation',
        'Transportation',
        'Access public transport schedules and smart ticketing',
        '#00C950',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="16" height="9" rx="1" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="5.5" y="9.5" width="3.5" height="3" fill="none" stroke="white" strokeWidth="1.5"/><rect x="10" y="9.5" width="3.5" height="3" fill="none" stroke="white" strokeWidth="1.5"/><rect x="14.5" y="9.5" width="3.5" height="3" fill="none" stroke="white" strokeWidth="1.5"/><circle cx="7.5" cy="19" r="1.5" fill="none" stroke="white" strokeWidth="2"/><circle cx="16.5" cy="19" r="1.5" fill="none" stroke="white" strokeWidth="2"/></svg>',
        'Transport',
        true,
        3,
        NULL,
        false
    ),
    (
        'egovernance',
        'E-Governance',
        'Digital government services and documentation',
        '#9C27B0',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 4H17V20H7V4Z" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 4H14V10H20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="9" y1="8" x2="15" y2="8" stroke="white" strokeWidth="1.5"/><line x1="9" y1="11" x2="13" y2="11" stroke="white" strokeWidth="1.5"/><line x1="9" y1="14" x2="15" y2="14" stroke="white" strokeWidth="1.5"/></svg>',
        'Government',
        true,
        4,
        NULL,
        false
    ),
    (
        'permits',
        'Permits & Licenses',
        'Apply for permits, licenses, and certifications online',
        '#FF9800',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 4H18V20H6V4Z" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 5H16V7H8V5Z" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>',
        'Government',
        true,
        5,
        NULL,
        false
    )
ON CONFLICT (service_key) DO UPDATE
SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    icon_color = EXCLUDED.icon_color,
    icon_svg = EXCLUDED.icon_svg,
    category = EXCLUDED.category,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order,
    service_url = EXCLUDED.service_url,
    requires_authentication = EXCLUDED.requires_authentication,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO landing_page.pricing_page_settings (badge_text, heading, subheading, subscribe_button_text)
SELECT
    'Jos Smart City Pricing',
    'Our Pricing Plans',
    'Join Jos Smart City and unlock a world of exclusive discounts, rewards, and seamless access to essential services — connecting residents, businesses, and visitors through one powerful digital membership platform that brings your city''s marketplace, wallet, and community together.',
    'Subscribe Now'
WHERE NOT EXISTS (SELECT 1 FROM landing_page.pricing_page_settings)
ON CONFLICT DO NOTHING;

UPDATE landing_page.pricing_page_settings
SET
    badge_text = 'Jos Smart City Pricing',
    heading = 'Our Pricing Plans',
    subheading = 'Join Jos Smart City and unlock a world of exclusive discounts, rewards, and seamless access to essential services — connecting residents, businesses, and visitors through one powerful digital membership platform that brings your city''s marketplace, wallet, and community together.',
    subscribe_button_text = 'Subscribe Now',
    updated_at = CURRENT_TIMESTAMP
WHERE id = (SELECT id FROM landing_page.pricing_page_settings LIMIT 1);

INSERT INTO landing_page.pricing_plans (plan_key, name, price, currency, billing_period, is_popular, is_active, display_order, description)
VALUES
    (
        'platinum',
        'Platinium Membership Package',
        20000.00,
        'NGN',
        'monthly',
        false,
        true,
        1,
        'Premium membership with all features'
    ),
    (
        'gold',
        'Gold Membership Package',
        10000.00,
        'NGN',
        'monthly',
        false,
        true,
        2,
        'Gold membership with most features'
    ),
    (
        'silver',
        'Silver Membership Package',
        5000.00,
        'NGN',
        'monthly',
        false,
        true,
        3,
        'Silver membership with essential features'
    ),
    (
        'bronze',
        'Bronze Membership Package',
        2000.00,
        'NGN',
        'monthly',
        false,
        true,
        4,
        'Bronze membership with basic features'
    )
ON CONFLICT (plan_key) DO UPDATE
SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    currency = EXCLUDED.currency,
    billing_period = EXCLUDED.billing_period,
    is_popular = EXCLUDED.is_popular,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO landing_page.pricing_plan_features (plan_id, feature_name, is_included, display_order)
SELECT 
    p.id,
    f.feature_name,
    f.is_included,
    f.display_order
FROM landing_page.pricing_plans p
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

INSERT INTO landing_page.guidelines_page_settings (badge_text, heading)
SELECT
    'Guidelines',
    'PWA Guidelines'
WHERE NOT EXISTS (SELECT 1 FROM landing_page.guidelines_page_settings)
ON CONFLICT DO NOTHING;

UPDATE landing_page.guidelines_page_settings
SET
    badge_text = 'Guidelines',
    heading = 'PWA Guidelines',
    updated_at = CURRENT_TIMESTAMP
WHERE id = (SELECT id FROM landing_page.guidelines_page_settings LIMIT 1);

INSERT INTO landing_page.guidelines (quote, author_name, author_role, rating, author_image_url, display_order, is_active)
VALUES
    (
        'Welcome to the Jos Smart City PWA! We''re here to help you navigate and enjoy your city with ease. In this phase of the app, kindly click on the green ''Get Started'' button to redirect you to an account type panel, select your type of account, carefully fill in your details, an email would be sent to you if submitted successfully, with a login button, your email address and an OTP, kindly change your password after logging in. Your Information is protected and will not be shared with anyone.',
        'AfrESH Support',
        'Support Team',
        5,
        NULL,
        0,
        true
    )
ON CONFLICT DO NOTHING;

INSERT INTO landing_page.contact_page_settings (badge_text, heading, subheading)
SELECT
    'Contact Us',
    'Get in Touch',
    'Our support team is available 24/7 to assist you'
WHERE NOT EXISTS (SELECT 1 FROM landing_page.contact_page_settings)
ON CONFLICT DO NOTHING;

UPDATE landing_page.contact_page_settings
SET
    badge_text = 'Contact Us',
    heading = 'Get in Touch',
    subheading = 'Our support team is available 24/7 to assist you',
    updated_at = CURRENT_TIMESTAMP
WHERE id = (SELECT id FROM landing_page.contact_page_settings LIMIT 1);

INSERT INTO landing_page.events_page_settings (badge_text, heading, subheading, default_image_url)
SELECT
    'Upcoming Events in Jos',
    NULL,
    NULL,
    NULL
WHERE NOT EXISTS (SELECT 1 FROM landing_page.events_page_settings)
ON CONFLICT DO NOTHING;

UPDATE landing_page.events_page_settings
SET
    badge_text = 'Upcoming Events in Jos',
    heading = NULL,
    subheading = NULL,
    default_image_url = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE id = (SELECT id FROM landing_page.events_page_settings LIMIT 1);

INSERT INTO landing_page.footer_settings (logo_url, tagline, copyright_text, social_media)
SELECT
    '/image/primary-logo.png',
    'Your gateway to smart city services and digital governance.',
    '© 2025 JosCity Smart Services. All rights reserved. Developed by AfrESH',
    '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM landing_page.footer_settings)
ON CONFLICT DO NOTHING;

UPDATE landing_page.footer_settings
SET
    logo_url = '/image/primary-logo.png',
    tagline = 'Your gateway to smart city services and digital governance.',
    copyright_text = '© 2025 JosCity Smart Services. All rights reserved. Developed by AfrESH',
    social_media = '{}'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE id = (SELECT id FROM landing_page.footer_settings LIMIT 1);

INSERT INTO landing_page.footer_links (link_text, link_url, section, display_order, is_active, opens_in_new_tab)
VALUES
    ('Services', '#services', 'quick_links', 1, true, false),
    ('About Us', '#about', 'quick_links', 2, true, false),
    ('Contact', '#contact', 'quick_links', 3, true, false),
    ('FAQs', '#faqs', 'quick_links', 4, true, false),
    ('Bill Payments', '#bill-payments', 'services', 1, true, false),
    ('Permits', '#permits', 'services', 2, true, false),
    ('Licenses', '#licenses', 'services', 3, true, false),
    ('Complaints', '#complaints', 'services', 4, true, false),
    ('Privacy Policy', '#privacy-policy', 'legal', 1, true, false),
    ('Terms of Service', '#terms-of-service', 'legal', 2, true, false),
    ('Cookie Policy', '#cookie-policy', 'legal', 3, true, false),
    ('Accessibility', '#accessibility', 'legal', 4, true, false)
ON CONFLICT DO NOTHING;
