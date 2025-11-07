# Complete API Guide - Mind Fusion Backend

TOTAL APIs: 41 Endpoints

Your system has 10 categories. Format aligned to the provided template, adapted to the actual endpoints implemented in this backend.

Base API URL: `http://localhost:3000/api`

Auth: Most endpoints require `Authorization: Bearer <JWT>`.

Note on responses: Unless otherwise specified, errors return JSON like `{"error": "<message>", "details": "<optional details>"}` with appropriate status code.

-------------------------------------------------------------------------------

Step 1: Start Server

• Server URL: http://localhost:3000
• Base API URL: http://localhost:3000/api

-------------------------------------------------------------------------------

All APIs - Numbered List

1. POST  http://localhost:3000/api/auth/register
2. POST  http://localhost:3000/api/auth/login
3. GET   http://localhost:3000/api/content/quote
4. GET   http://localhost:3000/api/content/alternatives
5. GET   http://localhost:3000/api/content/alternative/random
6. GET   http://localhost:3000/api/gamification/levels
7. GET   http://localhost:3000/api/tasks/daily
8. GET   http://localhost:3000/api/health
9. GET   http://localhost:3000/api/auth/profile
10. POST  http://localhost:3000/api/drinks/log
11. GET   http://localhost:3000/api/drinks/logs
12. GET   http://localhost:3000/api/drinks/statistics
13. DELETE http://localhost:3000/api/drinks/:logId
14. POST  http://localhost:3000/api/mood/log
15. GET   http://localhost:3000/api/mood/logs
16. GET   http://localhost:3000/api/mood/statistics
17. DELETE http://localhost:3000/api/mood/:logId
18. POST  http://localhost:3000/api/triggers/log
19. GET   http://localhost:3000/api/triggers/logs
20. GET   http://localhost:3000/api/triggers/analysis
21. DELETE http://localhost:3000/api/triggers/:logId
22. GET   http://localhost:3000/api/gamification/profile
23. POST  http://localhost:3000/api/gamification/points
24. GET   http://localhost:3000/api/gamification/achievements
25. POST  http://localhost:3000/api/gamification/check-achievements
26. PUT   http://localhost:3000/api/gamification/avatar
27. GET   http://localhost:3000/api/settings
28. PUT   http://localhost:3000/api/settings
29. POST  http://localhost:3000/api/tasks/complete
30. GET   http://localhost:3000/api/tasks/completed
31. GET   http://localhost:3000/api/tasks/today
32. GET   http://localhost:3000/api/tasks/statistics
33. DELETE http://localhost:3000/api/tasks/:completionId
34. GET   http://localhost:3000/api/progress/weekly
35. GET   http://localhost:3000/api/progress/monthly
36. GET   http://localhost:3000/api/progress/overall
37. GET   http://localhost:3000/api/progress/dashboard
38. POST  http://localhost:3000/api/sos/contact
39. GET   http://localhost:3000/api/sos/contacts
40. PUT   http://localhost:3000/api/sos/contact/:contactId
41. DELETE http://localhost:3000/api/sos/contact/:contactId

-------------------------------------------------------------------------------

Step 2: Public APIs (No Token Required)

• GET /api/health – API health check
• GET /api/content/quote – Motivational quote
• GET /api/content/alternatives – Healthy alternatives
• GET /api/content/alternative/random – Random alternative
• GET /api/gamification/levels – Levels
• GET /api/tasks/daily – Daily tasks

-------------------------------------------------------------------------------

Step 3: Protected APIs (Token Required)

IMPORTANT: Add this header to ALL protected APIs:
Authorization: Bearer YOUR_JWT_TOKEN_HERE

-------------------------------------------------------------------------------

1) Authentication (`/api/auth`)

- POST http://localhost:3000/api/auth/register (Public)
  - Body (JSON): {"username": string (min 3), "password": string (min 6), "email": string (optional, email), "isAnonymous": boolean (optional, default false)}
  - Headers: Content-Type: application/json
  - Responses:
    - 201: {"message": "User registered successfully", "token": string, "user": {"id": number, "username": string, "email": string|null, "isAnonymous": boolean}}
    - 400: validation error or missing fields
    - 409: username/email already exists
    - 500: failed to create user/profile/settings
  - Example:
    curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"username":"alice","password":"secret123","email":"a@x.com"}'

- POST http://localhost:3000/api/auth/login (Public)
  - Body (JSON): {"username": string, "password": string}
  - Responses:
    - 200: {"message": "Login successful", "token": string, "user": {id, username, email, isAnonymous}}
    - 400: missing fields
    - 401: invalid credentials
  - Example:
    curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"alice","password":"secret123"}'

- GET http://localhost:3000/api/auth/profile (Auth)
  - Responses:
    - 200: {"user": {id, username, email, is_anonymous, created_at}, "profile": user_profiles row}
    - 404: user or profile not found

