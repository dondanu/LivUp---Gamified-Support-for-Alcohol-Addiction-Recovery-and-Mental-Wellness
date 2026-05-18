const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAllUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    console.log('👥 Checking all users...\n');
    
    const [users] = await connection.query('SELECT id, username, total_points FROM user_profiles ORDER BY id');
    
    console.log('Users in database:');
    console.log('-'.repeat(60));
    users.forEach(u => {
      console.log(`ID: ${u.id.toString().padStart(3)} | Username: ${u.username.padEnd(20)} | Points: ${u.total_points}`);
    });
    console.log('-'.repeat(60));
    console.log(`Total users: ${users.length}\n`);
    
    // Check achievements for each user
    for (const user of users) {
      const [achievements] = await connection.query(
        'SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ?',
        [user.id]
      );
      console.log(`User ${user.id} (${user.username}): ${achievements[0].count} achievements`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkAllUsers();
