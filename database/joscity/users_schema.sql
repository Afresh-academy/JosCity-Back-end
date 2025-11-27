-- ============================================
-- USERS TABLE SCHEMA
-- ============================================
-- This schema creates the users table to store both personal and business account registrations
-- Database: joscity (PostgreSQL)
-- 
-- Usage:
--   psql -U your_user -d joscity -f database/joscity/users_schema.sql
-- ============================================

-- Create joscity schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS joscity;

-- Set search path to joscity schema
SET search_path TO joscity;

-- ============================================
-- USERS TABLE
-- ============================================
-- Stores both personal and business account registrations
-- Supports account types: 'personal' and 'business'

CREATE TABLE IF NOT EXISTS joscity.users (
    user_id SERIAL PRIMARY KEY,
    account_type VARCHAR(20) NOT NULL DEFAULT 'personal' 
        CHECK (account_type IN ('personal', 'business')),
    
    account_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended')),

    user_name VARCHAR(100) UNIQUE NOT NULL,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_firstname VARCHAR(100) NOT NULL,
    user_lastname VARCHAR(100) NOT NULL,
    user_gender VARCHAR(20) CHECK (user_gender IN ('male', 'female', 'other')),
    user_phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    
    nin_number VARCHAR(50) UNIQUE, 
    business_name VARCHAR(255),
    business_type VARCHAR(100),
    CAC_number VARCHAR(100) UNIQUE,
    business_location TEXT,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    activation_code VARCHAR(10) UNIQUE, 
    activation_code_expires_at TIMESTAMP WITH TIME ZONE,
    
    user_approved BOOLEAN DEFAULT false, 
    user_activated BOOLEAN DEFAULT false, 
    user_banned BOOLEAN DEFAULT false, 
    user_verified BOOLEAN DEFAULT false, 
    user_group INTEGER DEFAULT 0, 
    user_registered TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_last_seen TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    profile_image_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON joscity.users(user_email);
CREATE INDEX IF NOT EXISTS idx_users_user_name ON joscity.users(user_name);
CREATE INDEX IF NOT EXISTS idx_users_account_type ON joscity.users(account_type);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON joscity.users(account_status);

-- Personal account indexes
CREATE INDEX IF NOT EXISTS idx_users_nin_number ON joscity.users(nin_number) WHERE nin_number IS NOT NULL;

-- Business account indexes
CREATE INDEX IF NOT EXISTS idx_users_business_name ON joscity.users(business_name) WHERE business_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_cac_number ON joscity.users(CAC_number) WHERE CAC_number IS NOT NULL;

-- Account management indexes
CREATE INDEX IF NOT EXISTS idx_users_approved ON joscity.users(user_approved);
CREATE INDEX IF NOT EXISTS idx_users_activated ON joscity.users(user_activated);
CREATE INDEX IF NOT EXISTS idx_users_banned ON joscity.users(user_banned);
CREATE INDEX IF NOT EXISTS idx_users_group ON joscity.users(user_group);

-- Activity indexes
CREATE INDEX IF NOT EXISTS idx_users_registered ON joscity.users(user_registered DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON joscity.users(user_last_seen DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_status_type ON joscity.users(account_status, account_type);
CREATE INDEX IF NOT EXISTS idx_users_pending_approval ON joscity.users(account_status, user_approved) 
    WHERE account_status = 'pending' AND user_approved = false;

-- ============================================
-- CONSTRAINTS
-- ============================================

-- Ensure NIN number is provided for personal accounts
ALTER TABLE joscity.users 
    ADD CONSTRAINT chk_personal_nin_required 
    CHECK (
        (account_type = 'personal' AND nin_number IS NOT NULL) OR 
        (account_type = 'business')
    );

-- Ensure business name, type, and CAC number are provided for business accounts
ALTER TABLE joscity.users 
    ADD CONSTRAINT chk_business_fields_required 
    CHECK (
        (account_type = 'business' AND business_name IS NOT NULL AND business_type IS NOT NULL AND CAC_number IS NOT NULL) OR 
        (account_type = 'personal')
    );

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON joscity.users;
CREATE TRIGGER update_users_updated_at_trigger
    BEFORE UPDATE ON joscity.users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- Function to set user_last_seen on login
CREATE OR REPLACE FUNCTION update_user_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_last_seen = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE joscity.users IS 'Stores user accounts for both personal and business registrations';
COMMENT ON COLUMN joscity.users.account_type IS 'Type of account: personal or business';
COMMENT ON COLUMN joscity.users.account_status IS 'Current status: pending, approved, rejected, or suspended';
COMMENT ON COLUMN joscity.users.user_group IS 'User role: 0=regular, 1=admin, 2=moderator';
COMMENT ON COLUMN joscity.users.nin_number IS 'National Identification Number (required for personal accounts)';
COMMENT ON COLUMN joscity.users.CAC_number IS 'Corporate Affairs Commission number (required for business accounts)';
COMMENT ON COLUMN joscity.users.activation_code IS '6-digit code sent via email for account activation';
COMMENT ON COLUMN joscity.users.user_approved IS 'Admin approval status (true when admin approves account)';
COMMENT ON COLUMN joscity.users.user_activated IS 'User activation status (true when user enters activation code)';

-- ============================================
-- INITIAL DATA (Optional - for testing)
-- ============================================

-- Insert a default admin user (password should be changed immediately)
-- Password: 'admin123' (hashed with bcrypt, salt rounds: 12)
-- You should change this password after first login!
INSERT INTO joscity.users (
    user_name, user_email, user_password, user_firstname, user_lastname,
    user_gender, user_phone, address, account_type, account_status,
    nin_number, user_approved, user_activated, user_group, is_verified, user_verified
) VALUES (
    'admin',
    'admin@joscity.com',
    '$2b$12$LEcWiMRw9snJt3ttEHhLzejtZycWxF4VXa3l1bX0ratYcbaf3SkIi', -- Password: admin123
    'Admin',
    'User',
    'male',
    '+2348000000000',
    'Jos, Plateau State, Nigeria',
    'personal',
    'approved',
    '00000000000', -- Default NIN number (change this to a valid NIN)
    true,
    true,
    1, -- Admin group (1 = admin, 0 = regular user, 2 = moderator)
    true,
    true
) ON CONFLICT (user_email) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'users' AND table_schema = 'joscity'
-- ORDER BY ordinal_position;

-- Check constraints
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = 'users' AND table_schema = 'joscity';

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'users' AND schemaname = 'joscity';

-- ============================================
-- NOTES
-- ============================================
-- 
-- 1. The user_id is SERIAL (auto-incrementing integer) for compatibility
--    If you prefer UUID, change SERIAL to UUID and use gen_random_uuid()
--
-- 2. Password should be hashed using bcrypt before insertion
--    The backend handles password hashing automatically
--
-- 3. Activation codes are generated by the backend and sent via email
--    They expire after 48 hours (handled by backend)
--
-- 4. Account workflow:
--    a. User registers -> account_status = 'pending', user_approved = false
--    b. Admin approves -> account_status = 'approved', user_approved = true, activation_code generated
--    c. User activates -> user_activated = true (after entering activation code)
--
-- 5. For business accounts:
--    - business_name and business_type are required
--    - CAC_number is required and must be unique
--
-- 6. For personal accounts:
--    - nin_number is required and must be unique
--
-- ============================================

