import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";

// Load environment variables - check multiple locations with proper file existence checks
const backendEnvPath = path.resolve(__dirname, ".env");
const rootEnvPath = path.resolve(__dirname, "..", ".env");
const parentEnvPath = path.resolve(process.cwd(), ".env");

// Try to load .env files in priority order (first found wins)
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
  console.log(`📄 Loaded .env from: ${backendEnvPath}`);
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
  console.log(`📄 Loaded .env from: ${rootEnvPath}`);
} else if (fs.existsSync(parentEnvPath)) {
  dotenv.config({ path: parentEnvPath });
  console.log(`📄 Loaded .env from: ${parentEnvPath}`);
} else {
  // Fallback to default dotenv lookup
  dotenv.config();
  console.log(`📄 Using default dotenv lookup`);
}

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
import * as authController from "./apis/modules/controllers/authController";

// Use admin routes - mounted at /admin so routes become /admin/auth, /admin/dashboard, etc.
app.use("/admin", adminRoutes);

// Admin authentication route with hardcoded credentials
app.post("/api/admin/adminAuth", authController.adminAuth);

// Use routes
app.use("/api/auth", authRoutes);

// Public landing page routes (no authentication required)
app.use("/api/landing-page", landingPageRoutes);
// app.use('/api/business', businessRoutes);

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "JosCity Backend API",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/ping",
      auth: "/api/auth",
      landingPage: "/api/landing-page",
      admin: "/admin",
    },
  });
});

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
process.on("uncaughtException", (error: Error) => {
  console.error("❌ Uncaught Exception:", error);
  console.error("   → Server will continue running");
  // Don't exit - log and continue
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  console.error("   → Server will continue running");
  // Don't exit - log and continue
});

// Export app for Vercel serverless functions
module.exports = app;

// Start server only if not in Vercel environment
if (process.env.VERCEL !== "1") {
  const PORT: string | number = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(
      `🔐 JWT Authentication: ${
        process.env.JWT_SECRET ? "Configured" : "Not configured"
      }`
    );
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (smtpUser && smtpPass) {
      const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
      const smtpPort = process.env.SMTP_PORT || "465";
      console.log(
        `📧 Email service: ✅ Configured (SMTP: ${smtpHost}:${smtpPort})`
      );
      console.log(
        `   SMTP_USER: ${smtpUser.substring(0, smtpUser.indexOf("@") + 1)}...`
      );
      console.log(
        `   SMTP_FROM: ${
          process.env.SMTP_FROM || smtpUser || "Not set (using default)"
        }`
      );
    } else {
      console.warn(
        `📧 Email service: ⚠️  Not configured - SMTP_USER or SMTP_PASS missing`
      );
    }
    console.log(
      `🗄️  Database: ${process.env.DB_HOST ? "Configured" : "Using defaults"}`
    );
  });

  // Graceful shutdown handler
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down server gracefully...");
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  });

  process.on("SIGTERM", () => {
    console.log("\n🛑 Shutting down server gracefully...");
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  });
}
