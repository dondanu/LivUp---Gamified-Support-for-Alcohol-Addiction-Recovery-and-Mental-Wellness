const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixStreakCorrect() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    console.log('🔧 Fixing streak with correct date parsing...\n');

    // Get unique completion dates using DATE() function
    const [dates] = await connection.query(
      `SELECT DISTINCT DATE(completion_date) as date 
       FROM user_daily_tasks 
       WHERE user_id = 1 
       ORDER BY date DESC`
    );

    console.log('📅 Unique completion dates:');
    const sortedDates = dates.map(d => {
      const dateObj = new Date(d.date);
      const formatted = dateObj.toISOString().split('T')[0];
      console.log(`   ${formatted}`);
      return formatted;
    });

    // Calculate streak
    let currentStreak = 0;
    if (sortedDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      console.log(`\n📊 Today: ${today}`);
      console.log(`   Yesterday: ${yesterday}`);
      console.log(`   Latest completion: ${sortedDates[0]}`);
      
      // Check if user has activity today or yesterday
      if (sortedDates[0] === today || sortedDates[0] === yesterday) {
        currentStreak = 1;
        console.log(`\n✓ Activity found! Starting streak count...`);
        
        // Count consecutive days
        for (let i = 1; i < sortedDates.length; i++) {
          const currentDate = new Date(sortedDates[i - 1]);
          const prevDate = new Date(sortedDates[i]);
          const dayDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
          
          console.log(`   Comparing ${sortedDates[i - 1]} and ${sortedDates[i]}: ${dayDiff} days apart`);
          
          if (dayDiff === 1) {
            currentStreak++;
            console.log(`   ✓ Consecutive! Streak = ${currentStreak}`);
          } else {
            console.log(`   ✗ Gap of ${dayDiff} days! Stopping at streak = ${currentStreak}`);
            break;
          }
        }
      } else {
        console.log(`\n✗ No activity today or yesterday - streak = 0`);
      }
    }

    console.log(`\n🔥 Final Calculated Streak: ${currentStreak}`);

    // Get current longest streak
    const [profile] = await connection.query(
      'SELECT longest_streak FROM user_profiles WHERE user_id = 1'
    );
    const longestStreak = Math.max(currentStreak, profile[0].longest_streak || 0);

    // Update database
    await connection.query(
      'UPDATE user_profiles SET current_streak = ?, longest_streak = ? WHERE user_id = 1',
      [currentStreak, longestStreak]
    );

    console.log('\n✅ Database updated!');
    console.log(`   Current Streak: ${currentStreak}`);
    console.log(`   Longest Streak: ${longestStreak}`);

    // Verify
    const [updated] = await connection.query(
      'SELECT current_streak, longest_streak FROM user_profiles WHERE user_id = 1'
    );
    console.log('\n✓ Verified in database:');
    console.log(`   Current Streak: ${updated[0].current_streak}`);
    console.log(`   Longest Streak: ${updated[0].longest_streak}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await connection.end();
  }
}

fixStreakCorrect();
