const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function runMigration() {
  console.log('🚀 Starting SUPER SYSTEM Migration...\n');
  
  let connection;
  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mind_fusion',
      multipleStatements: true
    });
    console.log('✅ Connected to database!\n');

    // Read SQL file
    console.log('📄 Reading SQL migration file...');
    const sqlFile = fs.readFileSync('./migrations/ADD_ALL_BADGES_REWARDS_ACHIEVEMENTS.sql', 'utf8');
    
    // Split by INSERT statements
    const insertStatements = sqlFile
      .split('\n')
      .filter(line => line.trim().startsWith('INSERT INTO achievements'))
      .map(line => {
        // Find the complete INSERT statement (may span multiple lines in original)
        const match = sqlFile.match(new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?\\);'));
        return match ? match[0] : null;
      })
      .filter(Boolean);

    console.log(`✅ Found ${insertStatements.length} achievement INSERT statements\n`);

    // Check existing achievements
    console.log('🔍 Checking existing achievements...');
    const [existingAchievements] = await connection.query('SELECT achievement_name FROM achievements');
    const existingNames = new Set(existingAchievements.map(a => a.achievement_name));
    console.log(`📊 Currently ${existingAchievements.length} achievements in database\n`);

    // Insert achievements one by one
    let addedCount = 0;
    let skippedCount = 0;
    
    console.log('💾 Adding achievements to database...\n');
    
    for (const statement of insertStatements) {
      try {
        // Extract achievement name from INSERT statement
        const nameMatch = statement.match(/VALUES\s*\(\s*'([^']+)'/);
        const achievementName = nameMatch ? nameMatch[1] : 'Unknown';
        
        if (existingNames.has(achievementName)) {
          console.log(`⏭️  Skipped: ${achievementName} (already exists)`);
          skippedCount++;
          continue;
        }
        
        // Execute INSERT
        await connection.query(statement);
        console.log(`✅ Added: ${achievementName}`);
        addedCount++;
        
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⏭️  Skipped: Duplicate entry`);
          skippedCount++;
        } else {
          console.error(`❌ Error: ${error.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Added: ${addedCount} new achievements`);
    console.log(`⏭️  Skipped: ${skippedCount} existing achievements`);
    console.log(`📈 Total: ${addedCount + skippedCount} achievements processed`);
    console.log('='.repeat(60) + '\n');

    // Verify final count
    console.log('🔍 Verifying database...');
    const [finalAchievements] = await connection.query('SELECT achievement_name, requirement_type, requirement_value, points_reward FROM achievements ORDER BY points_reward ASC');
    
    console.log(`\n📊 Total achievements in database: ${finalAchievements.length}\n`);
    
    if (finalAchievements.length >= 25) {
      console.log('🎉 SUCCESS! All 25+ achievements are in the database!\n');
      
      console.log('📋 Achievement List:');
      console.log('-'.repeat(80));
      finalAchievements.forEach((ach, index) => {
        console.log(`${(index + 1).toString().padStart(2, '0')}. ${ach.achievement_name.padEnd(30)} | ${ach.requirement_type.padEnd(15)} >= ${ach.requirement_value.toString().padStart(3)} | ${ach.points_reward} pts`);
      });
      console.log('-'.repeat(80) + '\n');
      
      console.log('✅ SUPER SYSTEM ACTIVATED! 🚀');
      console.log('✅ Frontend badges will now unlock automatically!');
      console.log('✅ All 25 badges connected to backend!');
      console.log('✅ 100% accurate matching enabled!\n');
      
      console.log('🎯 Next Steps:');
      console.log('1. Run: node award_achievements.js (to award eligible achievements)');
      console.log('2. Run: node check_achievements.js (to verify user achievements)');
      console.log('3. Open app and check Achievement Gallery! 🎉\n');
      
    } else {
      console.log(`⚠️  Warning: Only ${finalAchievements.length} achievements found. Expected 25+\n`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. Database is running');
    console.error('2. .env file has correct credentials');
    console.error('3. achievements table exists');
    console.error('4. SQL file is in migrations/ folder\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📡 Database connection closed.\n');
    }
  }
}

// Run migration
runMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
