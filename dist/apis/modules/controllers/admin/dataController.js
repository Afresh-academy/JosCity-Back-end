"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQuery = exports.getTableData = exports.getTableSchema = exports.getDatabaseTables = exports.getAllUsers = exports.getDatabaseStats = void 0;
const database_1 = __importDefault(require("../../config/database"));
/**
 * Get database statistics and overview
 */
const getDatabaseStats = async (_req, res) => {
    try {
        // Get user statistics
        const userStatsResult = await database_1.default.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE account_status = 'pending') as pending_users,
        COUNT(*) FILTER (WHERE account_status = 'approved') as approved_users,
        COUNT(*) FILTER (WHERE account_status = 'rejected') as rejected_users,
        COUNT(*) FILTER (WHERE account_status = 'suspended') as suspended_users,
        COUNT(*) FILTER (WHERE account_type = 'personal') as personal_accounts,
        COUNT(*) FILTER (WHERE account_type = 'business') as business_accounts,
        COUNT(*) FILTER (WHERE user_group = 1) as admins,
        COUNT(*) FILTER (WHERE user_group = 2) as moderators,
        COUNT(*) FILTER (WHERE user_verified = true) as verified_users,
        COUNT(*) FILTER (WHERE user_banned = true) as banned_users
      FROM users
    `);
        // Get recent registrations (last 7 days)
        const recentRegistrationsResult = await database_1.default.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE user_registered >= NOW() - INTERVAL '7 days'
    `);
        // Get active users (last 24 hours)
        const activeUsersResult = await database_1.default.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE user_last_seen >= NOW() - INTERVAL '24 hours'
    `);
        const stats = {
            users: userStatsResult.rows[0],
            recent_registrations: parseInt(recentRegistrationsResult.rows[0].count),
            active_users_24h: parseInt(activeUsersResult.rows[0].count)
        };
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Get database stats error:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to fetch database statistics'
        });
    }
};
exports.getDatabaseStats = getDatabaseStats;
/**
 * Get all users from database with pagination and filters
 */
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 50, status, account_type, search, sort_by = 'user_registered', sort_order = 'DESC' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let whereClause = 'WHERE 1=1';
        let queryParams = [];
        let paramIndex = 1;
        // Status filter
        if (status) {
            whereClause += ` AND account_status = $${paramIndex}`;
            queryParams.push(status);
            paramIndex++;
        }
        // Account type filter
        if (account_type) {
            whereClause += ` AND account_type = $${paramIndex}`;
            queryParams.push(account_type);
            paramIndex++;
        }
        // Search filter
        if (search) {
            const searchTerm = `%${search}%`;
            whereClause += ` AND (
        user_name ILIKE $${paramIndex} OR 
        user_firstname ILIKE $${paramIndex + 1} OR 
        user_lastname ILIKE $${paramIndex + 2} OR 
        user_email ILIKE $${paramIndex + 3} OR 
        user_phone ILIKE $${paramIndex + 4}
      )`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
            paramIndex += 5;
        }
        // Validate sort_by to prevent SQL injection
        const allowedSortColumns = [
            'user_id', 'user_registered', 'user_last_seen', 'user_name',
            'user_email', 'account_status', 'account_type', 'user_group'
        ];
        const sortColumn = allowedSortColumns.includes(sort_by)
            ? sort_by
            : 'user_registered';
        const sortDirection = sort_order === 'ASC' ? 'ASC' : 'DESC';
        // Get users
        const usersResult = await database_1.default.query(`SELECT 
        user_id, user_name, user_firstname, user_lastname, user_email, 
        user_phone, user_gender, address, account_type, account_status,
        nin_number, business_name, business_type, CAC_number, business_location,
        user_approved, user_activated, user_banned, user_verified, user_group,
        is_verified, user_registered, user_last_seen, last_login,
        profile_image_url, created_at, updated_at
       FROM users 
       ${whereClause} 
       ORDER BY ${sortColumn} ${sortDirection}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, [...queryParams, parseInt(limit), offset]);
        // Get total count
        const totalResult = await database_1.default.query(`SELECT COUNT(*) as count FROM users ${whereClause}`, queryParams);
        res.json({
            success: true,
            data: usersResult.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(totalResult.rows[0].count),
                totalPages: Math.ceil(parseInt(totalResult.rows[0].count) / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to fetch users'
        });
    }
};
exports.getAllUsers = getAllUsers;
/**
 * Get all tables in the database
 */
