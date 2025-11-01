const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mind_fusion',
  multipleStatements: true
};

async function initializeDatabase() {
  let connection;
  
  try {
    // Connect without database first to create it
    const configWithoutDb = { ...dbConfig };
    delete configWithoutDb.database;
    
    connection = await mysql.createConnection(configWithoutDb);
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log(`✅ Database '${dbConfig.database}' ready`);
    
    await connection.end();
    
    // Now connect to the database
    connection = await mysql.createConnection(dbConfig);
    
    // Create all tables
    await createTables(connection);
    
    // Insert initial data
    await insertInitialData(connection);
    
    console.log('✅ Database initialization complete!');
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    if (connection) await connection.end();
    throw error;
  }
}

async function createTables(connection) {
  // Users table (must be first)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      is_anonymous BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Levels table (must be before user_profiles)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS levels (
      id INT PRIMARY KEY AUTO_INCREMENT,
      level_name VARCHAR(50) NOT NULL,
      points_required INT NOT NULL,
      avatar_unlock VARCHAR(50),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User profiles table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT UNIQUE NOT NULL,
      total_points INT DEFAULT 0,
      current_streak INT DEFAULT 0,
      longest_streak INT DEFAULT 0,
      days_sober INT DEFAULT 0,
      level_id INT DEFAULT 1,
      avatar_type VARCHAR(50) DEFAULT 'basic',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (level_id) REFERENCES levels(id)
    )
  `);

  // User settings table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT UNIQUE NOT NULL,
      notifications_enabled BOOLEAN DEFAULT TRUE,
      daily_reminder_time TIME,
      reminder_frequency VARCHAR(20) DEFAULT 'daily',
      theme VARCHAR(20) DEFAULT 'light',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Drink logs table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS drink_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      drink_count INT NOT NULL DEFAULT 0,
      log_date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_date (user_id, log_date)
    )
  `);

  // Mood logs table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS mood_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      mood_type VARCHAR(20) NOT NULL,
      mood_score INT NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
      log_date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_mood_date (user_id, log_date)
    )
  `);

  // Trigger logs table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS trigger_logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      trigger_type VARCHAR(20) NOT NULL,
      intensity INT NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
      log_date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Achievements table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INT PRIMARY KEY AUTO_INCREMENT,
      achievement_name VARCHAR(100) NOT NULL,
      description TEXT,
      points_reward INT DEFAULT 0,
      requirement_type VARCHAR(50),
      requirement_value INT,
      icon VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User achievements table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      achievement_id INT NOT NULL,
      earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_achievement (user_id, achievement_id)
    )
  `);

  // Daily tasks table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS daily_tasks (
      id INT PRIMARY KEY AUTO_INCREMENT,
      task_name VARCHAR(100) NOT NULL,
      description TEXT,
      category VARCHAR(50),
      points_reward INT DEFAULT 10,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User daily tasks table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS user_daily_tasks (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      task_id INT NOT NULL,
      completion_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES daily_tasks(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_task_date (user_id, task_id, completion_date)
    )
  `);

  // SOS contacts table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS sos_contacts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      contact_name VARCHAR(100) NOT NULL,
      contact_phone VARCHAR(20) NOT NULL,
      relationship VARCHAR(50),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Motivational quotes table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS motivational_quotes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      quote TEXT NOT NULL,
      author VARCHAR(100),
      category VARCHAR(50),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Healthy alternatives table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS healthy_alternatives (
      id INT PRIMARY KEY AUTO_INCREMENT,
      activity_name VARCHAR(100) NOT NULL,
      description TEXT,
      category VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ All tables created successfully');
}

async function insertInitialData(connection) {
  // Check if data already exists
  const [levelRows] = await connection.query('SELECT COUNT(*) as count FROM levels');
  if (levelRows[0].count > 0) {
    console.log('ℹ️  Initial data already exists, skipping...');
    return;
  }

  // Insert levels
  await connection.query(`
    INSERT INTO levels (level_name, points_required, avatar_unlock, description) VALUES
    ('Beginner', 0, 'basic', 'Starting your journey'),
    ('Apprentice', 100, 'apprentice', 'Making progress'),
    ('Warrior', 300, 'warrior', 'Building strength'),
    ('Champion', 600, 'champion', 'Showing dedication'),
    ('Master', 1000, 'master', 'Achieving mastery'),
    ('Legend', 2000, 'legend', 'Reaching legendary status'),
    ('Phoenix', 5000, 'phoenix', 'Rising from the ashes')
  `);

  // Insert achievements
  await connection.query(`
    INSERT INTO achievements (achievement_name, description, points_reward, requirement_type, requirement_value, icon) VALUES
    ('First Step', 'Complete your first day sober', 50, 'days_sober', 1, 'first-step'),
    ('Week Warrior', 'Complete 7 days sober', 100, 'days_sober', 7, 'week-warrior'),
    ('Monthly Champion', 'Complete 30 days sober', 500, 'days_sober', 30, 'monthly-champion'),
    ('Streak Starter', 'Achieve a 3-day streak', 75, 'streak', 3, 'streak-starter'),
    ('Streak Master', 'Achieve a 30-day streak', 300, 'streak', 30, 'streak-master'),
    ('Task Master', 'Complete 10 tasks', 100, 'tasks_completed', 10, 'task-master'),
    ('Hundred Hero', 'Reach 100 points', 50, 'points', 100, 'hundred-hero'),
    ('Thousand Titan', 'Reach 1000 points', 500, 'points', 1000, 'thousand-titan'),
    ('Zero Day Hero', 'Avoid drinking for 50 days', 400, 'drinks_avoided', 50, 'zero-hero')
  `);

  // Insert daily tasks
  await connection.query(`
    INSERT INTO daily_tasks (task_name, description, category, points_reward) VALUES
    ('Morning Meditation', 'Start your day with 5 minutes of meditation', 'wellness', 15),
    ('Exercise', 'Do 30 minutes of physical activity', 'health', 20),
    ('Journal Entry', 'Write in your recovery journal', 'reflection', 10),
    ('Read Recovery Material', 'Read for 15 minutes about recovery', 'education', 15),
    ('Call Support', 'Reach out to a support person', 'social', 25),
    ('Healthy Meal', 'Prepare and eat a nutritious meal', 'health', 10),
    ('Gratitude List', 'Write down 3 things you''re grateful for', 'reflection', 10),
    ('Art/Creative Activity', 'Engage in creative expression', 'wellness', 15),
    ('Nature Walk', 'Spend 20 minutes outdoors', 'wellness', 15),
    ('Practice Mindfulness', 'Do a 10-minute mindfulness exercise', 'wellness', 15),
    ('Help Someone', 'Do something kind for another person', 'social', 20),
    ('Learn Something New', 'Watch a tutorial or read an article', 'education', 10),
    ('Music Therapy', 'Listen to uplifting music for 30 minutes', 'wellness', 10),
    ('Healthy Sleep', 'Get 7-8 hours of sleep', 'health', 15),
    ('No Social Media', 'Take a break from social media', 'wellness', 10),
    ('Stretch/Yoga', 'Do 15 minutes of stretching or yoga', 'health', 15),
    ('Cook a New Recipe', 'Try cooking something healthy', 'health', 15),
    ('Write Affirmations', 'Write 5 positive affirmations', 'reflection', 10),
    ('Listen to Podcast', 'Listen to a recovery or wellness podcast', 'education', 15),
    ('Deep Breathing', 'Practice 5 minutes of deep breathing', 'wellness', 10)
  `);

  // Insert motivational quotes
  await connection.query(`
    INSERT INTO motivational_quotes (quote, author, category, is_active) VALUES
    ('Every day is a new beginning.', 'Anonymous', 'motivation', TRUE),
    ('You are stronger than you think.', 'Anonymous', 'strength', TRUE),
    ('Progress, not perfection.', 'Anonymous', 'motivation', TRUE),
    ('One day at a time.', 'Anonymous', 'recovery', TRUE),
    ('You have the power to change your story.', 'Anonymous', 'empowerment', TRUE),
    ('Recovery is possible, healing is real.', 'Anonymous', 'recovery', TRUE),
    ('Your past doesn''t define your future.', 'Anonymous', 'hope', TRUE),
    ('Small steps lead to big changes.', 'Anonymous', 'motivation', TRUE),
    ('You are worthy of a better life.', 'Anonymous', 'self-worth', TRUE),
    ('Strength comes from overcoming challenges.', 'Anonymous', 'strength', TRUE),
    ('Today is a gift, that''s why it''s called present.', 'Anonymous', 'mindfulness', TRUE),
    ('Believe you can and you''re halfway there.', 'Theodore Roosevelt', 'motivation', TRUE),
    ('The only way out is through.', 'Anonymous', 'recovery', TRUE),
    ('You''ve survived 100% of your bad days.', 'Anonymous', 'strength', TRUE),
    ('Healing is not linear, but it''s possible.', 'Anonymous', 'recovery', TRUE),
    ('Your comeback is stronger than your setback.', 'Anonymous', 'strength', TRUE),
    ('Choose courage over comfort.', 'Anonymous', 'bravery', TRUE),
    ('Every moment is a chance to start over.', 'Anonymous', 'hope', TRUE),
    ('You don''t have to be perfect to be amazing.', 'Anonymous', 'self-acceptance', TRUE),
    ('Recovery is a journey, not a destination.', 'Anonymous', 'recovery', TRUE),
    ('The person you''ll become is worth the fight.', 'Anonymous', 'motivation', TRUE),
    ('You are not alone in this journey.', 'Anonymous', 'support', TRUE),
    ('Self-care isn''t selfish, it''s necessary.', 'Anonymous', 'self-care', TRUE),
    ('Your best days are ahead of you.', 'Anonymous', 'hope', TRUE),
    ('Transform your pain into your power.', 'Anonymous', 'empowerment', TRUE)
  `);

  // Insert healthy alternatives
  await connection.query(`
    INSERT INTO healthy_alternatives (activity_name, description, category) VALUES
    ('Go for a walk', 'Take a 20-minute walk in nature', 'physical'),
    ('Call a friend', 'Reach out to someone you care about', 'social'),
    ('Read a book', 'Get lost in a good book', 'mental'),
    ('Practice meditation', '10 minutes of mindfulness', 'wellness'),
    ('Exercise', 'Go to the gym or do a home workout', 'physical'),
    ('Write in journal', 'Express your thoughts and feelings', 'emotional'),
    ('Listen to music', 'Play your favorite uplifting songs', 'entertainment'),
    ('Cook a healthy meal', 'Prepare something nutritious', 'health'),
    ('Do yoga', 'Practice yoga poses for relaxation', 'wellness'),
    ('Watch a movie', 'Enjoy a good film', 'entertainment'),
    ('Take a bath', 'Relax in a warm bath', 'self-care'),
    ('Draw or paint', 'Express yourself creatively', 'creative'),
    ('Play an instrument', 'Make music', 'creative'),
    ('Do a puzzle', 'Engage your mind', 'mental'),
    ('Gardening', 'Spend time with plants', 'nature'),
    ('Volunteer', 'Help others in need', 'social'),
    ('Learn something new', 'Watch tutorials or take a course', 'education'),
    ('Deep breathing exercises', 'Practice breathing techniques', 'wellness'),
    ('Dance', 'Move to your favorite music', 'physical'),
    ('Plan a trip', 'Dream and plan future adventures', 'mental'),
    ('Photography', 'Take photos of interesting things', 'creative'),
    ('Clean and organize', 'Declutter your space', 'productive'),
    ('Listen to podcasts', 'Learn from podcasts', 'education'),
    ('Play board games', 'Have fun with games', 'social'),
    ('Stargazing', 'Look at the night sky', 'nature')
  `);

  console.log('✅ Initial data inserted successfully');
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database setup complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };

