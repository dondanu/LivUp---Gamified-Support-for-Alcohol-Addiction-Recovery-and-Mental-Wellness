// Quick script to manually set avatar to 'boy' for user
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAvatar() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sobriety_app',
  });

  try {
    console.log('Connected to database');

    // Update avatar_type to 'boy' for user with id = 1 (danu)
    const [result] = await connection.query(
      'UPDATE user_profiles SET avatar_type = ? WHERE user_id = ?',
      ['boy', 1]
    );

    console.log('✅ Avatar updated to "boy"');
    console.log('Rows affected:', result.affectedRows);

    // Verify the update
    const [profile] = await connection.query(
      'SELECT user_id, avatar_type, level_id, total_points FROM user_profiles WHERE user_id = ?',
      [1]
    );

    console.log('\nCurrent profile:', profile[0]);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
    console.log('\nDatabase connection closed');
  }
}

fixAvatar();
