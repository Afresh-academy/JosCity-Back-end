# Database Connection Guide

This guide explains how to connect the registration forms to the database.

## Prerequisites

1. **PostgreSQL Database** - Ensure PostgreSQL is running
2. **Database Created** - Database name should match `DB_NAME` in `.env` (default: `postgres`)
3. **Schema Created** - Run `users_schema.sql` to create the `joscity` schema and `users` table

## Setup Steps

### 1. Create the Database Schema

Run the users schema file to create the `joscity` schema and `users` table:

```bash
psql -U your_user -d postgres -f database/joscity/users_schema.sql
```

Or if using a different database name:

```bash
psql -U your_user -d your_database_name -f database/joscity/users_schema.sql
```

### 2. Verify Database Connection

The backend automatically:
- Sets `search_path TO joscity, public` for all connections
- Checks if the users table exists on startup
- Logs connection status and table existence

### 3. Environment Variables

Ensure your `.env` file has:

```env
# Database Configuration
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=postgres  # or your database name
DB_PORT=5432

# JWT Secret (required)
JWT_SECRET=your_jwt_secret_here

# Email Configuration (for sending registration emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="JosCity <support@joscity.com>"
```

### 4. Start the Backend Server

```bash
cd JosCity-Backend
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL Database
   → Server time: [timestamp]
   → Schema: joscity
   → Users table exists: Yes
🚀 Server running on port 3000
```

### 5. Test the Forms

1. **Personal Registration Form:**
   - Navigate to `/register` (defaults to personal form)
   - Fill in all required fields:
     - First Name, Last Name
     - Gender
     - Phone Number
     - Email
     - NIN Number (required for personal)
     - Address
     - Password (min 8 chars, uppercase, lowercase, number)
   - Submit form
   - Should redirect to `/success` page
   - Email confirmation sent automatically

2. **Business Registration Form:**
   - Navigate to `/register` and switch to business tab
   - Or navigate to `/business-form`
   - Fill in all required fields:
     - Business Name
     - Business Type
     - Business Email
     - CAC Number (required for business)
     - Business Phone
     - Business Address
     - Password (min 8 chars, uppercase, lowercase, number)
   - Submit form
   - Should redirect to `/success` page
   - Email confirmation sent automatically

## API Endpoints

The forms connect to these endpoints:

- **Personal Registration:** `POST /api/auth/personal/register`
- **Business Registration:** `POST /api/auth/business/register`

Both endpoints:
- Validate all required fields
- Check for duplicate emails, NIN numbers, CAC numbers
- Hash passwords using bcrypt
- Create user with `account_status = 'pending'`
- Send confirmation email
- Return success response with user_id

## Database Schema

Tables are created in the `joscity` schema:

- **Schema:** `joscity`
- **Table:** `users`
- **Primary Key:** `user_id` (SERIAL)

## Troubleshooting

### Forms Not Connecting

1. **Check Backend is Running:**
   ```bash
   curl http://localhost:3000/api/ping
   ```
   Should return: `{"message":"pong",...}`

2. **Check API Base URL:**
   - Frontend uses: `import.meta.env.VITE_API_URL || '/api'`
   - Default: `/api` (relative URL)
   - For production, set `VITE_API_URL` in `.env` file

3. **Check Database Connection:**
   - Look for connection errors in backend logs
   - Verify `.env` database credentials
   - Test connection: `psql -U your_user -d your_database`

### Database Errors

1. **Table Not Found:**
   - Run `users_schema.sql` to create the table
   - Verify schema exists: `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'joscity';`

2. **Schema Not Found:**
   - The schema is created automatically by `users_schema.sql`
   - If missing, run: `CREATE SCHEMA IF NOT EXISTS joscity;`

3. **Permission Errors:**
   - Ensure database user has CREATE, INSERT, UPDATE, SELECT permissions
   - Grant schema usage: `GRANT USAGE ON SCHEMA joscity TO your_user;`
   - Grant table permissions: `GRANT ALL ON joscity.users TO your_user;`

### Validation Errors

- **Frontend Validation:** Check browser console for validation errors
- **Backend Validation:** Check server logs for detailed error messages
- **Database Constraints:** Check PostgreSQL logs for constraint violations

## Verification Queries

Test if data is being saved:

```sql
-- Check if users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'joscity' 
  AND table_name = 'users'
);

-- View all registered users
SELECT user_id, user_email, account_type, account_status, user_registered 
FROM joscity.users 
ORDER BY user_registered DESC;

-- Check pending approvals
SELECT user_id, user_email, account_type, business_name 
FROM joscity.users 
WHERE account_status = 'pending';

-- Count by account type
SELECT account_type, COUNT(*) as count 
FROM joscity.users 
GROUP BY account_type;
```

## Next Steps

After registration:
1. Users receive "under review" email
2. Admin approves account via admin panel
3. User receives activation code via email
4. User activates account with activation code
5. User can login

