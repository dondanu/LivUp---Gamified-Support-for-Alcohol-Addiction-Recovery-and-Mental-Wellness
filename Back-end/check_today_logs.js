const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTodayLogs() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    console.log('🔍 Checking today\'s logs in database...\n');

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Today's date: ${today}\n`);

    // Check drink logs
    console.log('🍺 DRINK LOGS:');
    const [drinkLogs] = await connection.execute(
      'SELECT * FROM drink_logs WHERE DATE(log_date) = ? ORDER BY log_date DESC',
      [today],
    );
    console.log(`Found ${drinkLogs.length} drink logs for today:`);
    drinkLogs.forEach(log => {
      console.log(`  - User ID: ${log.user_id}, Drink Count: ${log.drink_count}, Date: ${log.log_date}, Notes: ${log.notes || 'none'}`);
    });
    console.log('');

    // Check mood logs
    console.log('😊 MOOD LOGS:');
    const [moodLogs] = await connection.execute(
      'SELECT * FROM mood_logs WHERE DATE(log_date) = ? ORDER BY log_date DESC',
      [today],
    );
    console.log(`Found ${moodLogs.length} mood logs for today:`);
    moodLogs.forEach(log => {
      console.log(`  - User ID: ${log.user_id}, Mood: ${log.mood_type}, Score: ${log.mood_score}, Date: ${log.log_date}, Notes: ${log.notes || 'none'}`);
    });
    console.log('');

    // Check trigger logs
    console.log('🎯 TRIGGER LOGS:');
    const [triggerLogs] = await connection.execute(
      'SELECT * FROM trigger_logs WHERE DATE(log_date) = ? ORDER BY log_date DESC',
      [today],
    );
    console.log(`Found ${triggerLogs.length} trigger logs for today:`);
    triggerLogs.forEach(log => {
      console.log(`  - User ID: ${log.user_id}, Trigger: ${log.trigger_type}, Intensity: ${log.intensity}, Date: ${log.log_date}, Notes: ${log.notes || 'none'}`);
    });
    console.log('');

    // Check all drink logs (last 7 days)
    console.log('📊 ALL DRINK LOGS (Last 7 days):');
    const [allDrinkLogs] = await connection.execute(
      'SELECT * FROM drink_logs WHERE log_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY log_date DESC',
    );
    console.log(`Found ${allDrinkLogs.length} drink logs in last 7 days:`);
    allDrinkLogs.forEach(log => {
      console.log(`  - User ID: ${log.user_id}, Drink Count: ${log.drink_count}, Date: ${log.log_date}`);
    });
    console.log('');

    // Check users
    console.log('👤 USERS:');
    const [users] = await connection.execute(
      'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5',
    );
    console.log(`Found ${users.length} recent users:`);
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Created: ${user.created_at}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

checkTodayLogs();
