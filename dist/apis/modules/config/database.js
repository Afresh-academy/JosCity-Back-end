"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable */
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// PostgreSQL connection pool configuration
const pool = new pg_1.Pool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});
// Handle pool errors gracefully - don't crash the server
pool.on('error', (err) => {
    // Suppress fatal database termination errors that would crash the server
    const errorMessage = err?.message || err?.toString() || '';
    const isTerminationError = err?.code === 'XX000' ||
        errorMessage.includes('shutdown') ||
        errorMessage.includes('termination') ||
        errorMessage.includes('db_termination') ||
        errorMessage === '{:shutdown, :db_termination}';
    if (isTerminationError) {
        // Silently suppress - these errors will cause automatic reconnection
        return;
    }
    console.error('❌ Unexpected database pool error:', errorMessage || err);
    console.error('   → Server will continue, but database operations may fail');
    // Don't throw or exit - let the server continue running
});
// Set search_path to include both schemas for all connections
pool.on('connect', async (client) => {
    try {
        // Catch client errors to prevent them from propagating to pool and crashing server
        if (client && typeof client.on === 'function') {
            client.on('error', (err) => {
                // Suppress fatal/termination errors completely
                const errorMessage = err?.message || err?.toString() || '';
                const isTerminationError = err?.code === 'XX000' ||
                    errorMessage.includes('shutdown') ||
                    errorMessage.includes('termination') ||
                    errorMessage.includes('db_termination') ||
                    errorMessage === '{:shutdown, :db_termination}';
                if (isTerminationError) {
                    // Completely suppress - connection will be cleaned up and reconnected
                    return;
                }
                // Only log non-fatal errors
                if (errorMessage && !errorMessage.includes('termination')) {
                    console.warn('⚠️  Database client error:', errorMessage);
                }
            });
        }
        // Set search_path to include both schemas
        if (client && typeof client.query === 'function') {
            await client.query('SET search_path TO landing_page, joscity, public').catch(() => {
                // Ignore errors - connection can still work
            });
        }
    }
    catch (error) {
        // Ignore - connection setup errors shouldn't crash server
    }
});
const db = {
    // Execute query - returns PostgreSQL QueryResult
    async query(query, params = []) {
        try {
            // Ensure search_path is set before query
            await pool.query('SET search_path TO landing_page, joscity, public').catch(() => {
                // Ignore - may already be set
            });
            return await pool.query(query, params);
        }
        catch (error) {
            // Suppress fatal termination errors
            const errorMessage = error?.message || error?.toString() || '';
            const isTerminationError = error?.code === 'XX000' ||
                errorMessage.includes('shutdown') ||
                errorMessage.includes('termination') ||
                errorMessage.includes('db_termination') ||
                errorMessage === '{:shutdown, :db_termination}';
            if (isTerminationError) {
                // Return empty result instead of crashing - connection will reconnect
                return { rows: [], rowCount: 0, command: '', oid: 0, fields: [] };
            }
            // Log other errors but don't crash
            if (error.code !== '42P01') { // Don't log "table does not exist" as error
                console.error('Database query error:', error.message || error);
            }
            throw error; // Re-throw so calling code can handle appropriately
        }
    },
    // Get connection for transactions
    async getConnection() {
        const client = await pool.connect();
        // Handle client errors
        client.on('error', (err) => {
            const errorMessage = err?.message || err?.toString() || '';
            const isTerminationError = err?.code === 'XX000' ||
                errorMessage.includes('shutdown') ||
                errorMessage.includes('termination') ||
                errorMessage.includes('db_termination') ||
                errorMessage === '{:shutdown, :db_termination}';
            if (isTerminationError) {
                return; // Completely suppress termination errors
            }
            if (errorMessage && !errorMessage.includes('termination')) {
                console.warn('⚠️  Database client error:', errorMessage);
            }
        });
        // Set search_path for this connection - include landing_page schema
        try {
            await client.query('SET search_path TO landing_page, joscity, public');
        }
        catch (error) {
            // Ignore errors - connection can still work
        }
        return {
            query: async (query, params = []) => {
                return await client.query(query, params);
            },
            beginTransaction: async () => {
                await client.query("BEGIN");
            },
            commit: async () => {
                await client.query("COMMIT");
            },
            rollback: async () => {
                await client.query("ROLLBACK");
            },
            release: () => {
                client.release();
            },
        };
    },
};
// Test the connection (non-blocking - won't crash server if it fails)
async function testConnection() {
    try {
        // Set search_path first - include landing_page schema
        await pool.query('SET search_path TO landing_page, joscity, public');
        // Test if users table exists in joscity schema
        const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'joscity' 
        AND table_name = 'users'
      ) as table_exists
    `);
        const result = await pool.query("SELECT NOW() as current_time");
        console.log("✅ Connected to PostgreSQL Database");
        console.log(`   → Server time: ${result.rows[0].current_time}`);
        console.log(`   → Schema: joscity`);
        console.log(`   → Users table exists: ${tableCheck.rows[0].table_exists ? 'Yes' : 'No'}`);
        if (!tableCheck.rows[0].table_exists) {
            console.warn("⚠️  WARNING: Users table not found in joscity schema!");
            console.warn("   → Please run: psql -U your_user -d postgres -f database/joscity/users_schema.sql");
        }
    }
    catch (error) {
        console.error("❌ Database Connection Failed:", error.message);
        console.error("   → Server will continue running, but database operations will fail");
        if (error.code === "ETIMEDOUT" || error.code === "ECONNREFUSED") {
            console.error("   → Check if DB_HOST is correct and PostgreSQL server is running");
            console.error("   → Verify network connectivity and firewall settings");
            console.error(`   → Default PostgreSQL port is 5432`);
        }
        else if (error.code === "28P01") {
            console.error("   → Check DB_USER and DB_PASSWORD credentials");
        }
        else if (error.code === "3D000") {
            console.error("   → Database does not exist. Check DB_NAME");
        }
        else if (error.code === "57P03") {
            console.error("   → Database is starting up, please try again");
        }
        // Don't throw - let server start even if database connection fails
    }
}
// Test connection but don't block server startup
testConnection().catch(() => {
    // Already handled in testConnection - just prevent unhandled rejection
});
// Graceful shutdown handler
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await pool.end();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await pool.end();
    process.exit(0);
});
exports.default = db;
//# sourceMappingURL=database.js.map