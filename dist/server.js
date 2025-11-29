"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables - check multiple locations with proper file existence checks
const backendEnvPath = path_1.default.resolve(__dirname, ".env");
const rootEnvPath = path_1.default.resolve(__dirname, "..", ".env");
const parentEnvPath = path_1.default.resolve(process.cwd(), ".env");
// Try to load .env files in priority order (first found wins)
if (fs_1.default.existsSync(backendEnvPath)) {
    dotenv_1.default.config({ path: backendEnvPath });
    console.log(`📄 Loaded .env from: ${backendEnvPath}`);
}
else if (fs_1.default.existsSync(rootEnvPath)) {
    dotenv_1.default.config({ path: rootEnvPath });
    console.log(`📄 Loaded .env from: ${rootEnvPath}`);
}
else if (fs_1.default.existsSync(parentEnvPath)) {
    dotenv_1.default.config({ path: parentEnvPath });
    console.log(`📄 Loaded .env from: ${parentEnvPath}`);
}
else {
    // Fallback to default dotenv lookup
    dotenv_1.default.config();
    console.log(`📄 Using default dotenv lookup`);
}
const app = (0, express_1.default)();
// Middleware - must be before routes
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Import admin routes
const admin_1 = __importDefault(require("./apis/modules/routes/admin"));
// Import routes
const authRoute_1 = __importDefault(require("./apis/modules/routes/authRoute"));
const landingPage_1 = __importDefault(require("./apis/modules/routes/landingPage"));
// Use admin routes - mounted at /admin so routes become /admin/auth, /admin/dashboard, etc.
app.use("/admin", admin_1.default);
// Use routes
app.use("/api/auth", authRoute_1.default);
// Public landing page routes (no authentication required)
app.use("/api/landing-page", landingPage_1.default);
// app.use('/api/business', businessRoutes);
// Health check
app.get("/api/ping", (_req, res) => {
    res.json({
        message: "pong",
        timestamp: new Date().toISOString(),
        status: "healthy",
    });
});
// 404 handler - catches all unmatched routes
app.use((req, res) => {
    res.status(404).json({
        error: true,
        message: "Route not found",
        path: req.originalUrl,
    });
});
// Error handler
app.use((error, _req, res, _next) => {
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
process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    console.error("   → Server will continue running");
    // Don't exit - log and continue
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    console.error("   → Server will continue running");
    // Don't exit - log and continue
});
// Export app for Vercel serverless functions
module.exports = app;
// Start server only if not in Vercel environment
if (process.env.VERCEL !== "1") {
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🔐 JWT Authentication: ${process.env.JWT_SECRET ? "Configured" : "Not configured"}`);
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
            console.log(`📧 Email service: ✅ Configured (Resend API Key: ${resendKey.substring(0, 12)}...)`);
            console.log(`   RESEND_FROM: ${process.env.RESEND_FROM ||
                process.env.SMTP_FROM ||
                "Not set (using default)"}`);
        }
        else {
            console.warn(`📧 Email service: ⚠️  Not configured - RESEND_API_KEY missing`);
        }
        console.log(`🗄️  Database: ${process.env.DB_HOST ? "Configured" : "Using defaults"}`);
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
//# sourceMappingURL=server.js.map