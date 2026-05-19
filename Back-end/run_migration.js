// Run this script to add drink_price column to drink_logs table
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mindfusion',
    });

    console.log('✅ Connected to database');

    // Check if column already exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM drink_logs LIKE 'drink_price'"
    );

    if (columns.length > 0) {
      console.log('⚠️  Column drink_price already exists. Skipping...');
      return;
    }

    console.log('📝 Adding drink_price column...');

    // Add drink_price column
    await connection.query(`
      ALTER TABLE drink_logs 
      ADD COLUMN drink_price DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Price of drinks in Sri Lankan Rupees'
    `);

    console.log('✅ Column drink_price added successfully');

    // Update existing records with default price (RS 500 per drink)
    console.log('📝 Updating existing records with default price...');
    
    const [result] = await connection.query(`
      UPDATE drink_logs 
      SET drink_price = drink_count * 500 
      WHERE drink_price = 0.00 AND drink_count > 0
    `);

    console.log(`✅ Updated ${result.affectedRows} existing records`);

    // Verify the changes
    console.log('📝 Verifying changes...');
    
    const [sampleData] = await connection.query(`
      SELECT id, user_id, drink_count, drink_price, log_date 
      FROM drink_logs 
      ORDER BY log_date DESC 
      LIMIT 5
    `);

    console.log('\n📊 Sample data (latest 5 records):');
    console.table(sampleData);

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run migration
runMigration();
