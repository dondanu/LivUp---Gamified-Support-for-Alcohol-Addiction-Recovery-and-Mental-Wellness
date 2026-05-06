const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function testLogin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('✅ Connected to database');

  const testEmail = 'test_new_email@gmail.com';
  const testPassword = '111111';

  // Try to find user by email (like login does)
  console.log(`\n🔍 Looking for user with email: ${testEmail}`);
  const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [testEmail]);
  
  if (users.length === 0) {
    console.log('❌ User not found by email');
    await connection.end();
    return;
  }

  const user = users[0];
  console.log('✅ User found:', { id: user.id, username: user.username, email: user.email });

  // Check password
  console.log(`\n🔐 Checking password...`);
  const isValid = await bcrypt.compare(testPassword, user.password_hash);
  console.log(isValid ? '✅ Password is correct' : '❌ Password is incorrect');

  await connection.end();
  console.log('\n✅ Test complete');
}

testLogin().catch(console.error);
