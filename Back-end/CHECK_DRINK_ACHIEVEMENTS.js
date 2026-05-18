const { query } = require('./src/config/database');

(async () => {
  try {
    console.log('Checking drink log-based achievements...\n');
    
    // Get all drink log-based achievements
    const { data: achievements } = await query(
      `SELECT achievement_name, requirement_type, requirement_value, points_reward 
       FROM achievements 
       WHERE requirement_type IN ('days_sober', 'streak') 
       ORDER BY requirement_value`
    );
    
    console.log('=== DRINK LOG-BASED ACHIEVEMENTS ===\n');
    
    if (achievements && achievements.length > 0) {
      achievements.forEach(ach => {
        console.log(`✓ ${ach.achievement_name}`);
        console.log(`  Type: ${ach.requirement_type}`);
        console.log(`  Required: ${ach.requirement_value} ${ach.requirement_type === 'streak' ? 'consecutive days' : 'total days'}`);
        console.log(`  Points: ${ach.points_reward}`);
        console.log('');
      });
      
      console.log(`Total: ${achievements.length} drink log-based achievements\n`);
    } else {
      console.log('❌ No drink log-based achievements found!\n');
    }
    
    // Check if user has any drink logs
    const { data: userLogs } = await query(
      'SELECT user_id, COUNT(*) as log_count FROM drink_logs GROUP BY user_id'
    );
    
    console.log('=== USERS WITH DRINK LOGS ===\n');
    if (userLogs && userLogs.length > 0) {
      userLogs.forEach(log => {
        console.log(`User ${log.user_id}: ${log.log_count} drink logs`);
      });
    } else {
      console.log('❌ No users have drink logs yet!\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
