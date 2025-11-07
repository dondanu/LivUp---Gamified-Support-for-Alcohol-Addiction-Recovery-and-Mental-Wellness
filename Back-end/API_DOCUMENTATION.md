# Mind Fusion Backend - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

Request body:
```json
{
  "username": "string (min 3 chars)",
  "password": "string (min 6 chars)",
  "email": "string (optional)",
  "isAnonymous": "boolean (default: false)"
}
```

Response (201):
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string or null",
    "isAnonymous": "boolean"
  }
}
```

### Login
**POST** `/auth/login`

Request body:
```json
{
  "username": "string",
  "password": "string"
}
```

Response (200):
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string or null",
    "isAnonymous": "boolean"
  }
}
```

### Get User Profile
**GET** `/auth/profile`

Response (200):
```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string or null",
    "is_anonymous": "boolean",
    "created_at": "timestamp"
  },
  "profile": {
    "id": "uuid",
    "user_id": "uuid",
    "total_points": "integer",
    "current_streak": "integer",
    "longest_streak": "integer",
    "level_id": "integer",
    "avatar_type": "string",
    "days_sober": "integer",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

---

## 🥤 Drink Tracking Endpoints

### Log Drink
**POST** `/drinks/log`

Request body:
```json
{
  "drinkCount": "integer (>= 0)",
  "logDate": "date string (YYYY-MM-DD, optional)",
  "notes": "string (optional)"
}
```

Response (200):
```json
{
  "message": "Drink log recorded successfully",
  "drinkLog": {
    "id": "uuid",
    "user_id": "uuid",
    "drink_count": "integer",
    "log_date": "date",
    "notes": "string or null",
    "created_at": "timestamp"
  },
  "stats": {
    "currentStreak": "integer",
    "totalSoberDays": "integer",
    "pointsEarned": "integer",
    "totalPoints": "integer"
  }
}
```

### Get Drink Logs
**GET** `/drinks/logs`

Query parameters:
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `limit` (optional): default 30

Response (200):
```json
{
  "logs": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "drink_count": "integer",
      "log_date": "date",
      "notes": "string or null",
      "created_at": "timestamp"
    }
  ],
  "count": "integer"
}
```

### Get Drink Statistics
**GET** `/drinks/statistics`

Response (200):
```json
{
  "statistics": {
    "totalDrinks": "integer",
    "totalSoberDays": "integer",
    "currentStreak": "integer",
    "weeklyDrinks": "integer",
    "totalLogs": "integer"
  }
}
```

### Delete Drink Log
**DELETE** `/drinks/{logId}`

Response (200):
```json
{
  "message": "Drink log deleted successfully"
}
```

---

## 😊 Mood Tracking Endpoints

### Log Mood
**POST** `/mood/log`

Request body:
```json
{
  "moodType": "happy|sad|stressed|anxious|calm|angry",
  "moodScore": "integer (1-10)",
  "logDate": "date string (YYYY-MM-DD, optional)",
  "notes": "string (optional)"
}
```

Response (200):
```json
{
  "message": "Mood logged successfully",
  "moodLog": {
    "id": "uuid",
    "user_id": "uuid",
    "mood_type": "string",
    "mood_score": "integer",
    "log_date": "date",
    "notes": "string or null",
    "created_at": "timestamp"
  }
}
```

### Get Mood Logs
**GET** `/mood/logs`

Query parameters:
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `limit` (optional): default 30

Response (200):
```json
{
  "logs": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "mood_type": "string",
      "mood_score": "integer",
      "log_date": "date",
      "notes": "string or null",
      "created_at": "timestamp"
    }
  ],
  "count": "integer"
}
```

### Get Mood Statistics
**GET** `/mood/statistics`

Response (200):
```json
{
  "statistics": {
    "averageMoodScore": "float",
    "mostCommonMood": "string",
    "moodDistribution": {
      "happy": "integer",
      "sad": "integer",
      "stressed": "integer",
      "anxious": "integer",
      "calm": "integer",
      "angry": "integer"
    },
    "totalLogs": "integer"
  }
}
```

### Delete Mood Log
**DELETE** `/mood/{logId}`

Response (200):
```json
{
  "message": "Mood log deleted successfully"
}
```

---

## 🎯 Trigger Tracking Endpoints

### Log Trigger
**POST** `/triggers/log`

Request body:
```json
{
  "triggerType": "stress|party|social|boredom|anxiety|other",
  "intensity": "integer (1-10)",
  "logDate": "date string (YYYY-MM-DD, optional)",
  "notes": "string"
}
```

Response (201):
```json
{
  "message": "Trigger logged successfully",
  "triggerLog": {
    "id": "uuid",
    "user_id": "uuid",
    "trigger_type": "string",
    "log_date": "date",
    "intensity": "integer",
    "notes": "string",
    "created_at": "timestamp"
  }
}
```

### Get Trigger Logs
**GET** `/triggers/logs`

Query parameters:
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `limit` (optional): default 50

Response (200):
```json
{
  "logs": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "trigger_type": "string",
      "log_date": "date",
      "intensity": "integer",
      "notes": "string",
      "created_at": "timestamp"
    }
  ],
  "count": "integer"
}
```

### Get Trigger Analysis
**GET** `/triggers/analysis`

Response (200):
```json
{
  "analysis": {
    "mostCommonTrigger": "string",
    "averageIntensity": "float",
    "triggerDistribution": {
      "stress": "integer",
      "party": "integer",
      "social": "integer",
      "boredom": "integer",
      "anxiety": "integer",
      "other": "integer"
    },
    "triggerAverageIntensities": {
      "stress": "float",
      "party": "float",
      "social": "float",
      "boredom": "float",
      "anxiety": "float",
      "other": "float"
    },
    "totalTriggers": "integer"
  }
}
```

### Delete Trigger Log
**DELETE** `/triggers/{logId}`

Response (200):
```json
{
  "message": "Trigger log deleted successfully"
}
```

---

## 🏆 Gamification Endpoints

### Get User Profile
**GET** `/gamification/profile`

Response (200):
```json
{
  "profile": {
    "id": "uuid",
    "user_id": "uuid",
    "total_points": "integer",
    "current_streak": "integer",
    "longest_streak": "integer",
    "level_id": "integer",
    "avatar_type": "string",
    "days_sober": "integer",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "currentLevel": {
    "id": "integer",
    "level_name": "string",
    "points_required": "integer",
    "avatar_unlock": "string",
    "description": "string"
  },
  "nextLevel": {
    "id": "integer",
    "level_name": "string",
    "points_required": "integer",
    "avatar_unlock": "string",
    "description": "string"
  },
  "progressToNextLevel": "float (0-100)"
}
```

### Update User Points
**POST** `/gamification/points`

Request body:
```json
{
  "points": "integer (> 0)",
  "reason": "string (optional)"
}
```

Response (200):
```json
{
  "message": "Points updated successfully",
  "profile": { ... },
  "pointsAdded": "integer",
  "reason": "string",
  "leveledUp": "boolean",
  "newLevel": { ... } or null
}
```

### Get Levels
**GET** `/gamification/levels`

Response (200):
```json
{
  "levels": [
    {
      "id": "integer",
      "level_name": "string",
      "points_required": "integer",
      "avatar_unlock": "string",
      "description": "string"
    }
  ]
}
```

### Get Achievements
**GET** `/gamification/achievements`

Response (200):
```json
{
  "achievements": [
    {
      "id": "integer",
      "achievement_name": "string",
      "description": "string",
      "icon": "string",
      "points_reward": "integer",
      "requirement_type": "string",
      "requirement_value": "integer",
      "earned": "boolean"
    }
  ],
  "totalAchievements": "integer",
  "earnedCount": "integer"
}
```

### Check and Award Achievements
**POST** `/gamification/check-achievements`

Response (200):
```json
{
  "message": "New achievements unlocked!|No new achievements",
  "newAchievements": [
    {
      "id": "integer",
      "achievement_name": "string",
      "description": "string",
      "icon": "string",
      "points_reward": "integer",
      "requirement_type": "string",
      "requirement_value": "integer"
    }
  ],
  "pointsAwarded": "integer"
}
```

### Update Avatar
**PUT** `/gamification/avatar`

Request body:
```json
{
  "avatarType": "string"
}
```

Response (200):
```json
{
  "message": "Avatar updated successfully",
  "profile": { ... }
}
```

---

## ✅ Daily Tasks Endpoints

### Get Daily Tasks
**GET** `/tasks/daily`

Query parameters:
- `category` (optional): health|mental|social|hobby
- `limit` (optional): default 20

Response (200):
```json
{
  "tasks": [
    {
      "id": "integer",
      "task_name": "string",
      "description": "string",
      "points_reward": "integer",
      "category": "string",
      "is_active": "boolean"
    }
  ],
  "count": "integer"
}
```

### Complete Task
**POST** `/tasks/complete`

Request body:
```json
{
  "taskId": "integer",
  "completionDate": "date string (YYYY-MM-DD, optional)"
}
```

Response (201):
```json
{
  "message": "Task completed successfully",
  "completion": { ... },
  "pointsEarned": "integer",
  "totalPoints": "integer"
}
```

### Get User Completed Tasks
**GET** `/tasks/completed`

Query parameters:
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `limit` (optional): default 50

Response (200):
```json
{
  "completedTasks": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "task_id": "integer",
      "completion_date": "date",
      "completed_at": "timestamp",
      "daily_tasks": { ... }
    }
  ],
  "count": "integer"
}
```

### Get Today's Progress
**GET** `/tasks/today`

Response (200):
```json
{
  "today": "date",
  "completedTasks": [ ... ],
  "availableTasks": [ ... ],
  "completedCount": "integer",
  "totalPointsEarnedToday": "integer"
}
```

### Get Task Statistics
**GET** `/tasks/statistics`

Response (200):
```json
{
  "statistics": {
    "totalTasksCompleted": "integer",
    "categoryCounts": {
      "health": "integer",
      "mental": "integer",
      "social": "integer",
      "hobby": "integer"
    },
    "totalPointsFromTasks": "integer",
    "tasksCompletedLast7Days": "integer"
  }
}
```

### Uncomplete Task
**DELETE** `/tasks/{completionId}`

Response (200):
```json
{
  "message": "Task uncompleted successfully",
  "pointsDeducted": "integer",
  "totalPoints": "integer"
}
```

---

## 💡 Content Endpoints

### Get Motivational Quote
**GET** `/content/quote`

Query parameters:
- `category` (optional): inspiration|success|recovery

Response (200):
```json
{
  "quote": {
    "id": "integer",
    "quote_text": "string",
    "author": "string",
    "category": "string",
    "is_active": "boolean"
  }
}
```

### Get Healthy Alternatives
**GET** `/content/alternatives`

Query parameters:
- `category` (optional): exercise|food|games|entertainment|social|hobby|creative|relaxation
- `limit` (optional): default 10

Response (200):
```json
{
  "alternatives": [
    {
      "id": "integer",
      "activity_name": "string",
      "description": "string",
      "category": "string",
      "icon": "string"
    }
  ],
  "count": "integer"
}
```

### Get Random Alternative
**GET** `/content/alternative/random`

Query parameters:
- `category` (optional)

Response (200):
```json
{
  "alternative": {
    "id": "integer",
    "activity_name": "string",
    "description": "string",
    "category": "string",
    "icon": "string"
  }
}
```

---

## 🆘 SOS Endpoints

### Add SOS Contact
**POST** `/sos/contact`

Request body:
```json
{
  "contactName": "string",
  "contactPhone": "string",
  "relationship": "string (optional)"
}
```

Response (201):
```json
{
  "message": "SOS contact added successfully",
  "contact": {
    "id": "uuid",
    "user_id": "uuid",
    "contact_name": "string",
    "contact_phone": "string",
    "relationship": "string or null",
    "is_active": "boolean",
    "created_at": "timestamp"
  }
}
```

### Get SOS Contacts
**GET** `/sos/contacts`

Response (200):
```json
{
  "contacts": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "contact_name": "string",
      "contact_phone": "string",
      "relationship": "string or null",
      "is_active": "boolean",
      "created_at": "timestamp"
    }
  ],
  "count": "integer"
}
```

### Update SOS Contact
**PUT** `/sos/contact/{contactId}`

Request body (all optional):
```json
{
  "contactName": "string",
  "contactPhone": "string",
  "relationship": "string",
  "isActive": "boolean"
}
```

Response (200):
```json
{
  "message": "SOS contact updated successfully",
  "contact": { ... }
}
```

### Delete SOS Contact
**DELETE** `/sos/contact/{contactId}`

Response (200):
```json
{
  "message": "SOS contact deleted successfully"
}
```

---

## ⚙️ Settings Endpoints

### Get User Settings
**GET** `/settings/`

Response (200):
```json
{
  "settings": {
    "id": "uuid",
    "user_id": "uuid",
    "notifications_enabled": "boolean",
    "daily_reminder_time": "time or null",
    "reminder_frequency": "daily|weekly|none",
    "theme": "light|dark",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### Update User Settings
**PUT** `/settings/`

Request body (all optional):
```json
{
  "notificationsEnabled": "boolean",
  "dailyReminderTime": "HH:MM:SS",
  "reminderFrequency": "daily|weekly|none",
  "theme": "light|dark"
}
```

Response (200):
```json
{
  "message": "Settings updated successfully",
  "settings": { ... }
}
```

---

## 📊 Progress Endpoints

### Get Weekly Progress
**GET** `/progress/weekly`

Response (200):
```json
{
  "weeklyReport": {
    "period": {
      "startDate": "date",
      "endDate": "date"
    },
    "soberDays": "integer",
    "totalDrinks": "integer",
    "currentStreak": "integer",
    "tasksCompleted": "integer",
    "pointsEarned": "integer",
    "newAchievements": "integer",
    "averageMood": "float",
    "drinkLogs": [ ... ],
    "moodLogs": [ ... ],
    "achievements": [ ... ]
  }
}
```

### Get Monthly Progress
**GET** `/progress/monthly`

Response (200):
```json
{
  "monthlyReport": {
    "period": {
      "startDate": "date",
      "endDate": "date"
    },
    "soberDays": "integer",
    "totalDrinks": "integer",
    "currentStreak": "integer",
    "longestStreak": "integer",
    "totalDaysSober": "integer",
    "tasksCompleted": "integer",
    "tasksByCategory": { ... },
    "pointsEarned": "integer",
    "totalPoints": "integer",
    "currentLevel": "integer",
    "averageMood": "float",
    "triggerCounts": { ... },
    "moodLogsCount": "integer",
    "triggerLogsCount": "integer"
  }
}
```

### Get Overall Progress
**GET** `/progress/overall`

Response (200):
```json
{
  "overallProgress": {
    "profile": {
      "totalPoints": "integer",
      "currentStreak": "integer",
      "longestStreak": "integer",
      "daysSober": "integer",
      "level": { ... },
      "avatar": "string"
    },
    "statistics": {
      "daysInApp": "integer",
      "totalDrinks": "integer",
      "soberDays": "integer",
      "tasksCompleted": "integer",
      "achievementsEarned": "integer",
      "totalAchievements": "integer",
      "achievementProgress": "float"
    },
    "recentAchievements": [ ... ]
  }
}
```

### Get Dashboard Data
**GET** `/progress/dashboard`

Response (200):
```json
{
  "dashboard": {
    "profile": {
      "totalPoints": "integer",
      "currentStreak": "integer",
      "daysSober": "integer",
      "level": { ... },
      "avatar": "string"
    },
    "today": {
      "drinkLog": { ... } or null,
      "moodLog": { ... } or null,
      "tasksCompleted": "integer"
    },
    "recentAchievements": [ ... ],
    "motivationalQuote": { ... }
  }
}
```

---

## Health Check

### API Health
**GET** `/health`

Response (200):
```json
{
  "status": "API is running",
  "timestamp": "ISO timestamp"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": "Additional details (development only)"
}
```

Common status codes:
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (invalid token)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_secret_key
PORT=3000
```

3. Run the server:
```bash
npm start
```

The API will be available at `http://localhost:3000/api`
