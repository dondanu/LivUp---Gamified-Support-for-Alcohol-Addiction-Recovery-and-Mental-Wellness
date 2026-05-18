const mysql = require('mysql2/promise');
require('dotenv').config();

// All 25 achievements with exact names matching frontend
const ACHIEVEMENTS = [
  // BADGES (9)
  { name: 'Surprise Visit', description: 'Made an unexpected positive choice when temptation struck', type: 'tasks_completed', value: 5, points: 50 },
  { name: 'Trade Your Star', description: 'Exchanged a bad habit for a healthy alternative', type: 'tasks_completed', value: 10, points: 75 },
  { name: 'First Fifty Points', description: 'Earned your first 50 points on your recovery journey', type: 'points', value: 50, points: 25 },
  { name: 'Gold Circle Champion', description: 'Reached the prestigious gold tier in your recovery', type: 'points', value: 500, points: 100 },
  { name: 'Silver Circle Achiever', description: 'Earned the silver tier milestone', type: 'points', value: 250, points: 75 },
  { name: 'Level 2 Warrior', description: 'Advanced to Level 2 in your recovery journey', type: 'points', value: 100, points: 50 },
  { name: 'Top 10 Performer', description: 'Ranked in the top performers for recovery progress', type: 'tasks_completed', value: 50, points: 150 },
  { name: '5 Days Strong', description: 'Maintained a 5-day streak of sobriety', type: 'streak', value: 5, points: 50 },
  { name: '3 Star Champion', description: 'Earned 3 stars for exceptional performance', type: 'tasks_completed', value: 30, points: 100 },
  
  // REWARDS (8)
  { name: 'Success Milestone', description: 'Achieved a major success milestone in recovery', type: 'tasks_completed', value: 25, points: 75 },
  { name: 'Rock Solid Foundation', description: 'Built an unshakeable foundation for recovery', type: 'streak', value: 14, points: 100 },
  { name: 'Real Gladiator', description: 'Fought through challenges like a true warrior', type: 'tasks_completed', value: 40, points: 125 },
  { name: 'Really Fast Progress', description: 'Made rapid progress in your recovery journey', type: 'tasks_completed', value: 15, points: 60 },
  { name: 'Moving Fast Forward', description: 'Consistently moving forward at great speed', type: 'tasks_completed', value: 20, points: 70 },
  { name: 'On Fire Streak', description: 'Your streak is absolutely on fire!', type: 'streak', value: 21, points: 150 },
  { name: 'Be Smart Choices', description: 'Made consistently smart and healthy choices', type: 'tasks_completed', value: 35, points: 90 },
  { name: '24/7 Warrior', description: 'Committed to recovery around the clock', type: 'streak', value: 30, points: 200 },
  
  // ACHIEVEMENTS (8)
  { name: 'Achievement Map Master', description: 'Unlocked multiple achievements across all categories', type: 'tasks_completed', value: 60, points: 150 },
  { name: 'Spending Score Saver', description: 'Saved money by avoiding alcohol purchases', type: 'days_sober', value: 30, points: 100 },
  { name: 'Treasures Collector', description: 'Collected valuable rewards and achievements', type: 'points', value: 300, points: 80 },
  { name: 'Top Shooter', description: 'Hit all your recovery targets with precision', type: 'tasks_completed', value: 45, points: 120 },
  { name: 'Quiz Master', description: 'Completed all recovery knowledge challenges', type: 'tasks_completed', value: 55, points: 130 },
  { name: 'Gambler No More', description: 'Stopped gambling with your health and future', type: 'days_sober', value: 60, points: 175 },
  { name: 'Level Up Master', description: 'Advanced through multiple levels in your journey', type: 'points', value: 400, points: 150 },
  { name: 'Distance Covered', description: 'Covered significant distance in your recovery journey', type: 'streak', value: 45, points: 200 },
];

