import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();

// Middleware - must be before routes
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL, // Vercel deployment URL
  process.env.NEXT_PUBLIC_VERCEL_URL, // Alternative Vercel env var
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "jos-city-tawny.vercel.app",
].filter(Boolean);

// Vercel URL patterns (allows any *.vercel.app domain)
const vercelPattern = /^https:\/\/.*\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // If no origin header is present (like for curl or mobile apps), allow
      if (!origin) return callback(null, true);

      // Filter undefined just in case
      const filteredOrigins = allowedOrigins.filter((o): o is string => !!o);

      // Check if origin is in allowed list
      if (filteredOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check if origin matches Vercel pattern
      if (vercelPattern.test(origin)) {
        return callback(null, true);
      }

      // In development, allow all origins (optional - remove in production)
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      // Otherwise, deny
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json());

// Import admin routes
import adminRoutes from "./apis/modules/routes/admin";

// Import routes
import authRoutes from "./apis/modules/routes/authRoute";
import landingPageRoutes from "./apis/modules/routes/landingPage";

// Use admin routes
app.use("/api/admin", adminRoutes);

// Use routes
app.use("/api/auth", authRoutes);

// Public landing page routes (no authentication required)
app.use("/api/landing-page", landingPageRoutes);
// app.use('/api/business', businessRoutes);

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "JosCity Backend API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
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

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is not set in .env file");
  console.error("   Please add JWT_SECRET to your .env file");
  process.exit(1);
}

// Start server
const PORT: number = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`   → Environment: ${process.env.NODE_ENV || "development"}`);
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
    `🗄️  Database: ${
      process.env.DB_HOST || process.env.DATABASE_URL
        ? "Configured"
        : "Using defaults"
    }`
  );
});

// Handle server errors
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error("❌ Server error:", error);
    process.exit(1);
  }
});
