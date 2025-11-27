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
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'https://joscity-frontend.onrender.com'
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // If no origin header is present (like for curl or mobile apps), allow
        if (!origin)
            return callback(null, true);
        // Filter undefined just in case
        const filteredOrigins = allowedOrigins.filter((o) => !!o);
        if (filteredOrigins.includes(origin)) {
            return callback(null, true);
        }
        else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
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
// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error("❌ ERROR: JWT_SECRET is not set in .env file");
    console.error("   Please add JWT_SECRET to your .env file");
    process.exit(1);
}
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔐 JWT Authentication: ${process.env.JWT_SECRET ? "Configured" : "Not configured"}`);
    console.log(`📧 Email service: ${process.env.SMTP_USER ? "Configured" : "Not configured"}`);
    console.log(`🗄️  Database: ${process.env.DB_HOST ? "Configured" : "Using defaults"}`);
});
//# sourceMappingURL=server.js.map