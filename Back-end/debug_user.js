const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    // Get the latest anonymous user
    const [users] = await connection.query('SELECT * FROM users WHERE is_anonymous = 1 ORDER BY id DESC LIMIT 1');
    console.log('Latest anonymous user:', users[0]);

    const userId = users[0].id;

    // Check conversion prompts
    const [prompts] = await connection.query('SELECT * FROM conversion_prompts WHERE user_id = ?', [userId]);
    console.log('\nConversion prompts:', prompts);

    // Check completed tasks
    const [tasks] = await connection.query('SELECT * FROM user_daily_tasks WHERE user_id = ?', [userId]);
    console.log('\nCompleted tasks:', tasks);

    console.log('\n=== ANALYSIS ===');
    console.log(`User ${userId} completed ${tasks.length} tasks`);
    console.log(`Conversion prompts recorded: ${prompts.length}`);

    if (tasks.length > 0 && prompts.length === 0) {
      console.log('❌ PROBLEM: Tasks completed but NO conversion prompt recorded!');
      console.log('   This means the backend milestone detection is NOT working');
    } else if (prompts.length > 0) {
      console.log('✅ Backend is working - prompt was recorded');
      console.log('❌ PROBLEM: Frontend is not showing the prompt');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

debugUser();
