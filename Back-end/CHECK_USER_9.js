const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUser9() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mindfusion',
  });

  try {
    console.log('🔍 Checking User 9 (test2) Status\n');
    console.log('='.repeat(60));

    // Get user profile
    const [profile] = await connection.query(
      'SELECT * FROM user_profiles WHERE user_id = 9'
    );
    
    if (profile.length === 0) {
      console.log('❌ User 9 not found!');
      return;
    }

    console.log('\n👤 USER PROFILE:');
    console.log(`   User ID: ${profile[0].user_id}`);
    console.log(`   Total Points: ${profile[0].total_points}`);
    console.log(`   Level: ${profile[0].level_id}`);
    console.log(`   Current Streak: ${profile[0].current_streak}`);
    console.log(`   Longest Streak: ${profile[0].longest_streak}`);

    // Get completed tasks
    const [tasks] = await connection.query(
      'SELECT COUNT(*) as count FROM user_daily_tasks WHERE user_id = 9'
    );
    console.log(`\n✅ TASKS COMPLETED: ${tasks[0].count}`);

    // Get achievements
    const [achievements] = await connection.query(`
      SELECT 
        a.achievement_name,
        a.requirement_type,
        a.requirement_value,
        a.points_reward,
        ua.earned_at
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = 9
      ORDER BY ua.earned_at DESC
    `);

    console.log(`\n🏆 ACHIEVEMENTS EARNED: ${achievements.length}`);
    if (achievements.length > 0) {
      console.log('\nList:');
      achievements.forEach((ach, i) => {
        console.log(`   ${i + 1}. ${ach.achievement_name} (+${ach.points_reward} pts)`);
        console.log(`      Type: ${ach.requirement_type}, Value: ${ach.requirement_value}`);
        console.log(`      Earned: ${ach.earned_at}`);
      });
    }

    // Check for duplicate achievements in database
    console.log('\n\n🔍 CHECKING FOR DUPLICATE ACHIEVEMENTS IN DATABASE:');
    const [duplicates] = await connection.query(`
      SELECT achievement_name, COUNT(*) as count
      FROM achievements
      GROUP BY achievement_name
      HAVING count > 1
    `);

    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} duplicate achievement names:`);
      duplicates.forEach(dup => {
        console.log(`   - ${dup.achievement_name} (${dup.count} times)`);
      });
    } else {
      console.log('\n✅ No duplicate achievements found!');
    }

    // Total achievements in database
    const [total] = await connection.query('SELECT COUNT(*) as count FROM achievements');
    console.log(`\n📊 Total achievements in database: ${total[0].count}`);

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkUser9();
