"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware - must be before routes
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Import admin routes
const admin_1 = __importDefault(require("./apis/modules/routes/admin"));
// Import routes
const authRoute_1 = __importDefault(require("./apis/modules/routes/authRoute"));
const landingPage_1 = __importDefault(require("./apis/modules/routes/landingPage"));
// Use admin routes
app.use("/api/admin", admin_1.default);
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
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    console.error('   → Server will continue running');
    // Don't exit - log and continue
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    console.error('   → Server will continue running');
    // Don't exit - log and continue
});
// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔐 JWT Authentication: ${process.env.JWT_SECRET ? "Configured" : "Not configured"}`);
    console.log(`📧 Email service: ${process.env.SMTP_USER ? "Configured" : "Not configured"}`);
    console.log(`🗄️  Database: ${process.env.DB_HOST ? "Configured" : "Using defaults"}`);
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
//# sourceMappingURL=server.js.map