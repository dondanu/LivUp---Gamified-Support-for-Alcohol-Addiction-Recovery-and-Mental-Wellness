# Mind Fusion - Backend API

A comprehensive Node.js + Express backend for a gamified alcohol reduction and recovery app with Supabase database integration.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Server](#running-the-server)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Folder Structure](#folder-structure)

---

## ✨ Features

### Authentication & User Management
- User registration with optional anonymous mode
- Secure login with JWT token-based authentication
- User profile management with gamification data

### Drink Tracking
- Log daily drink consumption
- Track sober days and streaks
- Calculate drinking patterns and statistics

### Mood & Trigger Tracking
- Daily mood logging (6 emotions: happy, sad, stressed, anxious, calm, angry)
- Trigger identification (stress, party, social, boredom, anxiety)
- Pattern analysis for better self-awareness

### Gamification System
- Point system for achievements
- Streak tracking (consecutive sober days)
- 7-level progression system (Beginner → Sober Hero)
- Achievement badges with specific milestones
- Avatar customization based on performance

### Daily Tasks & Challenges
- 20+ predefined daily tasks across 4 categories
- Task completion tracking with points reward
- Category-based task filtering (health, mental, social, hobby)

### Support System
- SOS emergency contact management
- Motivational quotes and inspiration content
- Healthy alternatives to drinking (25+ activities)

### Progress Reporting
- Weekly progress summaries
- Monthly detailed analytics
- Overall achievement tracking
- Dashboard with real-time stats

### User Settings
- Notification preferences
- Daily reminder scheduling
- Theme selection (light/dark)

---

## 🗂️ Project Structure

```
project/
├── src/
│   ├── config/
│   │   └── database.js           # Supabase connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── drinkController.js    # Drink tracking
│   │   ├── moodController.js     # Mood tracking
│   │   ├── triggerController.js  # Trigger tracking
│   │   ├── gamificationController.js  # Points, levels, achievements
│   │   ├── tasksController.js    # Daily tasks management
│   │   ├── progressController.js # Progress reports
│   │   ├── contentController.js  # Quotes, alternatives
│   │   ├── sosController.js      # Emergency contacts
│   │   └── settingsController.js # User settings
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   └── validation.js         # Input validation
│   ├── routes/
│   │   ├── auth.js
│   │   ├── drinks.js
│   │   ├── mood.js
│   │   ├── triggers.js
│   │   ├── gamification.js
│   │   ├── tasks.js
│   │   ├── progress.js
│   │   ├── content.js
│   │   ├── sos.js
│   │   └── settings.js
│   ├── utils/
│   │   └── helpers.js            # Utility functions
│   └── server.js                 # Express app setup
├── API_DOCUMENTATION.md          # Complete API docs
├── README.md                      # This file
├── package.json
└── .env

Database:
├── Supabase PostgreSQL
├── 14 tables
├── Row Level Security (RLS) enabled
└── Comprehensive role-based access
```

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Environment**: dotenv
- **CORS**: cors

---

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Supabase account

### Steps

1. **Clone or setup the project**
   ```bash
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (see Environment Setup below)

4. **Initialize database** (schema already created)

---

## ⚙️ Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=3000

# Environment
NODE_ENV=development
```

### Getting Supabase Credentials

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and Anon Key
4. Paste into `.env`

---

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Expected Output
```
Mind Fusion API running on port 3000
Environment: development
Database: Supabase
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "API is running",
  "timestamp": "2025-10-31T12:00:00.000Z"
}
```

---

## 🗄️ Database Schema

### Core Tables (14 total)

1. **users** - User authentication and basic info
2. **user_profiles** - Gamification data and progress
3. **drink_logs** - Daily drink tracking
4. **mood_logs** - Daily mood tracking
5. **trigger_logs** - Drinking trigger identification
6. **levels** - Level progression system
7. **achievements** - Achievement definitions
8. **user_achievements** - User earned achievements
9. **daily_tasks** - Available daily tasks
10. **user_daily_tasks** - User task completions
11. **healthy_alternatives** - Activity suggestions
12. **sos_contacts** - Emergency contact list
13. **motivational_quotes** - Inspiration content
14. **user_settings** - User preferences

### Security Features
- **Row Level Security (RLS)** enabled on all tables
- **User data isolation** - users can only access their own data
- **Public read access** for reference tables (levels, tasks, quotes, alternatives)
- **Foreign key constraints** for data integrity
- **Unique constraints** to prevent duplicates

### Indexes for Performance
- User IDs for faster queries
- Log dates for time-range searches
- Completion dates for timeline analysis

---

## 🔑 API Endpoints

All endpoints require authentication except for:
- `POST /auth/register`
- `POST /auth/login`
- `GET /gamification/levels`
- `GET /tasks/daily`
- `GET /content/quote`
- `GET /content/alternatives`
- `GET /content/alternative/random`

### Quick Reference

| Category | Endpoints | Count |
|----------|-----------|-------|
| Authentication | Register, Login, Profile | 3 |
| Drink Tracking | Log, Get, Delete, Statistics | 4 |
| Mood Tracking | Log, Get, Delete, Statistics | 4 |
| Trigger Tracking | Log, Get, Delete, Analysis | 4 |
| Gamification | Profile, Points, Levels, Achievements | 6 |
| Tasks | Daily, Complete, Progress, Statistics | 6 |
| Progress Reports | Weekly, Monthly, Overall, Dashboard | 4 |
| Content | Quotes, Alternatives, Random | 3 |
| SOS Support | Add, Get, Update, Delete Contacts | 4 |
| Settings | Get, Update | 2 |
| Health | Health Check | 1 |
| **TOTAL** | | **41** |

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete endpoint details.

---

## 🔐 Authentication

### Flow

1. **Register** - Create new user account
   ```bash
   POST /api/auth/register
   Body: { username, password, email, isAnonymous }
   Returns: token + user data
   ```

2. **Login** - Get authentication token
   ```bash
   POST /api/auth/login
   Body: { username, password }
   Returns: token + user data
   ```

3. **Use Token** - Include in all requests
   ```bash
   Authorization: Bearer {token}
   ```

### Token Details
- **Type**: JWT (JSON Web Token)
- **Expiration**: 30 days
- **Payload**: userId, username

---

## 🔄 Data Flow Example

### User Registration & First Day

```
1. User registers
   POST /auth/register
   → Creates user, profile, settings

2. User logs mood
   POST /mood/log
   → Records mood (happy, 8/10)
   → System: +5 points (daily bonus)

3. User logs drinks
   POST /drinks/log
   → 0 drinks today
   → System: +10 points (sober day)
   → Updates streak: 1 day

4. User completes task
   POST /tasks/complete
   → Completes "Morning Exercise"
   → System: +15 points, task tracked

5. User checks achievements
   GET /gamification/check-achievements
   → Awards "First Step" badge: +20 points

6. User views dashboard
   GET /progress/dashboard
   → Displays all stats, recent achievements, motivational quote
```

---

## 📊 Database Seeding

Reference data is pre-loaded in the database migration:

- **7 Levels** - Beginner to Sober Hero
- **15 Achievements** - Various milestone badges
- **20 Daily Tasks** - Across 4 categories
- **25 Healthy Alternatives** - Activity suggestions
- **25 Motivational Quotes** - Inspiration content

---

## ❌ Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "details": "Additional info (development only)"
}
```

### Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/POST/PUT |
| 201 | Created | New resource created |
| 400 | Bad Request | Invalid input validation |
| 401 | Unauthorized | Missing auth token |
| 403 | Forbidden | Invalid token |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (duplicate username) |
| 500 | Server Error | Database or system error |

---

## 🔧 Development

### Adding New Features

1. **Create controller** in `src/controllers/`
2. **Create routes** in `src/routes/`
3. **Mount routes** in `src/server.js`
4. **Add validation** in route file (express-validator)
5. **Test endpoints** with curl or Postman

### Database Migrations

New migrations can be added via Supabase dashboard:
1. Go to SQL Editor
2. Run migration script
3. All tables have RLS enabled by default

---

## 📝 Example Requests

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_recovery",
    "password": "secure123",
    "email": "john@example.com",
    "isAnonymous": false
  }'
```

