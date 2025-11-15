// Script to ensure all tasks are marked as active
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mind_fusion',
};

async function fixIsActive() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Update all tasks to be active (set to 1)
    const [result] = await connection.query(`
      UPDATE daily_tasks 
      SET is_active = 1 
      WHERE is_active IS NULL OR is_active = 0 OR is_active = FALSE
    `);
    console.log(`✅ Updated ${result.affectedRows} tasks to be active`);

    // Verify
    const [activeCount] = await connection.query('SELECT COUNT(*) as count FROM daily_tasks WHERE is_active = 1');
    const [totalCount] = await connection.query('SELECT COUNT(*) as count FROM daily_tasks');
    console.log(`📊 Total tasks: ${totalCount[0].count}, Active tasks: ${activeCount[0].count}`);

    // Show sample
    const [samples] = await connection.query('SELECT id, task_name, is_active FROM daily_tasks LIMIT 3');
    console.log('📋 Sample tasks:', JSON.stringify(samples, null, 2));

    await connection.end();
    console.log('✅ Done! Now restart your backend server and test the API.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

fixIsActive();

