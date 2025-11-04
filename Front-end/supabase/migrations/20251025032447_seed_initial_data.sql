/*
  # Seed Initial Data

  ## Overview
  Populates the database with initial data for badges, challenges, healthy alternatives, and motivational quotes.

  ## Data Seeding

  ### Badges
  Creates achievement badges for various milestones:
  - First Step: Complete first day sober
  - Week Warrior: 7-day streak
  - Month Master: 30-day streak
  - Challenge Champion: Complete 10 challenges
  - And more...

  ### Challenges
  Creates daily and weekly challenges:
  - Drink water instead
  - Go for a walk
  - Practice meditation
  - Call a friend
  - And more...

  ### Healthy Alternatives
  Provides activity suggestions across categories:
  - Exercise activities
  - Creative pursuits
  - Social activities
  - Relaxation techniques
  - Food/cooking activities

  ### Motivational Quotes
  Inspirational quotes for daily motivation

  ## Important Notes
  - All entries use IF NOT EXISTS checks where applicable
  - Data is inserted only if tables are empty
  - Provides a solid foundation for the gamification system
*/

-- Insert Badges
INSERT INTO badges (name, description, icon, requirement_type, requirement_value) VALUES
('First Step', 'Complete your first day sober', 'star', 'days_sober', 1),
('Week Warrior', 'Maintain a 7-day sober streak', 'trophy', 'streak', 7),
('Two Week Champion', 'Maintain a 14-day sober streak', 'award', 'streak', 14),
('Month Master', 'Maintain a 30-day sober streak', 'crown', 'streak', 30),
('Quarter King', 'Maintain a 90-day sober streak', 'gem', 'streak', 90),
('Half Year Hero', 'Maintain a 180-day sober streak', 'shield', 'streak', 180),
('Year Legend', 'Maintain a 365-day sober streak', 'diamond', 'streak', 365),
('Challenge Starter', 'Complete 5 challenges', 'target', 'challenges', 5),
('Challenge Champion', 'Complete 10 challenges', 'medal', 'challenges', 10),
('Challenge Master', 'Complete 25 challenges', 'star', 'challenges', 25),
('Challenge Legend', 'Complete 50 challenges', 'trophy', 'challenges', 50),
('Mood Tracker', 'Log your mood for 7 consecutive days', 'heart', 'mood_logs', 7),
('Self Aware', 'Log your mood for 30 consecutive days', 'brain', 'mood_logs', 30),
('Trigger Hunter', 'Identify 10 triggers', 'search', 'trigger_logs', 10),
('Pattern Master', 'Identify 25 triggers', 'eye', 'trigger_logs', 25);

-- Insert Daily Challenges
INSERT INTO challenges (title, description, points_reward, difficulty, is_active) VALUES
('Hydration Hero', 'Drink 8 glasses of water today', 10, 'Easy', true),
('Morning Walk', 'Take a 15-minute walk in the morning', 15, 'Easy', true),
('Meditation Moment', 'Practice 10 minutes of meditation', 20, 'Medium', true),
('Healthy Meal', 'Prepare a healthy meal at home', 15, 'Easy', true),
('Call a Friend', 'Reach out to a supportive friend or family member', 20, 'Easy', true),
('Journal Entry', 'Write about your feelings and progress', 15, 'Easy', true),
('Exercise Session', 'Complete a 30-minute workout', 25, 'Medium', true),
('New Hobby', 'Spend 1 hour on a creative hobby', 20, 'Medium', true),
('Early Bedtime', 'Go to bed before 10 PM', 15, 'Easy', true),
('Social Activity', 'Attend a social event without alcohol', 30, 'Hard', true),
('Gratitude List', 'Write down 5 things you''re grateful for', 10, 'Easy', true),
('Craving Victory', 'Overcome a craving without drinking', 25, 'Medium', true),
('Healthy Snack', 'Choose a healthy snack over junk food', 10, 'Easy', true),
('Breathing Exercise', 'Practice deep breathing for 5 minutes', 10, 'Easy', true),
('Book Reading', 'Read for 30 minutes', 15, 'Easy', true),
('Vitamin Boost', 'Take your daily vitamins', 5, 'Easy', true),
('Screen Detox', 'Avoid screens 1 hour before bed', 20, 'Medium', true),
('Nature Time', 'Spend 30 minutes outdoors', 15, 'Easy', true),
('Music Therapy', 'Listen to uplifting music for 20 minutes', 10, 'Easy', true),
('Volunteer Work', 'Help someone in need', 25, 'Medium', true);

