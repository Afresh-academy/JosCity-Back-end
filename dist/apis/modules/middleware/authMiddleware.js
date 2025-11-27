"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminAuth = exports.adminAuth = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
// JWT verification middleware - extracts token and sets req.user
const verifyToken = async (req, res, next) => {
    try {
        // Check if JWT_SECRET is configured
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured in environment variables');
            res.status(500).json({ error: 'Server configuration error', message: 'JWT authentication not properly configured' });
            return;
        }
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'Authentication required', message: 'No authorization header provided' });
            return;
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;
        if (!token) {
            res.status(401).json({ error: 'Authentication required', message: 'No token provided' });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = { user_id: decoded.user_id };
            next();
        }
        catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                res.status(401).json({ error: 'Token expired', message: 'Please login again' });
                return;
            }
            else if (jwtError.name === 'JsonWebTokenError') {
                res.status(401).json({ error: 'Invalid token', message: 'Authentication failed' });
                return;
            }
            throw jwtError;
        }
    }
    catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ error: 'Authentication failed', message: 'Token verification error' });
    }
};
exports.verifyToken = verifyToken;
// first check if user is admin
const adminAuth = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const usersResult = await database_1.default.query('SELECT user_id, user_group FROM users WHERE user_id = $1', [req.user.user_id]);
        if (usersResult.rows.length === 0) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        const user = usersResult.rows[0];
        // check if user is admin (user_group = 1) or moderator (user_group = 2)
        if (user.user_group !== 1 && user.user_group !== 2) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }
        req.admin = user;
        next();
    }
    catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ error: 'Authentication failed', message: error.message || 'Internal server error' });
    }
};
exports.adminAuth = adminAuth;
// this is to check if user is super admin only
const superAdminAuth = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const usersResult = await database_1.default.query('SELECT user_id, user_group FROM users WHERE user_id = $1', [req.user.user_id]);
        if (usersResult.rows.length === 0) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        const user = usersResult.rows[0];
        // This is to allow Only super admin (user_group = 1)
        if (user.user_group !== 1) {
            res.status(403).json({ error: 'Super admin access required' });
            return;
        }
        req.admin = user;
        next();
    }
    catch (error) {
        console.error('Super admin auth error:', error);
        res.status(500).json({ error: 'Authentication failed', message: error.message || 'Internal server error' });
    }
};
exports.superAdminAuth = superAdminAuth;
//# sourceMappingURL=authMiddleware.js.map