-------------------------------------------------------------------------------

2) Drinks (`/api/drinks`)

- POST http://localhost:3000/api/drinks/log (Auth)
  - Body (JSON): {"drinkCount": integer >= 0, "logDate": ISO8601 date (optional), "notes": string (optional)}
  - Responses:
    - 200: {"message":"Drink log recorded successfully", "drinkLog": object, "stats": {"currentStreak": number, "totalSoberDays": number, "pointsEarned": number, "totalPoints": number}}
    - 400: invalid drinkCount/date
    - 500: server error
  - Example (JSON):
    {
      "drinkCount": 0,
      "logDate": "2025-11-03",
      "notes": "No drinks today"
    }

- GET http://localhost:3000/api/drinks/logs (Auth)
  - Query: startDate=YYYY-MM-DD (optional), endDate=YYYY-MM-DD (optional), limit=number (default 30)
  - Responses:
    - 200: {"logs": array, "count": number}

- GET http://localhost:3000/api/drinks/statistics (Auth)
  - Responses:
    - 200: {"statistics": {"totalDrinks": number, "totalSoberDays": number, "currentStreak": number, "weeklyDrinks": number, "totalLogs": number}}

- DELETE http://localhost:3000/api/drinks/:logId (Auth)
  - Path: logId (number)
  - Responses:
    - 200: {"message": "Drink log deleted successfully"}
    - 404: not found

-------------------------------------------------------------------------------

3) Mood (`/api/mood`)

- POST http://localhost:3000/api/mood/log (Auth)
  - Body (JSON): {"moodType": one of [happy,sad,stressed,anxious,calm,angry], "moodScore": 1..10, "logDate": ISO date (optional), "notes": string (optional)}
  - Responses:
    - 200: {"message":"Mood logged successfully", "moodLog": object}
    - 400: validation error
  - Example (JSON):
    {
      "moodType": "happy",
      "moodScore": 9,
      "logDate": "2025-11-03",
      "notes": "Great workout"
    }

- GET http://localhost:3000/api/mood/logs (Auth)
  - Query: startDate, endDate, limit (default 30)
  - 200: {"logs": array, "count": number}

- GET http://localhost:3000/api/mood/statistics (Auth)
  - 200: {"statistics": {"averageMoodScore": number, "mostCommonMood": string|null, "moodDistribution": object, "totalLogs": number}}

- DELETE http://localhost:3000/api/mood/:logId (Auth)
  - 200: {"message":"Mood log deleted successfully"} or 404

-------------------------------------------------------------------------------

4) Triggers (`/api/triggers`)

- POST http://localhost:3000/api/triggers/log (Auth)
  - Body (JSON): {"triggerType": one of [stress,party,social,boredom,anxiety,other], "intensity": 1..10, "logDate": ISO date (optional), "notes": string (optional)}
  - 201: {"message":"Trigger logged successfully", "triggerLog": object}
  - 400: validation error
  - Example (JSON):
    {
      "triggerType": "stress",
      "intensity": 7,
      "logDate": "2025-11-03",
      "notes": "Deadline pressure"
    }

- GET http://localhost:3000/api/triggers/logs (Auth)
  - Query: startDate, endDate, limit (default 50)
  - 200: {"logs": array, "count": number}

- GET http://localhost:3000/api/triggers/analysis (Auth)
  - 200: {"analysis": {"mostCommonTrigger": string|null, "averageIntensity": number, "triggerDistribution": object, "triggerAverageIntensities": object, "totalTriggers": number}}

- DELETE http://localhost:3000/api/triggers/:logId (Auth)
  - 200 or 404

-------------------------------------------------------------------------------

5) Gamification (`/api/gamification`)

- GET http://localhost:3000/api/gamification/profile (Auth)
  - 200: {"profile": object, "currentLevel": object, "nextLevel": object|null, "achievements": array, "progressToNextLevel": string(percentage)}
  - 404: profile not found

- POST http://localhost:3000/api/gamification/points (Auth)
  - Body (JSON): {"points": integer >= 1, "reason": string (optional)}
  - 200: {"message":"Points updated successfully", "profile": object, "pointsAdded": number, "reason": string, "leveledUp": boolean, "newLevel": object|null}
  - 400: invalid points
  - Example (JSON):
    {
      "points": 25,
      "reason": "Completed daily challenge"
    }

- GET http://localhost:3000/api/gamification/levels (Public)
  - 200: {"levels": array}

- GET http://localhost:3000/api/gamification/achievements (Auth)
  - 200: {"achievements": array, "totalAchievements": number, "earnedCount": number}

- POST http://localhost:3000/api/gamification/check-achievements (Auth)
  - 200: {"message": string, "newAchievements": array, "pointsAwarded": number}

- PUT http://localhost:3000/api/gamification/avatar (Auth)
  - Body (JSON): {"avatarType": string}
  - 200: {"message":"Avatar updated successfully", "profile": object}
  - 400: avatarType required
  - Example (JSON):
    {
      "avatarType": "warrior"
    }

