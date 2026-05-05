const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUserPoints() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    console.log('🔍 Checking user points for user_id = 1...\n');

    // Check user profile
    const [profiles] = await connection.query('SELECT * FROM user_profiles WHERE user_id = 1');
    console.log('📊 User Profile:');
    console.log(profiles[0]);
    console.log('');

    // Check completed tasks
    const [completedTasks] = await connection.query(`
      SELECT udt.*, dt.task_name, dt.points_reward 
      FROM user_daily_tasks udt 
      JOIN daily_tasks dt ON udt.task_id = dt.id 
      WHERE udt.user_id = 1
      ORDER BY udt.completion_date DESC
    `);
    console.log('✅ Completed Tasks:');
    console.log(`Total: ${completedTasks.length} tasks`);
    completedTasks.forEach((task, i) => {
      console.log(`${i + 1}. ${task.task_name} - ${task.points_reward} points (${task.completion_date})`);
    });
    console.log('');

    // Calculate expected points
    const expectedPoints = completedTasks.reduce((sum, task) => sum + task.points_reward, 0);
    console.log('💰 Points Summary:');
    console.log(`Expected Points: ${expectedPoints}`);
    console.log(`Actual Points in DB: ${profiles[0].total_points}`);
    console.log(`Difference: ${expectedPoints - profiles[0].total_points}`);
    console.log('');

    // Check levels
    const [levels] = await connection.query('SELECT * FROM levels ORDER BY points_required ASC');
    console.log('🎯 Levels:');
    levels.forEach(level => {
      const isCurrent = profiles[0].level_id === level.id;
      console.log(`${isCurrent ? '👉' : '  '} Level ${level.id}: ${level.level_name} (${level.points_required}+ points)`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkUserPoints();
