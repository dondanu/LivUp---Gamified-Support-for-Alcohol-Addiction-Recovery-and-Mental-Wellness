const mysql = require('mysql2/promise');
require('dotenv').config();

async function awardAchievements() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    console.log('🏆 Awarding eligible achievements...\n');

    // Get user stats
    const [profile] = await connection.query('SELECT * FROM user_profiles WHERE user_id = 1');
    const [completedTasks] = await connection.query('SELECT COUNT(*) as count FROM user_daily_tasks WHERE user_id = 1');

    const userStats = {
      total_points: profile[0].total_points,
      days_sober: profile[0].days_sober,
      current_streak: profile[0].current_streak,
      tasks_completed: completedTasks[0].count,
    };

    console.log('📊 User Stats:', userStats);
    console.log('');

    // Get all achievements
    const [allAchievements] = await connection.query('SELECT * FROM achievements');
    
    // Get user's earned achievements
    const [userAchievements] = await connection.query('SELECT achievement_id FROM user_achievements WHERE user_id = 1');
    const earnedIds = new Set(userAchievements.map(ua => ua.achievement_id));

    let totalPointsAwarded = 0;
    const newAchievements = [];

    for (const achievement of allAchievements) {
      if (earnedIds.has(achievement.id)) {
        continue; // Already earned
      }

      let shouldEarn = false;
      switch (achievement.requirement_type) {
        case 'days_sober':
          shouldEarn = userStats.days_sober >= achievement.requirement_value;
          break;
        case 'streak':
          shouldEarn = userStats.current_streak >= achievement.requirement_value;
          break;
        case 'tasks_completed':
          shouldEarn = userStats.tasks_completed >= achievement.requirement_value;
          break;
        case 'points':
          shouldEarn = userStats.total_points >= achievement.requirement_value;
          break;
      }

      if (shouldEarn) {
        console.log(`✅ Awarding: ${achievement.achievement_name} (+${achievement.points_reward} points)`);
        
        // Award achievement
        await connection.query(
          'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
          [1, achievement.id]
        );
        
        newAchievements.push(achievement);
        totalPointsAwarded += achievement.points_reward;
      }
    }

    if (newAchievements.length > 0) {
      // Update user points
      const newTotalPoints = userStats.total_points + totalPointsAwarded;
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      await connection.query(
        'UPDATE user_profiles SET total_points = ?, updated_at = ? WHERE user_id = 1',
        [newTotalPoints, now]
      );

      console.log('');
      console.log(`🎉 Awarded ${newAchievements.length} achievements!`);
      console.log(`💰 Total points awarded: ${totalPointsAwarded}`);
      console.log(`📊 New total points: ${newTotalPoints}`);
    } else {
      console.log('ℹ️  No new achievements to award');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

awardAchievements();
