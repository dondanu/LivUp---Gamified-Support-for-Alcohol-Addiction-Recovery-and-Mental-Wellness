const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkEmail() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('✅ Connected to database\n');

  // Check user with username 'bbb'
  const [users] = await connection.query('SELECT id, username, email FROM users WHERE username = ?', ['bbb']);
  console.log('📋 User with username "bbb":');
  console.log(users[0]);

  // Check if vv2@gmail.com exists
  const [vv2Users] = await connection.query('SELECT id, username, email FROM users WHERE email = ?', ['vv2@gmail.com']);
  console.log('\n📋 User with email "vv2@gmail.com":');
  console.log(vv2Users[0] || 'Not found');

  await connection.end();
}

checkEmail().catch(console.error);
