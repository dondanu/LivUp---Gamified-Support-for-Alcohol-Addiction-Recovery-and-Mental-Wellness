// Script to remove duplicate challenges from database
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mind_fusion',
};

async function removeDuplicates() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check for duplicates
    const [duplicates] = await connection.query(`
      SELECT task_name, COUNT(*) as count 
      FROM daily_tasks 
      GROUP BY task_name 
      HAVING count > 1
    `);
    
    console.log(`📊 Found ${duplicates.length} challenges with duplicates`);
    
    if (duplicates.length > 0) {
      console.log('\nDuplicates found:');
      duplicates.forEach((dup: any) => {
        console.log(`  - ${dup.task_name}: ${dup.count} copies`);
      });
      
      // Remove duplicates, keeping the one with the lowest ID (first inserted)
      const [result] = await connection.query(`
        DELETE t1 FROM daily_tasks t1
        INNER JOIN daily_tasks t2 
        WHERE t1.id > t2.id 
        AND t1.task_name = t2.task_name
      `);
      
      console.log(`\n✅ Removed ${result.affectedRows} duplicate challenges`);
    } else {
      console.log('✅ No duplicates found!');
    }

    // Verify final count
    const [total] = await connection.query('SELECT COUNT(*) as count FROM daily_tasks');
    const [unique] = await connection.query('SELECT COUNT(DISTINCT task_name) as count FROM daily_tasks');
    
    console.log(`\n📊 Final counts:`);
    console.log(`   Total challenges: ${total[0].count}`);
    console.log(`   Unique challenges: ${unique[0].count}`);
    
    if (total[0].count === unique[0].count && total[0].count === 25) {
      console.log('\n✅ Perfect! All 25 unique challenges are in the database.');
    } else if (total[0].count > 25) {
      console.log(`\n⚠️  Warning: There are ${total[0].count} challenges, but should be 25.`);
      console.log('   Some challenges may still be duplicated or extra challenges exist.');
    } else {
      console.log(`\n⚠️  Warning: Only ${total[0].count} challenges found. Should be 25.`);
      console.log('   Run the QUICK_FIX_CHALLENGES.js script to insert missing challenges.');
    }

    await connection.end();
    console.log('\n✅ Done! Restart your backend server.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

removeDuplicates();

