// Quick script to insert challenges directly into the database
// Run this with: node Back-end/QUICK_FIX_CHALLENGES.js

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mind_fusion',
};

async function insertChallenges() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // First, ensure difficulty column exists
    try {
      await connection.query(`
        ALTER TABLE daily_tasks 
        ADD COLUMN difficulty VARCHAR(20) DEFAULT 'Easy' AFTER category
      `);
      console.log('✅ Added difficulty column (or it already exists)');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Difficulty column already exists');
      } else {
        throw error;
      }
    }

    // Check current count
    const [countRows] = await connection.query('SELECT COUNT(*) as count FROM daily_tasks');
    console.log(`📊 Current tasks in database: ${countRows[0].count}`);

    // Delete all existing tasks to start fresh (optional - comment out if you want to keep existing)
    // await connection.query('DELETE FROM daily_tasks');
    // console.log('🗑️  Cleared existing tasks');

    // Insert all 25 challenges
    await connection.query(`
      INSERT INTO daily_tasks (task_name, description, category, difficulty, points_reward, is_active) VALUES
      ('Morning Meditation', 'Start your day with 5 minutes of meditation', 'wellness', 'Easy', 15, TRUE),
      ('Exercise', 'Do 30 minutes of physical activity', 'health', 'Medium', 20, TRUE),
      ('Journal Entry', 'Write in your recovery journal', 'reflection', 'Easy', 10, TRUE),
      ('Read Recovery Material', 'Read for 15 minutes about recovery', 'education', 'Easy', 15, TRUE),
      ('Call Support', 'Reach out to a support person', 'social', 'Medium', 25, TRUE),
      ('Healthy Meal', 'Prepare and eat a nutritious meal', 'health', 'Easy', 10, TRUE),
      ('Gratitude List', 'Write down 3 things you''re grateful for', 'reflection', 'Easy', 10, TRUE),
      ('Art/Creative Activity', 'Engage in creative expression', 'wellness', 'Easy', 15, TRUE),
      ('Nature Walk', 'Spend 20 minutes outdoors', 'wellness', 'Easy', 15, TRUE),
      ('Practice Mindfulness', 'Do a 10-minute mindfulness exercise', 'wellness', 'Easy', 15, TRUE),
      ('Help Someone', 'Do something kind for another person', 'social', 'Medium', 20, TRUE),
      ('Learn Something New', 'Watch a tutorial or read an article', 'education', 'Easy', 10, TRUE),
      ('Music Therapy', 'Listen to uplifting music for 30 minutes', 'wellness', 'Easy', 10, TRUE),
      ('Healthy Sleep', 'Get 7-8 hours of sleep', 'health', 'Medium', 15, TRUE),
      ('No Social Media', 'Take a break from social media', 'wellness', 'Medium', 10, TRUE),
      ('Stretch/Yoga', 'Do 15 minutes of stretching or yoga', 'health', 'Easy', 15, TRUE),
      ('Cook a New Recipe', 'Try cooking something healthy', 'health', 'Medium', 15, TRUE),
      ('Write Affirmations', 'Write 5 positive affirmations', 'reflection', 'Easy', 10, TRUE),
      ('Listen to Podcast', 'Listen to a recovery or wellness podcast', 'education', 'Easy', 15, TRUE),
      ('Deep Breathing', 'Practice 5 minutes of deep breathing', 'wellness', 'Easy', 10, TRUE),
      ('Complete a 5K Run', 'Run or walk 5 kilometers', 'health', 'Hard', 50, TRUE),
      ('Attend Support Group', 'Join a recovery support group meeting', 'social', 'Medium', 40, TRUE),
      ('Week-Long Challenge', 'Complete 7 days of daily tasks', 'wellness', 'Hard', 100, TRUE),
      ('Meditation Marathon', 'Meditate for 30 minutes straight', 'wellness', 'Hard', 45, TRUE),
      ('Social Connection', 'Have a meaningful conversation with a friend', 'social', 'Easy', 20, TRUE)
    `);

    // Verify the insert
    const [finalCount] = await connection.query('SELECT COUNT(*) as count FROM daily_tasks WHERE is_active = 1');
    console.log(`✅ Successfully inserted challenges! Total active challenges: ${finalCount[0].count}`);

    await connection.end();
    console.log('✅ Done! Restart your backend server and test the API.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

insertChallenges();

