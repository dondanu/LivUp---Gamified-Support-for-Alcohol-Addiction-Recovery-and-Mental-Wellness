const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    // Check user 9
    const [users] = await connection.query('SELECT * FROM users WHERE id = 9');
    console.log('User 9:', users[0]);
    
    // Check if any conversion prompts were recorded
    const [prompts] = await connection.query('SELECT * FROM conversion_prompts WHERE user_id = 9');
    console.log('\nConversion prompts for user 9:', prompts);
    
    // Check completed tasks
    const [tasks] = await connection.query('SELECT * FROM user_daily_tasks WHERE user_id = 9');
    console.log('\nCompleted tasks for user 9:', tasks);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkUser();
