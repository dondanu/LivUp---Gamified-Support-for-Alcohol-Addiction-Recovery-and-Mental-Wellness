# 🎮 MindFusion Gamification System - Complete Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Levels System](#levels-system)
3. [Points System](#points-system)
4. [Challenges System](#challenges-system)
5. [Achievements System](#achievements-system)
6. [Streaks System](#streaks-system)
7. [How Everything Works Together](#how-everything-works-together)

---

## 🎯 Overview

MindFusion-ல 3 main gamification features இருக்கு:
1. **Levels** - உங்க progress-ஐ காட்டும்
2. **Challenges** - Daily tasks complete பண்ணி points earn பண்ணுங்க
3. **Achievements** - Milestones achieve பண்ணி badges unlock பண்ணுங்க

---

## 🏆 Levels System

### Available Levels (7 Total)

| Level | Name | Points Required | Avatar Unlock |
|-------|------|----------------|---------------|
| 1 | Beginner | 0 | Basic |
| 2 | Apprentice | 100 | Apprentice |
| 3 | Warrior | 300 | Warrior |
| 4 | Champion | 600 | Champion |
| 5 | Master | 1000 | Master |
| 6 | Legend | 2000 | Legend |
| 7 | Phoenix | 5000 | Phoenix |

### How Levels Work:
- Points earn பண்ணும் போது automatic-ஆ level increase ஆகும்
- ஒவ்வொரு level-க்கும் unique avatar unlock ஆகும்
- Level up ஆனா notification வரும்

### Example:
```
0 points → Level 1 (Beginner)
150 points → Level 2 (Apprentice)
350 points → Level 3 (Warrior)
700 points → Level 4 (Champion)
```

---

## 💰 Points System

### How to Earn Points:

#### 1. Complete Challenges (Primary Method)
- Easy challenges: 10-20 points
- Medium challenges: 15-40 points
- Hard challenges: 45-100 points

#### 2. Unlock Achievements (Bonus Points)
- First Step: +50 points
- Hundred Hero: +50 points
- Week Warrior: +100 points
- Task Master: +100 points
- Streak Starter: +75 points
- Streak Master: +300 points
- Monthly Champion: +500 points
- Thousand Titan: +500 points
- Zero Day Hero: +400 points

### Points Calculation:
```
Total Points = Challenge Points + Achievement Points
```

### Current Points Distribution:
- **Total Available from Challenges**: 505 points (25 challenges)
- **Total Available from Achievements**: 2,175 points (9 achievements)
- **Maximum Possible Points**: 2,680+ points

---

## 🎯 Challenges System

### Total Challenges: 25

### Challenge Categories:

#### 1. **Wellness** (8 challenges)
| Challenge | Difficulty | Points |
|-----------|-----------|--------|
| Morning Meditation | Easy | 15 |
| Art/Creative Activity | Easy | 15 |
| Nature Walk | Easy | 15 |
| Practice Mindfulness | Easy | 15 |
| Music Therapy | Easy | 10 |
| Deep Breathing | Easy | 10 |
| No Social Media | Medium | 10 |
| Week-Long Challenge | Hard | 100 |
| Meditation Marathon | Hard | 45 |

**Total Wellness Points**: 235

#### 2. **Health** (6 challenges)
| Challenge | Difficulty | Points |
|-----------|-----------|--------|
| Healthy Meal | Easy | 10 |
| Stretch/Yoga | Easy | 15 |
| Exercise | Medium | 20 |
| Healthy Sleep | Medium | 15 |
| Cook a New Recipe | Medium | 15 |
| Complete a 5K Run | Hard | 50 |

**Total Health Points**: 125

#### 3. **Reflection** (3 challenges)
| Challenge | Difficulty | Points |
|-----------|-----------|--------|
| Journal Entry | Easy | 10 |
| Gratitude List | Easy | 10 |
| Write Affirmations | Easy | 10 |

**Total Reflection Points**: 30

#### 4. **Education** (3 challenges)
| Challenge | Difficulty | Points |
|-----------|-----------|--------|
| Read Recovery Material | Easy | 15 |
| Learn Something New | Easy | 10 |
| Listen to Podcast | Easy | 15 |

**Total Education Points**: 40

#### 5. **Social** (5 challenges)
| Challenge | Difficulty | Points |
|-----------|-----------|--------|
| Social Connection | Easy | 20 |
| Call Support | Medium | 25 |
| Help Someone | Medium | 20 |
| Attend Support Group | Medium | 40 |

**Total Social Points**: 105

### Challenge Difficulty Breakdown:
- **Easy**: 15 challenges (10-20 points each)
- **Medium**: 7 challenges (10-40 points each)
- **Hard**: 3 challenges (45-100 points each)

### How to Complete Challenges:

1. **Navigate to Challenges Tab**
   - Bottom navigation → Challenges icon

2. **View Available Challenges**
   - Scroll through the list
   - See difficulty, points, and description

3. **Start a Challenge**
   - Tap on any challenge card
   - Read the instructions
   - Tap "Start Challenge"

4. **Complete the Challenge**
   - Follow the instructions
   - Tap "Mark as Complete" when done
   - Earn points immediately!

5. **Daily Reset**
   - Challenges reset every day
   - You can complete the same challenge again tomorrow

### Challenge Completion Rules:
- ✅ Can complete multiple challenges per day
- ✅ Each challenge can be completed once per day
- ✅ Points are awarded immediately
- ✅ Level updates automatically
- ❌ Cannot complete the same challenge twice in one day

---

## 🏅 Achievements System

### Total Achievements: 9

### Achievement Categories:

#### 1. **Points-Based Achievements** (2)
| Achievement | Requirement | Points Reward |
|-------------|------------|---------------|
| Hundred Hero | Reach 100 points | +50 |
| Thousand Titan | Reach 1000 points | +500 |

#### 2. **Streak-Based Achievements** (2)
| Achievement | Requirement | Points Reward |
|-------------|------------|---------------|
| Streak Starter | 3-day streak | +75 |
| Streak Master | 30-day streak | +300 |

#### 3. **Sobriety-Based Achievements** (3)
| Achievement | Requirement | Points Reward |
|-------------|------------|---------------|
| First Step | 1 day sober | +50 |
| Week Warrior | 7 days sober | +100 |
| Monthly Champion | 30 days sober | +500 |

#### 4. **Task-Based Achievements** (1)
| Achievement | Requirement | Points Reward |
|-------------|------------|---------------|
| Task Master | Complete 10 tasks | +100 |

#### 5. **Special Achievements** (1)
| Achievement | Requirement | Points Reward |
|-------------|------------|---------------|
| Zero Day Hero | Avoid drinking 50 days | +400 |

### How Achievements Work:

#### Automatic Unlock:
Achievements automatically unlock when you meet the requirements:

```javascript
// Example: Hundred Hero
if (totalPoints >= 100) {
  → Achievement unlocked!
  → +50 bonus points added
  → Badge appears in profile
}
```

#### Achievement Progression:
1. **Complete challenges** → Earn points
2. **Reach milestone** → Achievement unlocks automatically
3. **Bonus points added** → Total points increase
4. **Badge displayed** → Visible in "My Badges"

### How to View Achievements:
1. Go to **Profile Tab**
2. Tap **"My Badges"**
3. See all earned achievements with dates

---

## 🔥 Streaks System

### What is a Streak?
தொடர்ச்சியா drinks avoid பண்ணின நாட்களின் எண்ணிக்கை

### Two Types of Streaks:

#### 1. **Day Streak (Current Streak)**
- தற்போது தொடர்ச்சியா எத்தனை நாள் sober இருக்கீங்க
- ஒரு நாள் drink பண்ணா reset ஆகும்

#### 2. **Best Streak (Longest Streak)**
- இதுவரை அதிகபட்சமா எத்தனை நாள் streak maintain பண்ணீங்க
- இது reset ஆகாது, record மாதிரி இருக்கும்

### How to Build Streaks:

#### Step 1: Log Your Drinks Daily
1. Go to **Journey Tab**
2. Tap **"Log Drinks"**
3. Enter **0 drinks** for today
4. Tap **"Save"**

#### Step 2: Repeat Every Day
- தினமும் 0 drinks log பண்ணுங்க
- Streak automatic-ஆ increase ஆகும்

#### Step 3: Maintain Consistency
```
Day 1: Log 0 drinks → Streak = 1
Day 2: Log 0 drinks → Streak = 2
Day 3: Log 0 drinks → Streak = 3 → "Streak Starter" achievement unlocked! 🎉
```

### Streak Benefits:
- ✅ Unlock streak-based achievements
- ✅ Earn bonus points
- ✅ Track your progress
- ✅ Stay motivated

---

## 🔄 How Everything Works Together

### Complete Flow Example:

#### Day 1: Getting Started
```
1. Sign up → Level 1 (Beginner) - 0 points
2. Complete "Morning Meditation" → +15 points
3. Complete "Journal Entry" → +10 points
4. Log 0 drinks → Streak = 1
5. Total: 25 points, Level 1
```

#### Day 2: Building Momentum
```
1. Complete "Exercise" → +20 points
2. Complete "Gratitude List" → +10 points
3. Log 0 drinks → Streak = 2
4. Total: 55 points, Level 1
```

#### Day 3: First Milestone
```
1. Complete "Nature Walk" → +15 points
2. Complete "Healthy Meal" → +10 points
3. Log 0 drinks → Streak = 3
4. "Streak Starter" achievement unlocked! → +75 points
5. Total: 155 points, Level 2 (Apprentice) 🎉
```

#### Day 7: Major Achievement
```
1. Continue daily challenges
2. Log 0 drinks → Streak = 7
3. "Week Warrior" achievement unlocked! → +100 points
4. Total: 300+ points, Level 3 (Warrior) 🔥
```

### Points Accumulation Timeline:

| Days | Challenges | Achievements | Total Points | Level |
|------|-----------|--------------|--------------|-------|
| 1-2 | 4 challenges | None | 55 | 1 - Beginner |
| 3 | 2 challenges | Streak Starter | 155 | 2 - Apprentice |
| 4-6 | 6 challenges | Hundred Hero | 250 | 2 - Apprentice |
| 7 | 2 challenges | Week Warrior | 350 | 3 - Warrior |
| 10 | 3 challenges | Task Master | 500 | 3 - Warrior |
| 15 | 5 challenges | None | 650 | 4 - Champion |
| 30 | 10 challenges | Monthly Champion, Streak Master | 1,500 | 5 - Master |

---

## 📊 Quick Reference

### Current System Stats:
- **Total Levels**: 7
- **Total Challenges**: 25
- **Total Achievements**: 9
- **Total Points Available**: 2,680+
- **Maximum Level**: Phoenix (5000+ points)

### Points Breakdown:
```
Challenges:        505 points (25 challenges × avg 20 points)
Achievements:    2,175 points (9 achievements)
─────────────────────────────────────────────
Total Available: 2,680+ points
```

### To Reach Each Level:
```
Level 1 → Level 2: Need 100 points (5-10 challenges)
Level 2 → Level 3: Need 200 points (10-15 challenges)
Level 3 → Level 4: Need 300 points (15-20 challenges)
Level 4 → Level 5: Need 400 points (20-25 challenges + achievements)
Level 5 → Level 6: Need 1000 points (achievements required)
Level 6 → Level 7: Need 3000 points (all challenges + achievements)
```

---

## 🎯 Tips for Success

### 1. **Daily Routine**
- Complete 2-3 easy challenges daily (30-45 points/day)
- Log your drinks (0 drinks) to build streak
- Check for new achievements

### 2. **Strategic Challenge Selection**
- Start with easy challenges to build confidence
- Mix different categories for variety
- Save hard challenges for when you have time

### 3. **Maximize Points**
- Complete challenges daily (don't miss days)
- Focus on streak-based achievements (high points)
- Aim for milestone achievements (100, 1000 points)

### 4. **Track Progress**
- Check Profile tab regularly
- Monitor your level progress bar
- View earned badges for motivation

---

## 🐛 Troubleshooting

### Points Not Updating?
1. Pull down to refresh on Home/Profile tabs
2. Close and reopen the app
3. Check if challenge was marked as complete

### Achievements Not Unlocking?
1. Verify you meet the requirements
2. Check "My Badges" in Profile tab
3. Contact support if issue persists

### Streak Reset?
- Streaks reset if you log drinks > 0
- Must log 0 drinks daily to maintain streak
- Best streak is never reset (it's your record)

---

## 📱 Where to Find Everything

### Home Tab
- Current level display
- Total points
- Sober days counter
- Recent achievements

### Challenges Tab
- All available challenges
- Completed count
- Total points earned
- Challenge categories

### Profile Tab
- Level progress bar
- Day streak & Best streak
- Badges count
- "My Badges" button → View all achievements

### Journey Tab
- Log drinks (for streaks)
- Track daily progress
- View history

---

## 🎉 Conclusion

MindFusion-ன் gamification system உங்க recovery journey-ஐ fun & engaging ஆ மாத்தும்!

**Remember:**
- 🎯 Complete challenges daily
- 🔥 Build your streak
- 🏆 Unlock achievements
- 📈 Level up!
- 💪 Stay motivated!

**Your journey matters. Every point counts. Keep going!** 🚀

---

*Last Updated: May 5, 2026*
*Version: 1.0*
