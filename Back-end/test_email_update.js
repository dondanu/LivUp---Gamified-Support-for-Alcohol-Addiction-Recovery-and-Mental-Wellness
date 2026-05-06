const mysql = require('mysql2/promise');
require('dotenv').config();

async function testEmailUpdate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('✅ Connected to database');

  // Check current user
  const [users] = await connection.query('SELECT id, username, email FROM users WHERE username = ?', ['bbb']);
  console.log('\n📋 Current user data:');
  console.log(users[0]);

  // Try to update email
  const newEmail = 'test_new_email@gmail.com';
  console.log(`\n🔄 Updating email to: ${newEmail}`);
  
  const [result] = await connection.query('UPDATE users SET email = ? WHERE username = ?', [newEmail, 'bbb']);
  console.log('Update result:', result);

  // Check after update
  const [usersAfter] = await connection.query('SELECT id, username, email FROM users WHERE username = ?', ['bbb']);
  console.log('\n📋 User data after update:');
  console.log(usersAfter[0]);

  // Try to find by new email
  const [userByEmail] = await connection.query('SELECT id, username, email FROM users WHERE email = ?', [newEmail]);
  console.log('\n🔍 Finding user by new email:');
  console.log(userByEmail[0]);

  await connection.end();
  console.log('\n✅ Test complete');
}

testEmailUpdate().catch(console.error);
