const { Pool } = require('pg');
require('dotenv').config();

// Supabase uses standard PostgreSQL connection with SSL
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Event listeners for connection monitoring
pool.on('connect', () => {
  console.log('✅ Connected to Supabase PostgreSQL');
});

pool.on('error', (err: Error) => {
  console.error('❌ Database pool error:', err.message);
});

// Basic query function
const query = async (text: string, params?: any[]) => {
  try {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📊 Executed query in ${duration}ms: ${text.substring(0, 50)}...`);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Query error:', error.message);
    } else {
      console.error('❌ Query error:', error);
    }
    throw error;
  }
};

// Get a client for transactions
const getClient = async () => {
  const client = await pool.connect();
  
  // Set up client-level error handling
  client.on('error', (err: Error) => {
    console.error('❌ Client error:', err);
  });
  
  return client;
};

module.exports = {
  query,
  getClient,
  pool
};