### Log Drink
```bash
curl -X POST http://localhost:3000/api/drinks/log \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "drinkCount": 0,
    "notes": "Had a great sober day!"
  }'
```

### Complete Task
```bash
curl -X POST http://localhost:3000/api/tasks/complete \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 1
  }'
```

### Get Dashboard
```bash
curl -X GET http://localhost:3000/api/progress/dashboard \
  -H "Authorization: Bearer your_token"
```

---

## 🚦 Testing Checklist

After deployment, verify:

- [ ] Server starts without errors
- [ ] Health check endpoint responds
- [ ] Registration creates user and profile
- [ ] Login returns valid token
- [ ] Token can authenticate requests
- [ ] Drink logging updates streak
- [ ] Tasks award points correctly
- [ ] Achievements unlock at thresholds
- [ ] Progress reports calculate correctly
- [ ] Mood tracking stores data
- [ ] Trigger analysis identifies patterns

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [JWT Introduction](https://jwt.io/introduction)
- [REST API Best Practices](https://restfulapi.net/)

---

## 📄 License

ISC

---

## 🤝 Support

For issues or questions about the backend:
1. Check API_DOCUMENTATION.md
2. Review error messages carefully
3. Check .env configuration
4. Verify Supabase connection
5. Check browser console for detailed errors

---

**Happy coding! Help users build healthier lives through gamification! 🎯**
