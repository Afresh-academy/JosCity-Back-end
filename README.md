# JosCity Backend

A TypeScript-based Express.js backend API for the JosCity social network platform. This project provides authentication, user management, admin functionality, and business account features.

## 🚀 Features

- **User Authentication**: Registration, login, password reset with activation codes
- **Account Types**: Support for both personal and business accounts
- **Admin Panel**: Dashboard, user management, post moderation, and settings
- **Landing Page Management**: Complete CMS for managing landing page content (Navbar, Hero, Services, Events, Pricing, Guidelines, Contact, Footer)
- **Email Service**: Automated email notifications for account approvals and password resets
- **Database Support**: PostgreSQL database with comprehensive schema
- **TypeScript**: Fully typed codebase for better development experience
- **JWT Authentication**: Secure token-based authentication with role-based access control

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (v12 or higher)
- SMTP email service (Gmail, SendGrid, etc.)

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd JosCity-Backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=joscity
DB_PORT=5432

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="JosCity <noreply@joscity.com>"
```

4. Build the TypeScript project:

```bash
npm run build
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

This will start the server with hot-reload using `ts-node-dev`.

### Production Mode

```bash
npm run build
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## 📁 Project Structure

```
JosCity-Backend/
├── apis/
│   └── modules/
│       ├── config/
│       │   ├── database.ts          # PostgreSQL database configuration
│       │   └── emailConfig.ts       # Email service configuration
│       ├── controllers/
│       │   ├── authController.ts    # Authentication controller
│       │   └── admin/
│       │       ├── dashboardController.ts
│       │       ├── landingPageController.ts  # Landing page CMS controller
│       │       ├── postController.ts
│       │       ├── settingsController.ts
│       │       └── userController.ts
│       ├── middleware/
│       │   └── authMiddleware.ts    # JWT verification & admin auth middleware
│       └── routes/
│           ├── authRoute.ts         # Authentication routes
│           ├── landingPage.ts       # Public landing page routes
│           └── admin/
│               ├── index.ts         # Admin routes index
│               ├── auth.ts          # Admin auth routes
│               ├── dashboard.ts     # Dashboard routes
│               ├── landingPage.ts   # Landing page management routes
│               ├── users.ts         # User management routes
│               ├── posts.ts         # Post management routes
│               └── settings.ts      # Settings routes
├── database/
│   └── joscity/
│       ├── schema.sql               # Database schema
│       ├── create_all_page_settings.sql
│       └── add_foreign_keys.sql
├── dist/                             # Compiled JavaScript (generated)
├── server.ts                         # Main server file
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Project dependencies
└── README.md                         # This file
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /signup` - User registration (personal or business)
- `POST /signin` - User login with activation code
- `POST /signout` - User logout
- `POST /forget_password` - Request password reset
- `POST /forget_password_confirm` - Confirm reset code
- `POST /forget_password_reset` - Reset password with new password
- `POST /resend_activation` - Resend activation code
- `GET /admin/pending` - Get pending account approvals (Admin)
- `POST /admin/approve` - Approve user account (Admin)
- `POST /admin/reject` - Reject user account (Admin)

### Admin Routes (`/api/admin`)

#### Dashboard

- `GET /dashboard` - Get dashboard insights and statistics

#### Users

- `GET /users` - Get all users with filters
- `GET /users/:id` - Get user details
- `POST /users/:id/approve` - Approve user
- `POST /users/:id/ban` - Ban user
- `POST /users/:id/unban` - Unban user
- `POST /users/:id/verify` - Verify user
- `PUT /users/:id/group` - Update user group
- `DELETE /users/:id` - Delete user

#### Posts

- `GET /posts` - Get all posts with filters
- `GET /posts/:id` - Get post details
- `POST /posts/:id/approve` - Approve post
- `DELETE /posts/:id` - Delete post

#### Settings

- `GET /settings` - Get system settings
- `PUT /settings` - Update system settings
- `GET /settings/registration` - Get registration settings
- `PUT /settings/registration` - Update registration settings

#### Landing Page Management (`/api/admin/landing-page`)

**Navbar**

- `GET /navbar/menu-items` - Get all navbar menu items
- `POST /navbar/menu-items` - Create navbar menu item
- `PUT /navbar/menu-items/:id` - Update navbar menu item
- `DELETE /navbar/menu-items/:id` - Delete navbar menu item
- `GET /navbar/settings` - Get navbar settings
- `PUT /navbar/settings` - Update navbar settings

**Contact**

- `GET /contact/settings` - Get contact page settings
- `PUT /contact/settings` - Update contact page settings
- `GET /contact/messages` - Get all contact messages
- `GET /contact/messages/:id` - Get specific contact message
- `PUT /contact/messages/:id` - Update contact message (status, reply)
- `DELETE /contact/messages/:id` - Delete contact message
- `GET /contact/information` - Get contact information items
- `POST /contact/information` - Create contact information item
- `PUT /contact/information/:id` - Update contact information item
- `DELETE /contact/information/:id` - Delete contact information item

**Events**

- `GET /events/settings` - Get events page settings
- `PUT /events/settings` - Update events page settings
- `GET /events` - Get all events
- `GET /events/:id` - Get specific event
- `POST /events` - Create event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `GET /events/:eventId/registrations` - Get event registrations
- `PUT /event-registrations/:id` - Update event registration

**Services**

- `GET /services/settings` - Get services page settings
- `PUT /services/settings` - Update services page settings
- `GET /services` - Get all services
- `GET /services/:id` - Get specific service
- `POST /services` - Create service
- `PUT /services/:id` - Update service
- `DELETE /services/:id` - Delete service
- `GET /service-requests` - Get service requests
- `PUT /service-requests/:id` - Update service request

**Pricing**

- `GET /pricing/settings` - Get pricing page settings
- `PUT /pricing/settings` - Update pricing page settings
- `GET /pricing/plans` - Get all pricing plans
- `GET /pricing/plans/:id` - Get specific pricing plan
- `POST /pricing/plans` - Create pricing plan
- `PUT /pricing/plans/:id` - Update pricing plan
- `DELETE /pricing/plans/:id` - Delete pricing plan
- `GET /pricing/plans/:planId/features` - Get plan features
- `POST /pricing/plan-features` - Create plan feature
- `PUT /pricing/plan-features/:id` - Update plan feature
- `DELETE /pricing/plan-features/:id` - Delete plan feature
- `GET /pricing/subscriptions` - Get user subscriptions
- `PUT /pricing/subscriptions/:id` - Update subscription

**Guidelines**

- `GET /guidelines/settings` - Get guidelines page settings
- `PUT /guidelines/settings` - Update guidelines page settings
- `GET /guidelines` - Get all guidelines
- `GET /guidelines/:id` - Get specific guideline
- `POST /guidelines` - Create guideline
- `PUT /guidelines/:id` - Update guideline
- `DELETE /guidelines/:id` - Delete guideline

**Hero**

- `GET /hero/settings` - Get hero section settings
- `PUT /hero/settings` - Update hero section settings
- `GET /hero/slides` - Get all hero slides
- `GET /hero/slides/:id` - Get specific hero slide
- `POST /hero/slides` - Create hero slide
- `PUT /hero/slides/:id` - Update hero slide
- `DELETE /hero/slides/:id` - Delete hero slide

**Footer**

- `GET /footer/settings` - Get footer settings
- `PUT /footer/settings` - Update footer settings
- `GET /footer/links` - Get all footer links
- `POST /footer/links` - Create footer link
- `PUT /footer/links/:id` - Update footer link
- `DELETE /footer/links/:id` - Delete footer link

### Public Landing Page Routes (`/api/landing-page`)

These routes are publicly accessible (no authentication required):

- `GET /navbar/menu-items` - Get active navbar menu items
- `GET /navbar/settings` - Get navbar settings
- `GET /footer/links` - Get active footer links
- `GET /stats/registered-citizens` - Get registered citizens count

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. All admin routes require authentication.

### Authentication Flow

1. **Login**: User logs in via `POST /api/auth/signin` and receives a JWT token
2. **Token Verification**: The `verifyToken` middleware extracts and verifies the JWT token from the Authorization header
3. **Admin Authorization**: The `adminAuth` middleware checks if the user has admin privileges (user_group = 1 or 2)

### Using Authentication

Include the JWT token in the Authorization header for all protected routes:

```http
Authorization: Bearer <your_jwt_token>
```

### Middleware

- **`verifyToken`**: Verifies JWT token and sets `req.user`

  - Returns `401` if token is missing, invalid, or expired
  - Sets `req.user.user_id` on successful verification

- **`adminAuth`**: Checks if user is admin or moderator
  - Requires `req.user` to be set (must use `verifyToken` first)
  - Returns `401` if user not found
  - Returns `403` if user is not admin/moderator
  - Sets `req.admin` with user details on success

### Example Request

```bash
curl -X GET http://localhost:3000/api/admin/landing-page/navbar/menu-items \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Error Responses

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not an admin
- `500 Internal Server Error`: Server error (check logs for details)

