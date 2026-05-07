const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixStreak() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    console.log('🔧 Fixing streak for user danu...\n');

    // Get user
    const [users] = await connection.query('SELECT * FROM users WHERE username = "danu"');
    const userId = users[0].id;

    // Get all unique completion dates
    const [dates] = await connection.query(
      'SELECT DISTINCT completion_date FROM user_daily_tasks WHERE user_id = ? ORDER BY completion_date DESC',
      [userId]
    );

    console.log('📅 Completion dates:');
    dates.forEach((d, i) => {
      const date = new Date(d.completion_date);
      console.log(`${i + 1}. ${date.toISOString().split('T')[0]}`);
    });

    // Calculate streak
    let currentStreak = 0;
    if (dates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      const sortedDates = dates.map(d => new Date(d.completion_date).toISOString().split('T')[0]).sort((a, b) => new Date(b) - new Date(a));
      
      console.log('\n📊 Sorted dates:', sortedDates);
      console.log('Today:', today);
      console.log('Yesterday:', yesterday);
      console.log('Latest completion:', sortedDates[0]);
      
      // Check if user has activity today or yesterday
      if (sortedDates[0] === today || sortedDates[0] === yesterday) {
        currentStreak = 1;
        
        // Count consecutive days
        for (let i = 1; i < sortedDates.length; i++) {
          const currentDate = new Date(sortedDates[i - 1]);
          const prevDate = new Date(sortedDates[i]);
          const dayDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
          
          console.log(`\nComparing ${sortedDates[i - 1]} and ${sortedDates[i]}: ${dayDiff} days apart`);
          
          if (dayDiff === 1) {
            currentStreak++;
            console.log(`✓ Consecutive! Streak = ${currentStreak}`);
          } else {
            console.log(`✗ Gap found! Stopping at streak = ${currentStreak}`);
            break;
          }
        }
      } else {
        console.log('\n✗ No activity today or yesterday - streak = 0');
      }
    }

    console.log(`\n🔥 Calculated Streak: ${currentStreak}`);

    // Update database
    await connection.query(
      'UPDATE user_profiles SET current_streak = ?, longest_streak = ? WHERE user_id = ?',
      [currentStreak, currentStreak, userId]
    );

    console.log('\n✅ Database updated!');
    console.log(`   Current Streak: ${currentStreak}`);
    console.log(`   Longest Streak: ${currentStreak}`);

    // Verify
    const [profile] = await connection.query('SELECT current_streak, longest_streak FROM user_profiles WHERE user_id = ?', [userId]);
    console.log('\n✓ Verified in database:');
    console.log(`   Current Streak: ${profile[0].current_streak}`);
    console.log(`   Longest Streak: ${profile[0].longest_streak}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixStreak();
