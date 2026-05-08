const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUser5() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const [tasks] = await conn.query(
    'SELECT id, task_id, completion_date, created_at FROM user_daily_tasks WHERE user_id = 5 ORDER BY id DESC LIMIT 5'
  );
  
  console.log('User 5 completions:');
  tasks.forEach(t => {
    const dateStr = new Date(t.completion_date).toISOString().split('T')[0];
    console.log('  Date:', dateStr, 'Task:', t.task_id);
  });
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  console.log('\nToday:', today);
  console.log('Yesterday:', yesterday);
  
  if (tasks.length > 0) {
    const latestDate = new Date(tasks[0].completion_date).toISOString().split('T')[0];
    console.log('Latest completion:', latestDate);
    console.log('Is today?', latestDate === today);
    console.log('Is yesterday?', latestDate === yesterday);
  }
  
  await conn.end();
}

checkUser5();
