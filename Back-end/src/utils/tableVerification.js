const { query } = require('../config/database');

async function verifyTableExists(tableName) {
  const sql = `
    SELECT COUNT(*) as count 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
    AND table_name = ?
  `;
  
  const { data, error } = await query(sql, [tableName]);
  
  if (error) {
    console.error(`[TableVerification] Error checking table ${tableName}:`, error);
    return false;
  }
  
  return data && data[0] && data[0].count > 0;
}

async function verifyTableHasData(tableName) {
  const sql = `SELECT COUNT(*) as count FROM ??`;
  const { data, error } = await query(sql, [tableName]);
  
  if (error) {
    console.error(`[TableVerification] Error checking data in ${tableName}:`, error);
    return false;
  }
  
  return data && data[0] && data[0].count > 0;
}

module.exports = { verifyTableExists, verifyTableHasData };
