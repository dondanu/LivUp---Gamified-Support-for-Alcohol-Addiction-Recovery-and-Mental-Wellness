const mysql = require('mysql2/promise');
require('dotenv').config();

// Import database initialization
const { initializeDatabase } = require('./initDatabase');

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mind_fusion',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database on startup (creates tables if they don't exist)
let dbInitialized = false;
async function ensureDatabaseInitialized() {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
    } catch (error) {
      console.warn('⚠️  Database initialization warning:', error.message);
    }
  }
}

// Initialize database and signal readiness
async function initializeDatabaseWithGate() {
  try {
    console.log('🔄 Starting database initialization...');
    await initializeDatabase();
    console.log('✅ Database initialization complete');
    
    // Import here to avoid circular dependency
    const { setDatabaseReady } = require('../middleware/startupGate');
    setDatabaseReady(true);
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno
    });
    
    // Import here to avoid circular dependency
    const { setDatabaseReady } = require('../middleware/startupGate');
    setDatabaseReady(false, error);
    return false;
  }
}

// Test connection and initialize database
pool.getConnection()
  .then(async (connection) => {
    console.log('✅ MySQL database connected successfully');
    connection.release();
    // Initialize database (create tables if needed)
    await ensureDatabaseInitialized();
  })
  .catch(async (err) => {
    console.error('❌ MySQL connection error:', err.message);
    console.warn('⚠️  Make sure MySQL is running and credentials in .env are correct');
    // Try to initialize database anyway (might just need to create it)
    try {
      await ensureDatabaseInitialized();
    } catch (initError) {
      console.warn('⚠️  Could not initialize database:', initError.message);
    }
  });

// Helper function to execute queries
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return { data: results, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Helper function for single row queries
const queryOne = async (sql, params = []) => {
  const { data, error } = await query(sql, params);
  if (error) return { data: null, error };
  return { data: data && data.length > 0 ? data[0] : null, error: null };
};

// Helper function to execute queries within a transaction
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Provide transaction-aware query functions
    const txQuery = async (sql, params = []) => {
      try {
        const [results] = await connection.execute(sql, params);
        return { data: results, error: null };
      } catch (error) {
        return { data: null, error };
      }
    };
    
    const txQueryOne = async (sql, params = []) => {
      const { data, error } = await txQuery(sql, params);
      if (error) return { data: null, error };
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    };
    
    // Execute the callback with transaction-aware functions
    const result = await callback({ query: txQuery, queryOne: txQueryOne });
    
    await connection.commit();
    return { data: result, error: null };
  } catch (error) {
    await connection.rollback();
    return { data: null, error };
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  query,
  queryOne,
  transaction,
  initializeDatabaseWithGate
};
