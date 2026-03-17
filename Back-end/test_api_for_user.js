const mysql = require('mysql2/promise');
require('dotenv').config();

async function testAPIForUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    console.log('🔍 Testing API for user "www"...\n');

    // Get user ID for username "www"
    const [users] = await connection.execute('SELECT id, username, email FROM users WHERE username = ?', ['www']);

    if (users.length === 0) {
      console.log('❌ User "www" not found!');
      return;
    }

    const userId = users[0].id;
    console.log(`✅ Found user: ID=${userId}, Username=${users[0].username}, Email=${users[0].email}\n`);

    // Simulate getDrinkLogs API call (default limit 30)
    const limit = 30;
    const [drinkLogs] = await connection.execute(
      'SELECT * FROM drink_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 30',
      [userId]
    );

    console.log(`🍺 DRINK LOGS (limit ${limit}):`);
    console.log(`Total: ${drinkLogs.length}`);
    drinkLogs.forEach((log, index) => {
      console.log(`\n  Log ${index + 1}:`);
      console.log(`    ID: ${log.id}`);
      console.log(`    Drink Count: ${log.drink_count}`);
      console.log(`    Date: ${log.log_date}`);
      console.log(`    Notes: ${log.notes || 'none'}`);
    });

    // Simulate getMoodLogs API call
    const [moodLogs] = await connection.execute(
      'SELECT * FROM mood_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 30',
      [userId]
    );

    console.log(`\n\n😊 MOOD LOGS (limit ${limit}):`);
    console.log(`Total: ${moodLogs.length}`);
    moodLogs.forEach((log, index) => {
      console.log(`\n  Log ${index + 1}:`);
      console.log(`    ID: ${log.id}`);
      console.log(`    Mood: ${log.mood_type}`);
      console.log(`    Date: ${log.log_date}`);
    });

    // Simulate getTriggerLogs API call
    const [triggerLogs] = await connection.execute(
      'SELECT * FROM trigger_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 30',
      [userId]
    );

    console.log(`\n\n🎯 TRIGGER LOGS (limit ${limit}):`);
    console.log(`Total: ${triggerLogs.length}`);
    triggerLogs.forEach((log, index) => {
      console.log(`\n  Log ${index + 1}:`);
      console.log(`    ID: ${log.id}`);
      console.log(`    Trigger: ${log.trigger_type}`);
      console.log(`    Date: ${log.log_date}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

testAPIForUser();
