# Challenges Setup Guide

## Issue: Challenges Not Showing Up

If you see "No challenges available at the moment" in the app, follow these steps:

## Step 1: Restart Backend Server

The database migration needs to run to add the `difficulty` column and seed new challenges.

1. Stop your backend server (Ctrl+C)
2. Restart it:
   ```bash
   cd Back-end
   npm run dev
   ```

You should see these messages:
- ✅ Added difficulty column to daily_tasks
- ✅ Updated existing tasks with difficulty values
- ✅ Database initialization complete!

## Step 2: Verify Database Has Challenges

Check if challenges exist in your database:

```sql
SELECT COUNT(*) FROM daily_tasks WHERE is_active = 1;
```

Should return 25 (or more if you have existing tasks).

## Step 3: Test API Endpoint

Test the API directly:

```bash
curl http://localhost:3000/api/tasks/daily
```

Should return JSON with `tasks` and `challenges` arrays.

## Step 4: Check Frontend Console

1. Open your React Native app
2. Open developer console (React Native Debugger or Metro logs)
3. Look for `[Challenges]` log messages
4. Check if API response contains challenges

## Step 5: Verify Database Migration

If migration didn't run automatically, you can manually add the column:

```sql
ALTER TABLE daily_tasks 
ADD COLUMN difficulty VARCHAR(20) DEFAULT 'Easy' AFTER category;
```

Then update existing tasks:

```sql
UPDATE daily_tasks 
SET difficulty = CASE 
  WHEN points_reward <= 15 THEN 'Easy'
  WHEN points_reward <= 30 THEN 'Medium'
  ELSE 'Hard'
END
WHERE difficulty IS NULL;
```

## Common Issues

### Issue: Backend returns empty array
- **Solution**: Check if `insertInitialData` ran. The function skips if data exists. You may need to manually insert challenges.

### Issue: Frontend shows empty state
- **Solution**: Check browser/React Native console for API errors. Verify API base URL in `Front-end/lib/config.ts`.

### Issue: Migration didn't run
- **Solution**: The migration runs on server startup. Make sure you restarted the server after updating `initDatabase.js`.

## Manual Challenge Insert (if needed)

If challenges are missing, run this SQL:

```sql
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
('Social Connection', 'Have a meaningful conversation with a friend', 'social', 'Easy', 20, TRUE);
```