## 📝 Account Types

### Personal Accounts

- Require NIN (National Identification Number)
- Standard user registration flow
- Manual approval required

### Business Accounts

- Require business name and type
- Optional CAC (Corporate Affairs Commission) number
- Business-specific fields and validation

## 🗄️ Database

The project uses **PostgreSQL** as the primary database. The database configuration is in `apis/modules/config/database.ts`.

### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE joscity;
```

2. Run the schema file to create all tables:

```bash
psql -U your_user -d joscity -f database/joscity/schema.sql
```

3. Run additional setup scripts (if needed):

```bash
psql -U your_user -d joscity -f database/joscity/create_all_page_settings.sql
psql -U your_user -d joscity -f database/joscity/add_foreign_keys.sql
```

### Database Schema

The database includes tables for:

- **Users**: User accounts (personal and business)
- **Landing Page Tables**:
  - `navbar_menu_items`, `navbar_settings`
  - `hero_slides`, `hero_page_settings`
  - `services`, `services_page_settings`, `service_requests`
  - `events`, `events_page_settings`, `event_registrations`
  - `pricing_plans`, `pricing_plan_features`, `pricing_page_settings`, `user_subscriptions`
  - `guidelines`, `guidelines_page_settings`
  - `contact_messages`, `contact_information`, `contact_page_settings`
  - `footer_links`, `footer_settings`
- **Posts**: User posts and content
- **System Settings**: Application configuration

### Environment Variables

Make sure to set these in your `.env` file:

```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=joscity
DB_PORT=5432
```

## 📧 Email Service

The application uses Nodemailer for sending emails. Configure your SMTP settings in the `.env` file. The service sends:

- Account registration confirmation
- Account approval notifications with activation codes
- Password reset codes
- Account rejection notifications

## 🛠️ Development

### TypeScript Configuration

The project uses TypeScript with strict type checking. Configuration is in `tsconfig.json`.

### Building

```bash
npm run build
```

This compiles TypeScript files to JavaScript in the `dist/` directory.

### Code Structure

- **Controllers**: Handle business logic and request/response
- **Routes**: Define API endpoints and route handlers
- **Middleware**: Authentication and authorization middleware
- **Config**: Database and service configurations

## 📦 Dependencies

### Production Dependencies

- `express` - Web framework
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `pg` - PostgreSQL database driver
- `nodemailer` - Email service
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

### Development Dependencies

- `typescript` - TypeScript compiler
- `ts-node-dev` - TypeScript development server with hot-reload
- `@types/express` - Express type definitions
- `@types/node` - Node.js type definitions
- `@types/bcryptjs` - bcryptjs type definitions
- `@types/jsonwebtoken` - JWT type definitions
- `@types/pg` - PostgreSQL type definitions
- `@types/nodemailer` - Nodemailer type definitions
- `@types/cors` - CORS type definitions

## 🔒 Security

- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **JWT Authentication**: Secure token-based authentication with expiration (30 days)
- **Token Verification**: All admin routes require valid JWT tokens
- **Role-Based Access Control**: Admin and moderator roles (user_group 1 and 2)
- **Activation Codes**: Time-limited activation codes for account verification
- **Input Validation**: Request validation on all endpoints
- **Error Handling**: Proper error messages without exposing sensitive information
- **CORS**: Cross-origin resource sharing configured for frontend access

### Security Best Practices

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use strong JWT_SECRET** - Generate a secure random string
3. **Keep dependencies updated** - Regularly update npm packages
4. **Validate all inputs** - Server-side validation for all user inputs
5. **Use HTTPS in production** - Encrypt all API communications

## 📄 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions, please open an issue in the repository.

---

## 🐛 Troubleshooting

### Common Issues

**500 Internal Server Error on Admin Routes**

- Ensure JWT token is included in Authorization header
- Verify token is not expired
- Check that user has admin privileges (user_group = 1 or 2)
- Check server logs for detailed error messages

**Database Connection Errors**

- Verify PostgreSQL is running
- Check database credentials in `.env` file
- Ensure database exists and schema is initialized
- Check network connectivity to database server

**Authentication Failures**

- Verify `JWT_SECRET` is set in `.env` file
- Ensure token format is correct: `Bearer <token>`
- Check token expiration (default: 30 days)
- Verify user account is approved and active

**Landing Page API Errors**

- Ensure database tables are created (run schema.sql)
- Check that required settings tables have initial data
- Verify admin user has proper permissions

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT.io](https://jwt.io/) - JWT token decoder and information
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Note**: Make sure to keep your `.env` file secure and never commit it to version control. Use `.gitignore` to exclude sensitive files.
