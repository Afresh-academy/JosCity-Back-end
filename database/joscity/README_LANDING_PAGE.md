# Landing Page Database Setup

This directory contains SQL files for setting up the landing page database tables and seeding initial data.

## Quick Start

**Run this single file to set up everything:**

```bash
psql -U your_username -d joscity -f setup_landing_page.sql
```

This will:
- Create the `landing_page` schema
- Create all necessary tables
- Set up triggers and indexes
- Seed initial data from hardcoded frontend elements

## Files Overview

1. **`setup_landing_page.sql`** - **MAIN FILE** - Creates schema, tables, triggers, and seeds initial data (all-in-one)
2. **`seed_landing_page_data.sql`** - Optional seed file if you need to re-seed data separately

## What Gets Created

The setup creates the `landing_page` schema with the following tables:

- `landing_page.navbar_menu_items` - Navigation menu items
- `landing_page.navbar_settings` - Navbar configuration
- `landing_page.hero_page_settings` - Hero section settings
- `landing_page.hero_slides` - Hero carousel slides
- `landing_page.services_page_settings` - Services page configuration
- `landing_page.services` - Available services
- `landing_page.service_requests` - Service requests from users
- `landing_page.pricing_page_settings` - Pricing page configuration
- `landing_page.pricing_plans` - Membership plans
- `landing_page.pricing_plan_features` - Features for each plan
- `landing_page.user_subscriptions` - User subscription records
- `landing_page.guidelines_page_settings` - Guidelines page configuration
- `landing_page.guidelines` - PWA guidelines/testimonials
- `landing_page.contact_page_settings` - Contact page configuration
- `landing_page.contact_messages` - Contact form submissions
- `landing_page.contact_information` - Contact details (phone, email, location)
- `landing_page.events_page_settings` - Events page configuration
- `landing_page.events` - Event listings
- `landing_page.event_registrations` - Event registration records
- `landing_page.footer_settings` - Footer configuration
- `landing_page.footer_links` - Footer navigation links

## Initial Data Seeded

The setup automatically seeds:

- **Navbar**: 5 menu items (Home, About, Guidelines, Services, Contact Us) and settings
- **Hero**: 3 default slides and hero section settings
- **Services**: 5 default services (Electricity, Water, Transportation, E-Governance, Permits & Licenses)
- **Pricing**: 4 membership plans (Platinum, Gold, Silver, Bronze) with their features
- **Guidelines**: Default PWA guidelines
- **Contact**: Contact page settings
- **Events**: Events page settings
- **Footer**: 12 footer links and settings

## Verification

After running the setup, verify the data was inserted correctly:

```sql
SELECT 'Navbar Menu Items' as table_name, COUNT(*) as count FROM landing_page.navbar_menu_items
UNION ALL
SELECT 'Hero Slides', COUNT(*) FROM landing_page.hero_slides
UNION ALL
SELECT 'Services', COUNT(*) FROM landing_page.services
UNION ALL
SELECT 'Pricing Plans', COUNT(*) FROM landing_page.pricing_plans
UNION ALL
SELECT 'Guidelines', COUNT(*) FROM landing_page.guidelines
UNION ALL
SELECT 'Footer Links', COUNT(*) FROM landing_page.footer_links;
```

Expected counts:
- Navbar Menu Items: 5
- Hero Slides: 3
- Services: 5
- Pricing Plans: 4
- Guidelines: 1
- Footer Links: 12

## Admin Panel

Once the database is set up, you can manage all landing page elements through the admin panel:

1. Navigate to `/admin` (requires admin authentication)
2. Use the "Landing Page Management" interface
3. Switch between tabs to manage different sections:
   - Navbar
   - Contact
   - Events
   - Services
   - Pricing
   - Guidelines
   - Hero
   - Footer

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran `setup_landing_page.sql` first
- Check that you're connected to the correct database
- Verify the schema name (should be `landing_page`)

### Error: "duplicate key value violates unique constraint"
- This is normal if you re-run the seed file
- The seed file uses `ON CONFLICT DO NOTHING` or `ON CONFLICT DO UPDATE` to handle this safely
- Re-running is safe and won't create duplicates

### Error: "foreign key constraint violation"
- Ensure the `users` table exists if you're using foreign key references
- Check that foreign key constraints match your users table structure
- The setup file uses UUIDs for user references

## Next Steps

After setting up the database:

1. **Update Frontend Components**: Modify frontend components to fetch data from the API instead of using hardcoded values
2. **Test API Endpoints**: Verify all admin and public API endpoints are working
3. **Configure Admin Access**: Ensure admin users can access the landing page management panel
4. **Customize Content**: Use the admin panel to customize landing page content
