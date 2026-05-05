const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixUserPoints() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    console.log('🔧 Fixing user points...\n');

    // Calculate correct points from completed tasks
    const [completedTasks] = await connection.query(`
      SELECT udt.*, dt.points_reward 
      FROM user_daily_tasks udt 
      JOIN daily_tasks dt ON udt.task_id = dt.id 
      WHERE udt.user_id = 1
    `);

    const totalPoints = completedTasks.reduce((sum, task) => sum + task.points_reward, 0);
    console.log(`✅ Calculated total points: ${totalPoints}`);

    // Get levels
    const [levels] = await connection.query('SELECT * FROM levels WHERE id <= 7 ORDER BY points_required ASC');
    
    // Determine correct level
    let correctLevel = levels[0];
    for (const level of levels) {
      if (totalPoints >= level.points_required) {
        correctLevel = level;
      } else {
        break;
      }
    }

    console.log(`🎯 Correct level: Level ${correctLevel.id} - ${correctLevel.level_name}`);

    // Update user profile
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await connection.query(
      'UPDATE user_profiles SET total_points = ?, level_id = ?, avatar_type = ?, updated_at = ? WHERE user_id = 1',
      [totalPoints, correctLevel.id, correctLevel.avatar_unlock, now]
    );

    console.log('✅ User profile updated!');

    // Verify
    const [updatedProfile] = await connection.query('SELECT * FROM user_profiles WHERE user_id = 1');
    console.log('\n📊 Updated Profile:');
    console.log(`Points: ${updatedProfile[0].total_points}`);
    console.log(`Level ID: ${updatedProfile[0].level_id}`);
    console.log(`Avatar: ${updatedProfile[0].avatar_type}`);

    // Clean up duplicate levels
    console.log('\n🧹 Cleaning up duplicate levels...');
    await connection.query('DELETE FROM levels WHERE id > 7');
    console.log('✅ Duplicate levels removed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixUserPoints();
