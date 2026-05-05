const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAchievements() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    console.log('🏆 Checking achievements for user_id = 1...\n');

    // Get user stats
    const [profile] = await connection.query('SELECT * FROM user_profiles WHERE user_id = 1');
    const [completedTasks] = await connection.query('SELECT COUNT(*) as count FROM user_daily_tasks WHERE user_id = 1');
    const [drinkLogs] = await connection.query('SELECT * FROM drink_logs WHERE user_id = 1 ORDER BY log_date DESC');

    console.log('📊 User Stats:');
    console.log(`Total Points: ${profile[0].total_points}`);
    console.log(`Days Sober: ${profile[0].days_sober}`);
    console.log(`Current Streak: ${profile[0].current_streak}`);
    console.log(`Tasks Completed: ${completedTasks[0].count}`);
    console.log(`Drink Logs: ${drinkLogs.length}`);
    console.log('');

    // Get all achievements
    const [allAchievements] = await connection.query('SELECT * FROM achievements ORDER BY points_reward ASC');
    
    // Get user's earned achievements
    const [userAchievements] = await connection.query('SELECT achievement_id FROM user_achievements WHERE user_id = 1');
    const earnedIds = new Set(userAchievements.map(ua => ua.achievement_id));

    console.log('🎖️  Achievements Status:\n');
    
    for (const achievement of allAchievements) {
      const earned = earnedIds.has(achievement.id);
      const status = earned ? '✅' : '❌';
      
      console.log(`${status} ${achievement.achievement_name}`);
      console.log(`   Description: ${achievement.description}`);
      console.log(`   Requirement: ${achievement.requirement_type} >= ${achievement.requirement_value}`);
      console.log(`   Points Reward: ${achievement.points_reward}`);
      
      // Check if should be earned
      let shouldEarn = false;
      switch (achievement.requirement_type) {
        case 'days_sober':
          shouldEarn = profile[0].days_sober >= achievement.requirement_value;
          break;
        case 'streak':
          shouldEarn = profile[0].current_streak >= achievement.requirement_value;
          break;
        case 'tasks_completed':
          shouldEarn = completedTasks[0].count >= achievement.requirement_value;
          break;
        case 'points':
          shouldEarn = profile[0].total_points >= achievement.requirement_value;
          break;
      }
      
      if (shouldEarn && !earned) {
        console.log(`   ⚠️  SHOULD BE EARNED BUT NOT AWARDED!`);
      }
      
      console.log('');
    }

    console.log(`\n📈 Summary: ${earnedIds.size} / ${allAchievements.length} achievements earned`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkAchievements();
