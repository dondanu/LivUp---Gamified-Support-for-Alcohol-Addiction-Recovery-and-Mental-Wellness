# Mind Fusion Backend - Complete Setup Guide

## 📋 Project Overview

**Mind Fusion** is a complete gamified alcohol reduction and recovery app backend built with:
- **Node.js** + **Express.js** framework
- **Supabase** (PostgreSQL) database
- **JWT** authentication
- **14 data tables** with Row Level Security
- **41 REST API endpoints**
- **Pre-seeded** reference data (achievements, tasks, quotes, alternatives)

---

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites
```bash
# Check Node.js is installed
node --version  # v14+ required
npm --version
```

### 2. Install Dependencies
```bash
cd project
npm install
```

### 3. Configure Environment
Create `.env` file:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
NODE_ENV=development
```

### 4. Start Server
```bash
npm run dev
```

Expected output:
```
Mind Fusion API running on port 3000
Environment: development
Database: Supabase
```

### 5. Verify
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "API is running",
  "timestamp": "2025-10-31T13:00:00.000Z"
}
```

---

## 🔧 Environment Variables

### Required
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `JWT_SECRET` - Secret for JWT signing

### Optional
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (default: development)

### Where to Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create/Select project
3. Navigate to **Settings** → **API**
4. Copy:
   - Project URL → `SUPABASE_URL`
   - Anon Key → `SUPABASE_ANON_KEY`

---

## 📁 Project Structure

```
project/
├── src/
│   ├── config/
│   │   └── database.js                 # Supabase connection
│   ├── controllers/                    # Business logic (10 files)
│   │   ├── authController.js
│   │   ├── drinkController.js
│   │   ├── moodController.js
│   │   ├── triggerController.js
│   │   ├── gamificationController.js
│   │   ├── tasksController.js
│   │   ├── progressController.js
│   │   ├── contentController.js
│   │   ├── sosController.js
│   │   └── settingsController.js
│   ├── middleware/                     # Middleware (2 files)
│   │   ├── auth.js                    # JWT authentication
│   │   └── validation.js              # Input validation
│   ├── routes/                         # API routes (10 files)
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
│   │   └── helpers.js                 # Utility functions
│   └── server.js                      # Express app setup
├── .env                               # Configuration
├── package.json                       # Dependencies
├── README.md                          # Full documentation
├── QUICKSTART.md                      # Quick setup
├── API_DOCUMENTATION.md               # Complete API reference
└── SETUP_GUIDE.md                     # This file
```

---

## 📊 Database Schema

### Automatically Created Tables (14 total)

**Authentication & User Management**
- `users` - User accounts
- `user_profiles` - Gamification data
- `user_settings` - User preferences

**Tracking Systems**
- `drink_logs` - Drink tracking
- `mood_logs` - Mood tracking
- `trigger_logs` - Trigger tracking

**Gamification**
- `levels` - Progression levels (7 total)
- `achievements` - Achievement badges
- `user_achievements` - Earned achievements

**Daily Activities**
- `daily_tasks` - Task definitions (20 total)
- `user_daily_tasks` - Completed tasks

**Support & Content**
- `healthy_alternatives` - Activity suggestions (25 total)
- `sos_contacts` - Emergency contacts
- `motivational_quotes` - Inspirational content (25 total)

### Security
- ✅ Row Level Security (RLS) enabled
- ✅ User data isolation
- ✅ Public access for reference tables
- ✅ Foreign key constraints
- ✅ Unique constraints
- ✅ Performance indexes

---

## 🔐 Authentication Flow

### 1. Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_recovery",
    "password": "SecurePass123",
    "email": "john@example.com"
  }'
```

Response includes JWT token (valid 30 days).

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_recovery",
    "password": "SecurePass123"
  }'
```

### 3. Use Token
Include in all authenticated requests:
```bash
Authorization: Bearer {token}
```

---

## 🎯 API Endpoints Summary

| Feature | Count | Examples |
|---------|-------|----------|
| **Authentication** | 3 | Register, Login, Profile |
| **Drink Tracking** | 4 | Log, Get, Statistics, Delete |
| **Mood Tracking** | 4 | Log, Get, Statistics, Delete |
| **Trigger Tracking** | 4 | Log, Get, Analysis, Delete |
| **Gamification** | 6 | Profile, Points, Levels, Achievements |
| **Daily Tasks** | 6 | Daily, Complete, Today, Statistics |
| **Progress Reports** | 4 | Weekly, Monthly, Overall, Dashboard |
| **Content** | 3 | Quotes, Alternatives, Random |
| **SOS Support** | 4 | Add, Get, Update, Delete |
| **Settings** | 2 | Get, Update |
| **Health** | 1 | Health Check |
| **TOTAL** | **41** | endpoints |

See **API_DOCUMENTATION.md** for complete endpoint reference.

---

## 💾 Database Operations

