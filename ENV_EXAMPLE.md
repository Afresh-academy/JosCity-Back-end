# Environment Variables Example

Copy this to `.env` in the `JosCity-Backend` directory:

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration (PostgreSQL)
# Option 1: Use DATABASE_URL (recommended for Render)
DATABASE_URL=postgresql://user:password@host:port/database

# Option 2: Use individual variables
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=joscity
DB_PORT=5432

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@joscity.com

# Frontend URL (for CORS)
FRONTEND_URL=https://joscity-frontend.onrender.com
```

## For Render Deployment

Render automatically provides `DATABASE_URL` when you connect a PostgreSQL database. You only need to set:

- `JWT_SECRET` - Generate a strong random secret
- `SMTP_*` - Your email service credentials
- `FRONTEND_URL` - Your frontend Render URL
