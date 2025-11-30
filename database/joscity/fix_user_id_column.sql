-- ============================================
-- FIX USER_ID COLUMN
-- ============================================
-- This script checks if the user_id column exists in the users table
-- and adds it if it's missing. It also ensures it's set as the primary key.
-- 
-- Usage:
--   psql -U your_user -d postgres -f database/joscity/fix_user_id_column.sql
-- ============================================

-- Set search path to joscity schema
SET search_path TO joscity;
DO $$
DECLARE
    table_exists BOOLEAN;
    column_exists BOOLEAN;
    has_primary_key BOOLEAN;
    pk_constraint_name TEXT;
BEGIN
    -- Check if joscity schema exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'joscity') THEN
        RAISE NOTICE 'Creating joscity schema...';
        CREATE SCHEMA IF NOT EXISTS joscity;
    END IF;

    -- Check if users table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'joscity' AND table_name = 'users'
    ) INTO table_exists;

    IF NOT table_exists THEN
        RAISE NOTICE 'Users table does not exist. Creating users table...';
        
        -- Create users table with user_id as primary key
        CREATE TABLE joscity.users (
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
        
        RAISE NOTICE 'Users table created with user_id as primary key.';
    ELSE
        RAISE NOTICE 'Users table exists. Checking for user_id column...';
        
        -- Check if user_id column exists
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'joscity' 
            AND table_name = 'users' 
            AND column_name = 'user_id'
        ) INTO column_exists;

        IF NOT column_exists THEN
            RAISE NOTICE 'user_id column does not exist. Adding user_id column...';
            
            -- Check if table has a primary key
            SELECT EXISTS (
                SELECT 1 FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_schema = 'joscity'
                AND tc.table_name = 'users'
                AND tc.constraint_type = 'PRIMARY KEY'
            ) INTO has_primary_key;

            IF has_primary_key THEN
                -- Get the primary key constraint name
                SELECT tc.constraint_name INTO pk_constraint_name
                FROM information_schema.table_constraints tc
                WHERE tc.table_schema = 'joscity'
                AND tc.table_name = 'users'
                AND tc.constraint_type = 'PRIMARY KEY'
                LIMIT 1;

                RAISE NOTICE 'Table already has a primary key constraint: %. Dropping it first...', pk_constraint_name;
                
                -- Drop existing primary key
                EXECUTE format('ALTER TABLE joscity.users DROP CONSTRAINT IF EXISTS %I', pk_constraint_name);
            END IF;

            -- Add user_id column as SERIAL
            ALTER TABLE joscity.users 
            ADD COLUMN user_id SERIAL;

            -- Set user_id as primary key
            ALTER TABLE joscity.users 
            ADD PRIMARY KEY (user_id);

            RAISE NOTICE 'user_id column added and set as primary key.';
        ELSE
            RAISE NOTICE 'user_id column already exists.';
            
            -- Check if it's the primary key
            SELECT EXISTS (
                SELECT 1 FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_schema = 'joscity'
                AND tc.table_name = 'users'
                AND tc.constraint_type = 'PRIMARY KEY'
                AND kcu.column_name = 'user_id'
            ) INTO has_primary_key;

            IF NOT has_primary_key THEN
                RAISE NOTICE 'user_id exists but is not primary key. Setting as primary key...';
                
                -- Check if there's another primary key
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    WHERE tc.table_schema = 'joscity'
                    AND tc.table_name = 'users'
                    AND tc.constraint_type = 'PRIMARY KEY'
                ) INTO has_primary_key;

                IF has_primary_key THEN
                    SELECT tc.constraint_name INTO pk_constraint_name
                    FROM information_schema.table_constraints tc
                    WHERE tc.table_schema = 'joscity'
                    AND tc.table_name = 'users'
                    AND tc.constraint_type = 'PRIMARY KEY'
                    LIMIT 1;

                    EXECUTE format('ALTER TABLE joscity.users DROP CONSTRAINT IF EXISTS %I', pk_constraint_name);
                END IF;

                -- Set user_id as primary key
                ALTER TABLE joscity.users 
                ADD PRIMARY KEY (user_id);

                RAISE NOTICE 'user_id is now the primary key.';
            ELSE
                RAISE NOTICE 'user_id is already the primary key.';
            END IF;
        END IF;
    END IF;

    RAISE NOTICE 'Fix complete!';
END $$;

-- Verify the column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'joscity' 
AND table_name = 'users' 
AND column_name = 'user_id';

-- Verify primary key
SELECT 
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'joscity'
AND tc.table_name = 'users'
AND tc.constraint_type = 'PRIMARY KEY';