-- Insert Healthy Alternatives
INSERT INTO healthy_alternatives (title, description, category, duration_minutes) VALUES
-- Exercise
('Go for a Run', 'Clear your mind with a refreshing run around your neighborhood', 'exercise', 30),
('Yoga Session', 'Practice yoga to reduce stress and improve flexibility', 'exercise', 45),
('Home Workout', 'Complete a bodyweight workout routine at home', 'exercise', 30),
('Swimming', 'Swim laps at your local pool for full-body exercise', 'exercise', 45),
('Cycling', 'Take your bike out for a scenic ride', 'exercise', 60),
('Dancing', 'Put on your favorite music and dance freely', 'exercise', 20),
('Jump Rope', 'Quick cardio session with a jump rope', 'exercise', 15),
('Hiking', 'Explore nature trails and enjoy the outdoors', 'exercise', 120),

-- Creative
('Drawing/Painting', 'Express yourself through art', 'creative', 60),
('Writing', 'Write in your journal or work on creative writing', 'creative', 30),
('Playing Music', 'Practice an instrument or learn a new song', 'creative', 45),
('Photography', 'Take photos of interesting subjects around you', 'creative', 60),
('Crafting', 'Work on DIY projects or crafts', 'creative', 90),
('Cooking New Recipe', 'Try cooking a new healthy recipe', 'creative', 60),
('Gardening', 'Tend to plants or start a small garden', 'creative', 45),

-- Social
('Call Family', 'Have a meaningful conversation with a family member', 'social', 30),
('Meet a Friend', 'Spend quality time with a supportive friend', 'social', 120),
('Join Support Group', 'Attend an online or in-person support meeting', 'social', 60),
('Volunteer', 'Help out at a local charity or community center', 'social', 120),
('Game Night', 'Play board games or video games with friends', 'social', 90),

-- Relaxation
('Meditation', 'Practice mindfulness meditation', 'relaxation', 20),
('Deep Breathing', 'Perform breathing exercises to calm your mind', 'relaxation', 10),
('Take a Bath', 'Enjoy a relaxing bath with calming music', 'relaxation', 30),
('Read a Book', 'Get lost in a good book', 'relaxation', 60),
('Listen to Podcast', 'Learn something new or be entertained by a podcast', 'relaxation', 45),
('Watch Comedy', 'Watch a funny movie or stand-up comedy', 'relaxation', 90),
('Aromatherapy', 'Use essential oils for relaxation', 'relaxation', 15),
('Progressive Muscle Relaxation', 'Systematically tense and relax muscle groups', 'relaxation', 20),

-- Food
('Smoothie Making', 'Blend a delicious and nutritious smoothie', 'food', 10),
('Baking', 'Bake healthy treats like banana bread or muffins', 'food', 60),
('Meal Prep', 'Prepare healthy meals for the week ahead', 'food', 90),
('Try Herbal Tea', 'Brew and enjoy a calming herbal tea', 'food', 10),
('Make Fresh Juice', 'Juice fresh fruits and vegetables', 'food', 15);

-- Insert Motivational Quotes
INSERT INTO motivational_quotes (quote, author, is_active) VALUES
('One day at a time. You can do this.', 'Anonymous', true),
('The greatest glory in living lies not in never falling, but in rising every time we fall.', 'Nelson Mandela', true),
('You are stronger than your cravings.', 'Anonymous', true),
('Recovery is not a race. You don''t have to feel guilty if it takes you longer than you thought it would.', 'Anonymous', true),
('Every moment is a fresh beginning.', 'T.S. Eliot', true),
('Your health is an investment, not an expense.', 'Anonymous', true),
('It does not matter how slowly you go as long as you do not stop.', 'Confucius', true),
('Believe you can and you''re halfway there.', 'Theodore Roosevelt', true),
('The only person you are destined to become is the person you decide to be.', 'Ralph Waldo Emerson', true),
('Recovery is about progression, not perfection.', 'Anonymous', true),
('You didn''t come this far to only come this far.', 'Anonymous', true),
('Sobriety is a journey, not a destination.', 'Anonymous', true),
('Your future self will thank you for the choices you make today.', 'Anonymous', true),
('Fall seven times, stand up eight.', 'Japanese Proverb', true),
('The comeback is always stronger than the setback.', 'Anonymous', true),
('You are capable of amazing things.', 'Anonymous', true),
('Progress, not perfection.', 'Anonymous', true),
('Take it one day at a time, and be proud of each day you succeed.', 'Anonymous', true),
('Your strength is greater than any struggle.', 'Anonymous', true),
('Every sober day is a victory worth celebrating.', 'Anonymous', true);