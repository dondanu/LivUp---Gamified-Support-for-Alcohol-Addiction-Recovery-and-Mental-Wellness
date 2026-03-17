const mysql = require('mysql2/promise');
require('dotenv').config();

async function testAPIResponse() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    console.log('🔍 Testing API Response Format...\n');

    // Simulate what the API does - get drink logs for user 2
    const userId = 2;
    const today = '2026-03-11';

    console.log(`📅 Looking for logs for User ID: ${userId}, Date: ${today}\n`);

    // Get all drink logs (what getDrinkLogs API returns)
    const [drinkLogs] = await connection.execute(
      'SELECT * FROM drink_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 30',
      [userId],
    );

    console.log('🍺 DRINK LOGS FROM API:');
    console.log(`Total logs: ${drinkLogs.length}`);
    drinkLogs.forEach((log, index) => {
      console.log(`\nLog ${index + 1}:`);
      console.log(`  - ID: ${log.id}`);
      console.log(`  - User ID: ${log.user_id}`);
      console.log(`  - Drink Count: ${log.drink_count}`);
      console.log(`  - log_date (raw): ${log.log_date}`);
      console.log(`  - log_date (ISO): ${new Date(log.log_date).toISOString()}`);
      console.log(`  - log_date (split): ${new Date(log.log_date).toISOString().split('T')[0]}`);
      console.log(`  - Notes: ${log.notes || 'none'}`);
      console.log(`  - Created: ${log.created_at}`);
    });

    // Get mood logs
    const [moodLogs] = await connection.execute(
      'SELECT * FROM mood_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 30',
      [userId],
    );

    console.log('\n\n😊 MOOD LOGS FROM API:');
    console.log(`Total logs: ${moodLogs.length}`);
    moodLogs.forEach((log, index) => {
      console.log(`\nLog ${index + 1}:`);
      console.log(`  - ID: ${log.id}`);
      console.log(`  - User ID: ${log.user_id}`);
      console.log(`  - Mood Type: ${log.mood_type}`);
      console.log(`  - log_date (raw): ${log.log_date}`);
      console.log(`  - log_date (ISO): ${new Date(log.log_date).toISOString()}`);
      console.log(`  - log_date (split): ${new Date(log.log_date).toISOString().split('T')[0]}`);
    });

    // Get trigger logs
    const [triggerLogs] = await connection.execute(
      'SELECT * FROM trigger_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 30',
      [userId],
    );

    console.log('\n\n🎯 TRIGGER LOGS FROM API:');
    console.log(`Total logs: ${triggerLogs.length}`);
    triggerLogs.forEach((log, index) => {
      console.log(`\nLog ${index + 1}:`);
      console.log(`  - ID: ${log.id}`);
      console.log(`  - User ID: ${log.user_id}`);
      console.log(`  - Trigger Type: ${log.trigger_type}`);
      console.log(`  - log_date (raw): ${log.log_date}`);
      console.log(`  - log_date (ISO): ${new Date(log.log_date).toISOString()}`);
      console.log(`  - log_date (split): ${new Date(log.log_date).toISOString().split('T')[0]}`);
    });

    console.log('\n\n🔍 DATE COMPARISON TEST:');
    console.log(`Selected Date (from frontend): "${today}"`);
    console.log(`Log Date (from DB, split): "${new Date(drinkLogs[0].log_date).toISOString().split('T')[0]}"`);
    console.log(`Are they equal? ${today === new Date(drinkLogs[0].log_date).toISOString().split('T')[0]}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

testAPIResponse();
