const mysql = require('mysql2/promise');
require('dotenv').config();

async function awardForAllUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    console.log('🏆 Awarding achievements for ALL users...\n');
    
    // Get all users
    const [users] = await connection.query('SELECT user_id, total_points FROM user_profiles');
    
    console.log(`Found ${users.length} users\n`);
    
    for (const profile of users) {
      const userId = profile.user_id;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Processing User ID: ${userId}`);
      console.log('='.repeat(60));
      
      // Get user stats
      const [completedTasks] = await connection.query(
        'SELECT COUNT(*) as count FROM user_daily_tasks WHERE user_id = ?',
        [userId]
      );
      
      const [drinkLogs] = await connection.query(
        'SELECT drink_count FROM drink_logs WHERE user_id = ? ORDER BY log_date DESC',
        [userId]
      );
      
      // Calculate streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toISOString().split('T')[0];
        
        const log = drinkLogs.find(l => {
          try {
            const logDateStr = l.log_date || l.date;
            if (!logDateStr) return false;
            const logDate = new Date(logDateStr);
            if (isNaN(logDate.getTime())) return false;
            return logDate.toISOString().split('T')[0] === dateString;
          } catch (e) {
            return false;
          }
        });
        
        if (!log || log.drink_count === 0) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      const daysSober = drinkLogs.filter(l => l.drink_count === 0).length;
      
      const userStats = {
        total_points: profile.total_points,
        days_sober: daysSober,
        current_streak: currentStreak,
        tasks_completed: completedTasks[0].count,
      };
      
      console.log('📊 User Stats:', userStats);
      
      // Get all achievements
      const [allAchievements] = await connection.query('SELECT * FROM achievements');
      
      // Get user's earned achievements
      const [userAchievements] = await connection.query(
        'SELECT achievement_id FROM user_achievements WHERE user_id = ?',
        [userId]
      );
      const earnedIds = new Set(userAchievements.map(ua => ua.achievement_id));
      
      console.log(`Already earned: ${earnedIds.size} achievements\n`);
      
      let totalPointsAwarded = 0;
      const newAchievements = [];
      
      // Check which achievements are eligible
      for (const achievement of allAchievements) {
        if (earnedIds.has(achievement.id)) continue;
        
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
          newAchievements.push(achievement);
          totalPointsAwarded += achievement.points_reward;
        }
      }
      
      if (newAchievements.length > 0) {
        console.log(`✅ Awarding ${newAchievements.length} achievements:\n`);
        
        for (const achievement of newAchievements) {
          console.log(`   ✅ ${achievement.achievement_name} (+${achievement.points_reward} pts)`);
          
          // Award achievement
          await connection.query(
            'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
            [userId, achievement.id]
          );
        }
        
        // Update user points
        const newTotalPoints = userStats.total_points + totalPointsAwarded;
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        await connection.query(
          'UPDATE user_profiles SET total_points = ?, updated_at = ? WHERE user_id = ?',
          [newTotalPoints, now, userId]
        );
        
        console.log(`\n💰 Total points awarded: ${totalPointsAwarded}`);
        console.log(`📊 New total points: ${newTotalPoints}`);
      } else {
        console.log('ℹ️  No new achievements to award');
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 ALL USERS PROCESSED!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await connection.end();
  }
}

awardForAllUsers();
