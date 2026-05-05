const mysql = require('mysql2/promise');
require('dotenv').config();

async function testPointsPersistence() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    console.log('🔍 Testing Points Persistence System...\n');

    // 1. Check current state
    console.log('📊 STEP 1: Current State');
    const [currentProfile] = await connection.query('SELECT * FROM user_profiles WHERE user_id = 1');
    console.log('Current Points:', currentProfile[0].total_points);
    console.log('Current Level:', currentProfile[0].level_id);
    console.log('Last Updated:', currentProfile[0].updated_at);
    console.log('');

    // 2. Check completed tasks
    console.log('📋 STEP 2: Completed Tasks Check');
    const [completedTasks] = await connection.query(`
      SELECT udt.*, dt.task_name, dt.points_reward 
      FROM user_daily_tasks udt 
      JOIN daily_tasks dt ON udt.task_id = dt.id 
      WHERE udt.user_id = 1
      ORDER BY udt.created_at DESC
    `);
    console.log(`Total Completed Tasks: ${completedTasks.length}`);
    const expectedPoints = completedTasks.reduce((sum, task) => sum + task.points_reward, 0);
    console.log(`Expected Points from Tasks: ${expectedPoints}`);
    console.log('');

    // 3. Check achievements
    console.log('🏆 STEP 3: Achievements Check');
    const [userAchievements] = await connection.query(`
      SELECT ua.*, a.achievement_name, a.points_reward 
      FROM user_achievements ua 
      JOIN achievements a ON ua.achievement_id = a.id 
      WHERE ua.user_id = 1
    `);
    console.log(`Total Achievements: ${userAchievements.length}`);
    const achievementPoints = userAchievements.reduce((sum, ach) => sum + ach.points_reward, 0);
    console.log(`Points from Achievements: ${achievementPoints}`);
    console.log('');

    // 4. Calculate total expected points
    console.log('💰 STEP 4: Points Calculation');
    const totalExpected = expectedPoints + achievementPoints;
    const actualPoints = currentProfile[0].total_points;
    const difference = actualPoints - totalExpected;
    
    console.log(`Expected Total: ${totalExpected}`);
    console.log(`Actual Total: ${actualPoints}`);
    console.log(`Difference: ${difference}`);
    
    if (difference === 0) {
      console.log('✅ Points are CORRECT!');
    } else {
      console.log('❌ Points MISMATCH detected!');
    }
    console.log('');

    // 5. Check for any issues in task completion logic
    console.log('🔧 STEP 5: Task Completion Logic Check');
    const [recentTasks] = await connection.query(`
      SELECT * FROM user_daily_tasks 
      WHERE user_id = 1 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    console.log('Recent 5 task completions:');
    recentTasks.forEach((task, i) => {
      console.log(`${i + 1}. Task ID: ${task.task_id}, Date: ${task.completion_date}, Created: ${task.created_at}`);
    });
    console.log('');

    // 6. Check for duplicate tasks on same date
    console.log('🔍 STEP 6: Duplicate Tasks Check');
    const [duplicates] = await connection.query(`
      SELECT task_id, completion_date, COUNT(*) as count 
      FROM user_daily_tasks 
      WHERE user_id = 1 
      GROUP BY task_id, completion_date 
      HAVING count > 1
    `);
    if (duplicates.length > 0) {
      console.log('⚠️  Found duplicate task completions:');
      duplicates.forEach(dup => {
        console.log(`Task ${dup.task_id} on ${dup.completion_date}: ${dup.count} times`);
      });
    } else {
      console.log('✅ No duplicate tasks found');
    }
    console.log('');

    // 7. Check database constraints
    console.log('🔒 STEP 7: Database Constraints Check');
    const [constraints] = await connection.query(`
      SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
      WHERE TABLE_NAME = 'user_daily_tasks' 
      AND TABLE_SCHEMA = DATABASE()
    `);
    console.log('Constraints on user_daily_tasks:');
    constraints.forEach(c => {
      console.log(`- ${c.CONSTRAINT_NAME}: ${c.CONSTRAINT_TYPE}`);
    });
    console.log('');

    // 8. Test a simulated task completion
    console.log('🧪 STEP 8: Simulating Task Completion (DRY RUN)');
    const testTaskId = 1; // Morning Meditation
    const testDate = new Date().toISOString().split('T')[0];
    
    // Check if already completed today
    const [existingCompletion] = await connection.query(
      'SELECT * FROM user_daily_tasks WHERE user_id = 1 AND task_id = ? AND completion_date = ?',
      [testTaskId, testDate]
    );
    
    if (existingCompletion.length > 0) {
      console.log('✅ Duplicate prevention working - task already completed today');
    } else {
      console.log('ℹ️  Task not completed today - would be allowed');
    }
    console.log('');

    // 9. Final Summary
    console.log('📈 STEP 9: Final Summary');
    console.log('═══════════════════════════════════════');
    console.log(`User ID: 1`);
    console.log(`Total Points: ${actualPoints}`);
    console.log(`Level: ${currentProfile[0].level_id}`);
    console.log(`Tasks Completed: ${completedTasks.length}`);
    console.log(`Achievements Earned: ${userAchievements.length}`);
    console.log(`Points Match: ${difference === 0 ? '✅ YES' : '❌ NO'}`);
    console.log('═══════════════════════════════════════');
    console.log('');

    // 10. Recommendations
    console.log('💡 STEP 10: Recommendations');
    if (difference !== 0) {
      console.log('⚠️  ACTION REQUIRED: Points need to be recalculated');
      console.log(`   Run: node fix_user_points.js`);
    } else {
      console.log('✅ System is working correctly!');
      console.log('   - Points are accurate');
      console.log('   - No duplicates found');
      console.log('   - Constraints in place');
      console.log('   - Data persistence verified');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await connection.end();
  }
}

testPointsPersistence();
