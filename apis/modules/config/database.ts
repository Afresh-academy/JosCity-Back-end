/* eslint-disable */
import { Pool, PoolClient, QueryResult } from "pg";
import dotenv from "dotenv";
dotenv.config();

// PostgreSQL connection pool configuration
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Set search_path to joscity schema for all connections
pool.on('connect', async (client) => {
  try {
    await client.query('SET search_path TO joscity, public');
  } catch (error) {
    console.error('Error setting search_path:', error);
  }
});

// PostgreSQL native database interface
interface DatabaseConnection {
  query(query: string, params?: any[]): Promise<QueryResult>;
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
}

const db = {
  // Execute query - returns PostgreSQL QueryResult
  async query(query: string, params: any[] = []): Promise<QueryResult> {
    return await pool.query(query, params);
  },

  // Get connection for transactions
  async getConnection(): Promise<DatabaseConnection> {
    const client: PoolClient = await pool.connect();
    
    // Set search_path for this connection
    try {
      await client.query('SET search_path TO joscity, public');
    } catch (error) {
      console.error('Error setting search_path on connection:', error);
    }

    return {
      query: async (
        query: string,
        params: any[] = []
      ): Promise<QueryResult> => {
        return await client.query(query, params);
      },
      beginTransaction: async (): Promise<void> => {
        await client.query("BEGIN");
      },
      commit: async (): Promise<void> => {
        await client.query("COMMIT");
      },
      rollback: async (): Promise<void> => {
        await client.query("ROLLBACK");
      },
      release: (): void => {
        client.release();
      },
    };
  },
};

// Test the connection
async function testConnection(): Promise<void> {
  try {
    // Set search_path first
    await pool.query('SET search_path TO joscity, public');
    
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
  } catch (error: any) {
    console.error("❌ Database Connection Failed:", error.message);
    if (error.code === "ETIMEDOUT" || error.code === "ECONNREFUSED") {
      console.error(
        "   → Check if DB_HOST is correct and PostgreSQL server is running"
      );
      console.error("   → Verify network connectivity and firewall settings");
      console.error(`   → Default PostgreSQL port is 5432`);
    } else if (error.code === "28P01") {
      console.error("   → Check DB_USER and DB_PASSWORD credentials");
    } else if (error.code === "3D000") {
      console.error("   → Database does not exist. Check DB_NAME");
    } else if (error.code === "57P03") {
      console.error("   → Database is starting up, please try again");
    }
  }
}

testConnection();

export default db;
