const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkRawDates() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    const [tasks] = await connection.query(
      'SELECT id, task_id, completion_date, created_at FROM user_daily_tasks WHERE user_id = 1 ORDER BY id DESC LIMIT 15'
    );

    console.log('=== RAW COMPLETION DATA ===\n');
    tasks.forEach((task, i) => {
      console.log(`${i + 1}. ID: ${task.id}`);
      console.log(`   Task ID: ${task.task_id}`);
      console.log(`   Completion Date: ${task.completion_date}`);
      console.log(`   Created At: ${task.created_at}`);
      console.log('');
    });

    // Check unique dates
    const [dates] = await connection.query(
      'SELECT DISTINCT DATE(completion_date) as date, COUNT(*) as count FROM user_daily_tasks WHERE user_id = 1 GROUP BY DATE(completion_date) ORDER BY date DESC'
    );

    console.log('=== UNIQUE DATES WITH COUNTS ===\n');
    dates.forEach((d, i) => {
      console.log(`${i + 1}. ${d.date} - ${d.count} challenges`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkRawDates();