const getDatabaseTables = async (_req, res) => {
    try {
        const tablesResult = await database_1.default.query(`
      SELECT 
        table_name,
        table_schema
      FROM information_schema.tables
      WHERE table_schema = 'joscity' OR table_schema = 'public'
      ORDER BY table_schema, table_name
    `);
        res.json({
            success: true,
            data: tablesResult.rows
        });
    }
    catch (error) {
        console.error('Get database tables error:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to fetch database tables'
        });
    }
};
exports.getDatabaseTables = getDatabaseTables;
/**
 * Get table structure/schema
 */
const getTableSchema = async (req, res) => {
    try {
        const { table_name } = req.params;
        const { schema = 'joscity' } = req.query;
        // Prevent SQL injection by validating table name
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table_name)) {
            res.status(400).json({
                error: true,
                message: 'Invalid table name'
            });
            return;
        }
        const schemaResult = await database_1.default.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position
    `, [schema, table_name]);
        if (schemaResult.rows.length === 0) {
            res.status(404).json({
                error: true,
                message: 'Table not found'
            });
            return;
        }
        res.json({
            success: true,
            data: {
                table_name,
                schema,
                columns: schemaResult.rows
            }
        });
    }
    catch (error) {
        console.error('Get table schema error:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to fetch table schema'
        });
    }
};
exports.getTableSchema = getTableSchema;
/**
 * Get table data with pagination
 */
const getTableData = async (req, res) => {
    try {
        const { table_name } = req.params;
        const { schema = 'joscity', page = 1, limit = 100 } = req.query;
        // Prevent SQL injection by validating table name
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table_name)) {
            res.status(400).json({
                error: true,
                message: 'Invalid table name'
            });
            return;
        }
        // Validate schema name
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
            res.status(400).json({
                error: true,
                message: 'Invalid schema name'
            });
            return;
        }
        const offset = (Number(page) - 1) * Number(limit);
        // Get table data
        const dataResult = await database_1.default.query(`SELECT * FROM ${schema}.${table_name} LIMIT $1 OFFSET $2`, [parseInt(limit), offset]);
        // Get total count
        const countResult = await database_1.default.query(`SELECT COUNT(*) as count FROM ${schema}.${table_name}`);
        res.json({
            success: true,
            data: dataResult.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get table data error:', error);
        res.status(500).json({
            error: true,
            message: error.message || 'Failed to fetch table data'
        });
    }
};
exports.getTableData = getTableData;
/**
 * Execute custom query (read-only operations)
 */
const executeQuery = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || typeof query !== 'string') {
            res.status(400).json({
                error: true,
                message: 'Query is required and must be a string'
            });
            return;
        }
        // Prevent dangerous operations - only allow SELECT queries
        const trimmedQuery = query.trim().toUpperCase();
        if (!trimmedQuery.startsWith('SELECT')) {
            res.status(403).json({
                error: true,
                message: 'Only SELECT queries are allowed'
            });
            return;
        }
        // Prevent common SQL injection patterns
        const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE', 'EXEC', 'EXECUTE'];
        const hasDangerousKeyword = dangerousKeywords.some(keyword => trimmedQuery.includes(keyword));
        if (hasDangerousKeyword) {
            res.status(403).json({
                error: true,
                message: 'Query contains prohibited keywords'
            });
            return;
        }
        const result = await database_1.default.query(query);
        res.json({
            success: true,
            data: result.rows,
            rowCount: result.rows.length
        });
    }
    catch (error) {
        console.error('Execute query error:', error);
        res.status(500).json({
            error: true,
            message: error.message || 'Failed to execute query'
        });
    }
};
exports.executeQuery = executeQuery;
//# sourceMappingURL=dataController.js.map