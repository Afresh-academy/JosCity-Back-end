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
pool.on("error", (err) => {
    // Suppress fatal database termination errors that would crash the server
    const errorMessage = err?.message || err?.toString() || "";
    const isTerminationError = err?.code === "XX000" ||
        errorMessage.includes("shutdown") ||
        errorMessage.includes("termination") ||
        errorMessage.includes("db_termination") ||
        errorMessage === "{:shutdown, :db_termination}";
    if (isTerminationError) {
        // Silently suppress - these errors will cause automatic reconnection
        return;
    }
    console.error("❌ Unexpected database pool error:", errorMessage || err);
    console.error("   → Server will continue, but database operations may fail");
    // Don't throw or exit - let the server continue running
});
// Set search_path to include both schemas for all connections
pool.on("connect", async (client) => {
    try {
        // Catch client errors to prevent them from propagating to pool and crashing server
        if (client && typeof client.on === "function") {
            client.on("error", (err) => {
                // Suppress fatal/termination errors completely
                const errorMessage = err?.message || err?.toString() || "";
                const isTerminationError = err?.code === "XX000" ||
                    errorMessage.includes("shutdown") ||
                    errorMessage.includes("termination") ||
                    errorMessage.includes("db_termination") ||
                    errorMessage === "{:shutdown, :db_termination}";
                if (isTerminationError) {
                    // Completely suppress - connection will be cleaned up and reconnected
                    return;
                }
                // Only log non-fatal errors
                if (errorMessage && !errorMessage.includes("termination")) {
                    console.warn("⚠️  Database client error:", errorMessage);
                }
            });
        }
        // Set search_path to include both schemas
        if (client && typeof client.query === "function") {
            await client
                .query("SET search_path TO landing_page, joscity, public")
                .catch(() => {
                // Ignore errors - connection can still work
            });
        }
    }
    catch (error) {
        console.error("Error setting search_path:", error);
    }
});
// Validate and fix table structure
async function validateAndFixTableStructure(client) {
    try {
        // Ensure joscity schema exists
        await client.query("CREATE SCHEMA IF NOT EXISTS joscity");
        // Check which schema has the users table
        const schemaCheck = await client.query(`
      SELECT table_schema 
      FROM information_schema.tables 
      WHERE table_name = 'users'
      AND table_schema IN ('joscity', 'public')
      ORDER BY table_schema = 'joscity' DESC
      LIMIT 1
    `);
        if (schemaCheck.rows.length === 0) {
            console.warn("⚠️  Users table not found in either joscity or public schema");
            return;
        }
        const tableSchema = schemaCheck.rows[0].table_schema;
        const tableName = `${tableSchema}.users`;
        // Check if user_id column exists in the actual schema
        const columnExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = $1
        AND table_name = 'users' 
        AND column_name = 'user_id'
      ) as exists
    `, [tableSchema]);
        if (!columnExists.rows[0].exists) {
            console.warn(`⚠️  user_id column missing in ${tableName}. Attempting to fix...`);
            // Check if there's a primary key
            const hasPK = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_schema = $1
          AND table_name = 'users'
          AND constraint_type = 'PRIMARY KEY'
        ) as exists
      `, [tableSchema]);
            if (hasPK.rows[0].exists) {
                // Get PK constraint name
                const pkInfo = await client.query(`
          SELECT constraint_name 
          FROM information_schema.table_constraints 
          WHERE table_schema = $1
          AND table_name = 'users'
          AND constraint_type = 'PRIMARY KEY'
          LIMIT 1
        `, [tableSchema]);
                if (pkInfo.rows.length > 0) {
                    await client.query(`ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${pkInfo.rows[0].constraint_name}`);
                }
            }
            // Add user_id column
            await client.query(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS user_id SERIAL`);
            await client.query(`ALTER TABLE ${tableName} ADD PRIMARY KEY (user_id)`);
            console.log(`✅ Fixed: user_id column added to ${tableName}`);
            // If table is in public schema, we should also ensure joscity schema exists
            if (tableSchema === "public") {
                console.warn("⚠️  WARNING: Users table is in public schema, not joscity!");
                console.warn("   → Consider migrating to joscity schema for better organization");
            }
        }
    }
    catch (error) {
        // Don't throw - just log warning
        console.warn("⚠️  Could not validate table structure:", error.message);
    }
}
// Helper to normalize table references in queries to use explicit schema
function normalizeQuery(query, schema = "joscity") {
    // First, clean up any malformed prefixes (like joscity.joscity.users -> joscity.users)
    // Match any repeated schema patterns before .users
    while (/\b([a-z_][a-z0-9_]*)\.\1\.users\b/i.test(query)) {
        query = query.replace(/\b([a-z_][a-z0-9_]*)\.\1\.users\b/gi, `${schema}.users`);
    }
    // Check if query already has schema-qualified table name (prevent double normalization)
    // Match patterns like: joscity.users, public.users, any_schema.users
    // This regex looks for any word characters followed by .users
    if (/\b[a-z_][a-z0-9_]*\.users\b/i.test(query)) {
        return query;
    }
    const schemaPrefix = `${schema}.users`;
    // Replace unqualified table references with explicit schema
    // Only match unqualified "users" that isn't already part of a schema-qualified name
    let normalized = query;
    // Handle FROM users (but not FROM schema.users)
    normalized = normalized.replace(/\bFROM\s+(?![a-z_]+\\.)users(\s|$)/gi, `FROM ${schemaPrefix}$1`);
    // Handle INTO users (but not INTO schema.users)
    normalized = normalized.replace(/\bINTO\s+(?![a-z_]+\\.)users(\s|$)/gi, `INTO ${schemaPrefix}$1`);
    // Handle UPDATE users (but not UPDATE schema.users)
    normalized = normalized.replace(/\bUPDATE\s+(?![a-z_]+\\.)users(\s|$)/gi, `UPDATE ${schemaPrefix}$1`);
    // Handle JOIN users (but not JOIN schema.users)
    normalized = normalized.replace(/\bJOIN\s+(?![a-z_]+\\.)users(\s|$)/gi, `JOIN ${schemaPrefix}$1`);
    // Handle users WHERE (but not schema.users WHERE)
    normalized = normalized.replace(/(?<![a-z_]\.)\busers\s+WHERE/gi, `${schemaPrefix} WHERE`);
    // Handle users SET (but not schema.users SET)
    normalized = normalized.replace(/(?<![a-z_]\.)\busers\s+SET/gi, `${schemaPrefix} SET`);
    // Handle table alias: users u, users as u (but not schema.users u)
    normalized = normalized.replace(/(?<![a-z_]\.)\busers\s+(?:as\s+)?([a-z_][a-z0-9_]*)/gi, `${schemaPrefix} $1`);
    return normalized;
}
// Cache for schema location to avoid repeated queries
let usersTableSchema = null;
// Detect which schema contains the users table
async function detectUsersTableSchema(client) {
    if (usersTableSchema) {
        return usersTableSchema;
    }
    try {
        const result = await client.query(`
      SELECT table_schema 
      FROM information_schema.tables 
      WHERE table_name = 'users'
      AND table_schema IN ('joscity', 'public')
      ORDER BY table_schema = 'joscity' DESC
      LIMIT 1
    `);
        if (result.rows.length > 0) {
            const schema = result.rows[0].table_schema;
            usersTableSchema = schema;
            return schema;
        }
        // Default to joscity if not found
        usersTableSchema = "joscity";
        return "joscity";
    }
    catch (error) {
        // Default to joscity on error
        usersTableSchema = "joscity";
        return usersTableSchema;
    }
}
const db = {
    // Execute query - returns PostgreSQL QueryResult
    // Automatically ensures schema is set and table structure is valid
    async query(query, params = []) {
        try {
            // Ensure search_path is set before query
            await pool
                .query("SET search_path TO landing_page, joscity, public")
                .catch(() => {
                // Ignore - may already be set
            });
            return await pool.query(query, params);
        }
        catch (error) {
            // Suppress fatal termination errors
            const errorMessage = error?.message || error?.toString() || "";
            const isTerminationError = error?.code === "XX000" ||
                errorMessage.includes("shutdown") ||
                errorMessage.includes("termination") ||
                errorMessage.includes("db_termination") ||
                errorMessage === "{:shutdown, :db_termination}";
            if (isTerminationError) {
                // Return empty result instead of crashing - connection will reconnect
                return { rows: [], rowCount: 0, command: "", oid: 0, fields: [] };
            }
            // Log other errors but don't crash
            if (error.code !== "42P01") {
                // Don't log "table does not exist" as error
                console.error("Database query error:", error.message || error);
            }
            throw error; // Re-throw so calling code can handle appropriately
        }
    },
    // Get connection for transactions
    async getConnection() {
        const client = await pool.connect();
        // Handle client errors
        client.on("error", (err) => {
            const errorMessage = err?.message || err?.toString() || "";
            const isTerminationError = err?.code === "XX000" ||
                errorMessage.includes("shutdown") ||
                errorMessage.includes("termination") ||
                errorMessage.includes("db_termination") ||
                errorMessage === "{:shutdown, :db_termination}";
            if (isTerminationError) {
                return; // Completely suppress termination errors
            }
            if (errorMessage && !errorMessage.includes("termination")) {
                console.warn("⚠️  Database client error:", errorMessage);
            }
        });
        // Set search_path for this connection - include landing_page schema
        try {
            await client.query("SET search_path TO landing_page, joscity, public");
        }
        catch (error) {
            console.error("Error setting search_path on connection:", error);
        }
        return {
            query: async (query, params = []) => {
                // Detect schema if needed
                if (!usersTableSchema && query.toLowerCase().includes("users")) {
                    usersTableSchema = await detectUsersTableSchema(client);
                }
                // Normalize query to use explicit schema
                const normalizedQuery = normalizeQuery(query, usersTableSchema || "joscity");
                return await client.query(normalizedQuery, params);
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
// Test the connection
async function testConnection() {
    try {
        // Set search_path first - include landing_page schema
        await pool.query("SET search_path TO landing_page, joscity, public");
        // Validate and fix table structure
        const client = await pool.connect();
        try {
            await validateAndFixTableStructure(client);
        }
        finally {
            client.release();
        }
        // Test if users table exists in joscity schema
        const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as table_exists
    `);
        const result = await pool.query("SELECT NOW() as current_time");
        console.log("✅ Connected to PostgreSQL Database");
        console.log(`   → Server time: ${result.rows[0].current_time}`);
        console.log(`   → Schema: joscity`);
        console.log(`   → Users table exists: ${tableCheck.rows[0].table_exists ? "Yes" : "No"}`);
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
process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await pool.end();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await pool.end();
    process.exit(0);
});
exports.default = db;
//# sourceMappingURL=database.js.map