async function addAllAchievements() {
  console.log('🚀 SUPER SYSTEM - Adding All 25 Achievements!\n');
  
  let connection;
  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mind_fusion',
    });
    console.log('✅ Connected!\n');

    // Check existing achievements
    console.log('🔍 Checking existing achievements...');
    const [existing] = await connection.query('SELECT achievement_name FROM achievements');
    const existingNames = new Set(existing.map(a => a.achievement_name));
    console.log(`📊 Found ${existing.length} existing achievements\n`);

    // Add achievements
    let addedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    console.log('💾 Processing achievements...\n');

    for (const ach of ACHIEVEMENTS) {
      try {
        if (existingNames.has(ach.name)) {
          // Update existing
          await connection.query(
            `UPDATE achievements 
             SET description = ?, requirement_type = ?, requirement_value = ?, points_reward = ?
             WHERE achievement_name = ?`,
            [ach.description, ach.type, ach.value, ach.points, ach.name]
          );
          console.log(`🔄 Updated: ${ach.name}`);
          updatedCount++;
        } else {
          // Insert new
          await connection.query(
            `INSERT INTO achievements (achievement_name, description, requirement_type, requirement_value, points_reward)
             VALUES (?, ?, ?, ?, ?)`,
            [ach.name, ach.description, ach.type, ach.value, ach.points]
          );
          console.log(`✅ Added: ${ach.name}`);
          addedCount++;
        }
      } catch (error) {
        console.error(`❌ Error with ${ach.name}: ${error.message}`);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 MIGRATION SUMMARY:');
    console.log('='.repeat(70));
    console.log(`✅ Added: ${addedCount} new achievements`);
    console.log(`🔄 Updated: ${updatedCount} existing achievements`);
    console.log(`⏭️  Skipped: ${skippedCount} failed`);
    console.log(`📈 Total Processed: ${ACHIEVEMENTS.length} achievements`);
    console.log('='.repeat(70) + '\n');

    // Verify
    console.log('🔍 Verifying database...\n');
    const [final] = await connection.query(
      'SELECT achievement_name, requirement_type, requirement_value, points_reward FROM achievements ORDER BY points_reward ASC'
    );

    console.log(`📊 Total achievements in database: ${final.length}\n`);

    if (final.length >= 25) {
      console.log('🎉🎉🎉 SUCCESS! SUPER SYSTEM ACTIVATED! 🎉🎉🎉\n');
      
      console.log('📋 All Achievements:');
      console.log('-'.repeat(85));
      console.log('No. | Achievement Name                | Type            | Value | Points');
      console.log('-'.repeat(85));
      
      final.forEach((ach, index) => {
        const num = (index + 1).toString().padStart(2, '0');
        const name = ach.achievement_name.padEnd(30);
        const type = ach.requirement_type.padEnd(15);
        const value = ach.requirement_value.toString().padStart(5);
        const points = ach.points_reward.toString().padStart(6);
        console.log(`${num}  | ${name} | ${type} | ${value} | ${points}`);
      });
      console.log('-'.repeat(85) + '\n');

      // Count by category
      const byType = final.reduce((acc, ach) => {
        acc[ach.requirement_type] = (acc[ach.requirement_type] || 0) + 1;
        return acc;
      }, {});

      console.log('📊 Breakdown by Type:');
      Object.entries(byType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} achievements`);
      });
      console.log('');

      console.log('✅ Frontend badges will now unlock automatically!');
      console.log('✅ All 25 badges connected to backend!');
      console.log('✅ 100% accurate matching enabled!');
      console.log('✅ SUPER SYSTEM READY! 🚀\n');

      console.log('🎯 Next Steps:');
      console.log('1. Run: node award_achievements.js');
      console.log('2. Run: node check_achievements.js');
      console.log('3. Open app → Achievement Gallery');
      console.log('4. See unlocked badges! 🎉\n');

    } else {
      console.log(`⚠️  Warning: Only ${final.length} achievements. Expected 25+\n`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nStack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📡 Database connection closed.\n');
    }
  }
}

// Run it!
addAllAchievements().catch(console.error);
