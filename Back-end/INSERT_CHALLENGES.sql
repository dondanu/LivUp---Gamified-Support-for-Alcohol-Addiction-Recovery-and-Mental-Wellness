-- Quick SQL script to insert challenges if they're missing
-- Run this in your MySQL database if challenges aren't showing up

-- First, make sure difficulty column exists
ALTER TABLE daily_tasks 
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'Easy' AFTER category;

-- Delete existing tasks if you want to start fresh (optional)
-- DELETE FROM daily_tasks;

-- Insert all 25 challenges
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
ON DUPLICATE KEY UPDATE difficulty = VALUES(difficulty), is_active = TRUE;

-- Verify the insert
SELECT COUNT(*) as total_challenges FROM daily_tasks WHERE is_active = 1;

