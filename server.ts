import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Express = express();

// Middleware - must be before routes
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Import admin routes
import adminRoutes from "./apis/modules/routes/admin";

// Import routes
import authRoutes from "./apis/modules/routes/authRoute";
import landingPageRoutes from "./apis/modules/routes/landingPage";

// Use admin routes
app.use("/admin/auth", adminRoutes);

// Use routes
app.use("/api/auth", authRoutes);

// Public landing page routes (no authentication required)
app.use("/api/landing-page", landingPageRoutes);
// app.use('/api/business', businessRoutes);

// Health check
app.get("/api/ping", (_req: Request, res: Response) => {
  res.json({
    message: "pong",
    timestamp: new Date().toISOString(),
    status: "healthy",
  });
});

// 404 handler - catches all unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: true,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error handler
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", error);
  res.status(500).json({
    error: true,
    message: "Internal server error",
  });
});

// Validate required environment variables (non-fatal - just warn)
if (!process.env.JWT_SECRET) {
  console.error("❌ WARNING: JWT_SECRET is not set in .env file");
  console.error("   Please add JWT_SECRET to your .env file");
  console.error("   Server will continue but authentication may not work");
}

// Handle uncaught exceptions - prevent server crash
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('   → Server will continue running');
  // Don't exit - log and continue
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('   → Server will continue running');
  // Don't exit - log and continue
});

// Start server
const PORT: string | number = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `🔐 JWT Authentication: ${
      process.env.JWT_SECRET ? "Configured" : "Not configured"
    }`
  );
  console.log(
    `📧 Email service: ${
      process.env.SMTP_USER ? "Configured" : "Not configured"
    }`
  );
  console.log(
    `🗄️  Database: ${process.env.DB_HOST ? "Configured" : "Using defaults"}` 
  );
});

// Graceful shutdown handler
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
