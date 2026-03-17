const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mind_fusion',
  });

  try {
    console.log('🔍 Checking conversion_prompts table...\n');

    // Check if table exists
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'conversion_prompts'
    `);

    if (tables.length === 0) {
      console.log('❌ Table conversion_prompts does NOT exist!');
      return;
    }

    console.log('✅ Table conversion_prompts exists!\n');

    // Get table structure
    const [columns] = await connection.query('DESCRIBE conversion_prompts');

    console.log('📋 Table Structure:');
    console.log('-------------------');
    columns.forEach((col) => {
      console.log(
        `${col.Field.padEnd(20)} | ${col.Type.padEnd(20)} | ${col.Null} | ${col.Key} | ${col.Default || 'NULL'}`
      );
    });

    console.log('\n✅ Conversion feature database setup complete!');
    console.log('🎉 Ready to test anonymous to registered user conversion!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

verifyTable();