### View Tables in Supabase Dashboard
1. Go to your Supabase project
2. Click **SQL Editor**
3. Run: `SELECT * FROM information_schema.tables WHERE table_schema='public';`
4. Or use graphical table browser

### Connect with SQL Client
```bash
# Using psql (PostgreSQL client)
psql postgresql://user:password@db.supabase.co:5432/postgres
```

### Test Database Connection
```bash
curl http://localhost:3000/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

If successful, user created in database.

---

## 🧪 Testing the API

### 1. Create Test User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"testuser",
    "password":"Test@123",
    "email":"test@example.com"
  }'
```

Save the returned `token`.

### 2. Log Drinks (Replace TOKEN)
```bash
curl -X POST http://localhost:3000/api/drinks/log \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"drinkCount": 0, "notes": "Sober day!"}'
```

### 3. Log Mood
```bash
curl -X POST http://localhost:3000/api/mood/log \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"moodType": "happy", "moodScore": 8}'
```

### 4. Complete Task
```bash
curl -X POST http://localhost:3000/api/tasks/complete \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskId": 1}'
```

### 5. View Dashboard
```bash
curl http://localhost:3000/api/progress/dashboard \
  -H "Authorization: Bearer TOKEN"
```

---

## 📱 Frontend Integration

### Register
```javascript
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'user',
    password: 'pass',
    email: 'user@example.com'
  })
});
const { token } = await response.json();
localStorage.setItem('authToken', token);
```

### Make Authenticated Request
```javascript
const token = localStorage.getItem('authToken');
const response = await fetch('http://localhost:3000/api/progress/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Axios Example
```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🔍 Common Tasks

### Get All User Logs
```bash
curl http://localhost:3000/api/drinks/logs \
  -H "Authorization: Bearer TOKEN"
```

### Get Mood Statistics
```bash
curl http://localhost:3000/api/mood/statistics \
  -H "Authorization: Bearer TOKEN"
```

### Get Trigger Analysis
```bash
curl http://localhost:3000/api/triggers/analysis \
  -H "Authorization: Bearer TOKEN"
```

### Get User Achievements
```bash
curl http://localhost:3000/api/gamification/achievements \
  -H "Authorization: Bearer TOKEN"
```

### Get Weekly Progress
```bash
curl http://localhost:3000/api/progress/weekly \
  -H "Authorization: Bearer TOKEN"
```

---

## ⚠️ Troubleshooting

### Server won't start
```bash
# Check port is available
lsof -i :3000

# Try different port
PORT=3001 npm run dev
```

### Database connection error
- ✓ Verify `.env` has correct credentials
- ✓ Check Supabase project is active
- ✓ Test connection: `curl http://localhost:3000/api/health`

### Authentication failing
- ✓ Token expired? Login again
- ✓ Token format correct? Include `Bearer ` prefix
- ✓ Check JWT_SECRET matches

### Registration failing
- ✓ Username already taken?
- ✓ Password too short (min 6)?
- ✓ Email format invalid?

### 404 errors
- ✓ Resource doesn't exist
- ✓ Check endpoint URL spelling
- ✓ Verify authentication token if protected endpoint

---

## 📝 Notes

- **JWT tokens expire in 30 days**
- **All user data is isolated via RLS**
- **Points awarded automatically** for sober days and tasks
- **Achievements unlock at thresholds**
- **Streaks calculated from drink logs**
- **All timestamps in ISO 8601 format**

---

## 🚀 Production Deployment

### Before deploying:
1. Change `JWT_SECRET` to strong random key
2. Set `NODE_ENV=production`
3. Use environment variables from hosting platform
4. Enable HTTPS
5. Set up monitoring/logging
6. Configure CORS for your domain
7. Run security audit

### Recommended Hosting
- **Heroku** (quick start)
- **DigitalOcean** (affordable)
- **AWS/Azure** (enterprise)
- **Railway** (modern)
- **Render** (easy deployment)

---

## 📚 Documentation

- **README.md** - Full overview
- **QUICKSTART.md** - 5-minute setup
- **API_DOCUMENTATION.md** - All 41 endpoints
- **SETUP_GUIDE.md** - This file (detailed setup)

---

## 💡 Tips

- Use Postman or Insomnia for API testing
- Enable Supabase real-time for live updates
- Monitor database queries in Supabase dashboard
- Use browser DevTools Network tab for frontend debugging
- Check server logs for errors: `npm run dev` shows console output

---

## 🎯 Next Steps

1. ✅ Verify server starts
2. ✅ Test registration/login
3. ✅ Create test user
4. ✅ Test core endpoints
5. ✅ Integrate with frontend
6. ✅ Deploy to production

---

## ❓ Questions?

Refer to:
1. API_DOCUMENTATION.md - endpoint details
2. README.md - feature overview
3. Source code in src/ - implementation
4. Supabase docs - database queries
5. Express docs - framework questions

---

**Ready to help users achieve sobriety! 🎉**
