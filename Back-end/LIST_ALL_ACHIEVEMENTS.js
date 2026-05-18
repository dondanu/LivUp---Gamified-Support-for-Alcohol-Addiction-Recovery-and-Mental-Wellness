const mysql = require('mysql2/promise');
require('dotenv').config();

async function listAllAchievements() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mindfusion',
  });

  try {
    console.log('🏆 ALL ACHIEVEMENTS IN DATABASE\n');
    console.log('='.repeat(80));

    const [achievements] = await connection.query(`
      SELECT 
        id,
        achievement_name,
        description,
        requirement_type,
        requirement_value,
        points_reward
      FROM achievements
      ORDER BY points_reward ASC
    `);

    console.log(`\nTotal: ${achievements.length} achievements\n`);

    achievements.forEach((ach, i) => {
      console.log(`${i + 1}. "${ach.achievement_name}" (+${ach.points_reward} pts)`);
      console.log(`   Type: ${ach.requirement_type}, Value: ${ach.requirement_value}`);
      console.log(`   Description: ${ach.description}`);
      console.log('');
    });

    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

listAllAchievements();
