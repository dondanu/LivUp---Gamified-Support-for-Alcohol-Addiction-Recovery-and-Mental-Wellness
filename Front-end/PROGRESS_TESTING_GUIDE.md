# Progress Tab Testing Guide

## 🎯 How to Test the Progress Tab

### Method 1: Using the App UI (Easiest)

#### Step 1: Insert Data via "Track" Tab

1. **Open the app** and go to the **"Track"** tab (bottom navigation)
2. **Log Drinks:**
   - Click "Log Drinks" button
   - Use +/- buttons to set drink count (0 = sober day)
   - Add notes (optional)
   - Click "Save"
   - **Tip:** Log 0 drinks for sober days to see progress

3. **Log Mood:**
   - Click "Log Mood" button
   - Select a mood (Happy, Sad, Stressed, etc.)
   - Add notes (optional)
   - Click "Save"

4. **Log Triggers:**
   - Click "Log Trigger" button
   - Select trigger type (Stress, Social, Boredom, etc.)
   - Add description
   - Click "Save"

5. **Complete Challenges:**
   - Go to "Challenges" tab
   - Complete any challenge (Music Therapy, Deep Breathing, etc.)
   - This awards points and achievements

#### Step 2: Check Progress Tab

1. Go to **"Progress"** tab
2. You should see:
   - **Stats Row:** Sober Days, Current Streak, Badges Earned
   - **Drink Tracking Chart:** Bar chart showing drinks over time
   - **Trigger Analysis:** List of triggers with frequency
   - **Level Progress:** Your gamification level

3. **Test Period Selector:**
   - Click "Week" - shows last 7 days
   - Click "Month" - shows last 30 days (includes trigger counts from backend)
   - Click "90 Days" - shows last 90 days

---

### Method 2: Using Backend API (For Testing)

#### Prerequisites
- Backend server running on `http://localhost:3000`
- Your JWT token from login

#### Step 1: Get Your Token

```bash
# Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

Save the `token` from response.

#### Step 2: Insert Test Data

**Log Drinks (Sober Day):**
```bash
curl -X POST http://localhost:3000/api/drinks/log \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "drinkCount": 0,
    "logDate": "2024-01-15",
    "notes": "Sober day!"
  }'
```

**Log Mood:**
```bash
curl -X POST http://localhost:3000/api/mood/log \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "moodType": "happy",
    "moodScore": 8,
    "logDate": "2024-01-15"
  }'
```

**Log Trigger:**
```bash
curl -X POST http://localhost:3000/api/triggers/log \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "triggerType": "stress",
    "intensity": 5,
    "logDate": "2024-01-15",
    "notes": "Work deadline"
  }'
```

**Complete Task:**
```bash
curl -X POST http://localhost:3000/api/tasks/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 1
  }'
```

#### Step 3: Check Progress Endpoints

**Weekly Progress:**
```bash
curl http://localhost:3000/api/progress/weekly \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Monthly Progress:**
```bash
curl http://localhost:3000/api/progress/monthly \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Overall Progress:**
```bash
curl http://localhost:3000/api/progress/overall \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ What to Check

### 1. Stats Row
- **Sober Days:** Should match days with 0 drinks
- **Current Streak:** Should match profile streak
- **Badges Earned:** Should show count of earned achievements

### 2. Drink Tracking Chart
- **Week View:** Shows last 7 days of drink logs
- **Month View:** Shows last 30 days
- **90 Days View:** Shows last 90 days
- Bars should reflect drink counts (0 = sober day)

### 3. Trigger Analysis
- **Only shows in Month/90 Days view** (Week view fetches separately)
- Should list all trigger types you've logged
- Shows frequency count for each trigger
- Bars show relative frequency

### 4. Level Progress
- Shows current level from profile
- Shows total points
- Progress bar shows progress to next level
- Next milestone shows target points

---

## 🐛 Troubleshooting

### No Data Showing?

1. **Check if you're logged in:**
   - Go to Profile tab
   - Verify you see your username

2. **Check if data exists:**
   - Go to Track tab
   - Verify you've logged drinks/moods/triggers

3. **Check backend is running:**
   - Backend should be on `http://localhost:3000`
   - Check console for errors

4. **Check network:**
   - Verify API URL in `Front-end/lib/config.ts`
   - Should be `http://localhost:3000/api` for local dev

### Chart Not Updating?

1. **Refresh the Progress tab:**
   - Pull down to refresh
   - Or navigate away and back

2. **Check selected period:**
   - Make sure you're viewing the right period (Week/Month/90 Days)
   - Data might be in a different period

3. **Check date format:**
   - Backend uses `YYYY-MM-DD` format
   - Make sure dates are correct

### Trigger Analysis Not Showing?

1. **Only shows if you have triggers logged**
2. **Week view:** Fetches triggers separately (might be empty)
3. **Month view:** Uses backend aggregated data (should work)
4. **90 Days view:** Fetches triggers separately

---

## 📊 Quick Test Scenario

### Create Test Data for 7 Days:

**Day 1 (Today):**
- Log 0 drinks (sober day)
- Log mood: Happy
- Complete a challenge

**Day 2 (Yesterday):**
- Log 0 drinks
- Log trigger: Stress

**Day 3:**
- Log 2 drinks
- Log mood: Stressed

**Day 4:**
- Log 0 drinks
- Log trigger: Social

**Day 5:**
- Log 0 drinks

**Day 6:**
- Log 1 drink
- Log trigger: Boredom

**Day 7:**
- Log 0 drinks
- Log mood: Calm

### Expected Results:

- **Sober Days:** 5 (days with 0 drinks)
- **Current Streak:** Should calculate from today backwards
- **Drink Chart:** Should show 7 bars with values [0, 0, 2, 0, 0, 1, 0]
- **Trigger Analysis:** Should show Stress (1), Social (1), Boredom (1)

---

## 🔍 Debugging Tips

### Check Console Logs:
- Open React Native debugger
- Look for API calls in Network tab
- Check for errors in console

### Check Backend Logs:
- Backend console should show API requests
- Check for database errors
- Verify SQL queries are executing

### Verify Data in Database:
- Check Supabase dashboard
- Look at `drink_logs`, `mood_logs`, `trigger_logs` tables
- Verify `user_profiles` has correct streak/points

---

## 📝 Notes

- **Week view** uses `/progress/weekly` endpoint
- **Month view** uses `/progress/monthly` endpoint (includes trigger counts)
- **90 Days view** uses `/progress/overall` + separate drink/trigger fetches
- All views use `/gamification/profile` for badges count
- Sober days are calculated by backend (days with `drink_count = 0`)

---

**Happy Testing! 🚀**

