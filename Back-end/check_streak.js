const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkStreak() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    // Check user 1 (danu)
    const [users] = await connection.query('SELECT * FROM users WHERE username = "danu"');
    console.log('User:', users[0]);

    if (users[0]) {
      const userId = users[0].id;
      
      // Check profile with streak info
      const [profile] = await connection.query('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
      console.log('\n=== PROFILE DATA ===');
      console.log('Total Points:', profile[0]?.total_points);
      console.log('Level ID:', profile[0]?.level_id);
      console.log('Current Streak:', profile[0]?.current_streak);
      console.log('Longest Streak:', profile[0]?.longest_streak);
      console.log('Days Sober:', profile[0]?.days_sober);

      // Check completed tasks
      const [tasks] = await connection.query(
        'SELECT * FROM user_daily_tasks WHERE user_id = ? ORDER BY completion_date DESC',
        [userId]
      );
      console.log('\n=== COMPLETED TASKS ===');
      console.log('Total completed:', tasks.length);
      if (tasks.length > 0) {
        console.log('\nRecent completions:');
        tasks.slice(0, 5).forEach((task, i) => {
          console.log(`${i + 1}. Task ID: ${task.task_id}, Date: ${task.completion_date}`);
        });
      }

      // Check unique completion dates
      const [dates] = await connection.query(
        'SELECT DISTINCT completion_date FROM user_daily_tasks WHERE user_id = ? ORDER BY completion_date DESC',
        [userId]
      );
      console.log('\n=== UNIQUE COMPLETION DATES ===');
      console.log('Total unique dates:', dates.length);
      if (dates.length > 0) {
        console.log('Dates:');
        dates.forEach((d, i) => {
          console.log(`${i + 1}. ${d.completion_date}`);
        });
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkStreak();