-------------------------------------------------------------------------------

6) Tasks (`/api/tasks`)

- GET http://localhost:3000/api/tasks/daily (Public)
  - Query: category (optional), limit (default 20)
  - 200: {"tasks": array, "count": number}

- POST http://localhost:3000/api/tasks/complete (Auth)
  - Body (JSON): {"taskId": number, "completionDate": ISO date (optional)}
  - 200: {"message":"Task completed", "completion": object, "profile": object, "pointsAwarded": number}
  - 400: invalid or missing taskId
  - 404: task not found
  - 409: already completed for date
  - Example (JSON):
    {
      "taskId": 3,
      "completionDate": "2025-11-03"
    }

- GET http://localhost:3000/api/tasks/completed (Auth)
  - 200: {"tasks": array}

- GET http://localhost:3000/api/tasks/today (Auth)
  - 200: {"today": YYYY-MM-DD, "completedTasks": array, "availableTasks": array, "completedCount": number, "totalPointsEarnedToday": number}

- GET http://localhost:3000/api/tasks/statistics (Auth)
  - 200: {"statistics": {"totalTasksCompleted": number, "categoryCounts": object}}

- DELETE http://localhost:3000/api/tasks/:completionId (Auth)
  - 200: {"message":"Task marked as not completed"}
  - 404: completion not found

-------------------------------------------------------------------------------

7) Content (`/api/content`) (Public)

- GET http://localhost:3000/api/content/quote
  - 200: {"quote": object} or 404 if none

- GET http://localhost:3000/api/content/alternatives
  - 200: {"alternatives": array} or 404

- GET http://localhost:3000/api/content/alternative/random
  - 200: {"alternative": object}

-------------------------------------------------------------------------------

8) SOS (`/api/sos`) (Auth)

- POST http://localhost:3000/api/sos/contact
  - Body (JSON): {"contactName": string, "contactPhone": string, "relationship": string (optional)}
  - 201: {"message":"SOS contact added successfully", "contact": object}
  - 400: missing fields
  - Example (JSON):
    {
      "contactName": "Alice Johnson",
      "contactPhone": "+1-415-555-0123",
      "relationship": "Friend"
    }

- GET http://localhost:3000/api/sos/contacts
  - 200: {"contacts": array, "count": number}

- PUT http://localhost:3000/api/sos/contact/:contactId
  - Body (JSON): any of {"contactName", "contactPhone", "relationship", "isActive"}
  - 200: {"message":"SOS contact updated successfully", "contact": object}
  - 400: no fields to update
  - 404: not found
  - Example (JSON):
    {
      "contactPhone": "+1-415-555-0199",
      "isActive": true
    }

- DELETE http://localhost:3000/api/sos/contact/:contactId
  - 200: {"message":"SOS contact deleted successfully"}
  - 404: not found

-------------------------------------------------------------------------------

9) Settings (`/api/settings`) (Auth)

- GET http://localhost:3000/api/settings
  - 200: user settings object or 404

- PUT http://localhost:3000/api/settings
  - Body (JSON): {"notificationsEnabled": boolean?, "reminderFrequency": one of [daily,weekly,none]?, "theme": one of [light,dark]?}
  - 200: updated settings object
  - 400: validation error
  - Example (JSON):
    {
      "notificationsEnabled": true,
      "reminderFrequency": "daily",
      "theme": "light"
    }

-------------------------------------------------------------------------------

10) Progress (`/api/progress`) (Auth)

- GET http://localhost:3000/api/progress/weekly
  - 200: {"weeklyReport": {period:{startDate,endDate}, soberDays, totalDrinks, currentStreak, tasksCompleted, pointsEarned, newAchievements, averageMood, drinkLogs, moodLogs, achievements}}

- GET http://localhost:3000/api/progress/monthly
  - 200: {"monthlyReport": similar structure to weekly with monthly aggregations}

- GET http://localhost:3000/api/progress/overall
  - 200: {"overallProgress": {"profile": {...}, "statistics": {daysInApp, totalDrinks, soberDays, tasksCompleted, achievementsEarned, totalAchievements, achievementProgress}, "recentAchievements": array}}

- GET http://localhost:3000/api/progress/dashboard
  - 200: {"dashboard": {"profile": {...}, "today": {drinkLog, moodLog, tasksCompleted}, "recentAchievements": array, "motivationalQuote": object|null}}

-------------------------------------------------------------------------------

11) Health (Public)

- GET http://localhost:3000/api/health
  - 200: {"status": "API is running", "timestamp": ISO string}

-------------------------------------------------------------------------------

Examples: Auth header usage

Authorization: Bearer <your_jwt_token>

curl -H "Authorization: Bearer <token>" http://localhost:3000/api/drinks/logs

