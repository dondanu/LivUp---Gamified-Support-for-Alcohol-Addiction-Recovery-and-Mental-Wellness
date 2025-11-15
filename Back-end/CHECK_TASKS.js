// Quick script to check what's in the database
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mind_fusion',
};

async function checkTasks() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Check all tasks
    const [allTasks] = await connection.query('SELECT id, task_name, is_active, difficulty FROM daily_tasks LIMIT 5');
    console.log('📋 Sample tasks:', JSON.stringify(allTasks, null, 2));
    
    // Check active tasks
    const [activeTasks] = await connection.query('SELECT COUNT(*) as count FROM daily_tasks WHERE is_active = 1');
    console.log(`✅ Active tasks (is_active = 1): ${activeTasks[0].count}`);
    
    // Check with boolean TRUE
    const [activeTasksBool] = await connection.query('SELECT COUNT(*) as count FROM daily_tasks WHERE is_active = TRUE');
    console.log(`✅ Active tasks (is_active = TRUE): ${activeTasksBool[0].count}`);
    
    // Check what is_active values actually are
    const [isActiveValues] = await connection.query('SELECT DISTINCT is_active, COUNT(*) as count FROM daily_tasks GROUP BY is_active');
    console.log('📊 is_active value distribution:', JSON.stringify(isActiveValues, null, 2));
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
  }
}

checkTasks();

