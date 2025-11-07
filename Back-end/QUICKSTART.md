# Mind Fusion Backend - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Prerequisites
- Node.js installed (v14+)
- Supabase account created

### 2. Clone Environment
```bash
cd project
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Set Up Environment Variables

Create `.env` file with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-secret-key-here
PORT=3000
```

### 5. Start Server
```bash
npm run dev
```

You should see:
```
Mind Fusion API running on port 3000
Environment: development
Database: Supabase
```

---

## 🧪 Test the API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test@123",
    "email": "test@example.com"
  }'
```

Save the returned `token` for next steps.

### Log Drink (Replace TOKEN with your token)
```bash
curl -X POST http://localhost:3000/api/drinks/log \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"drinkCount": 0, "notes": "Sober day!"}'
```

### Get Dashboard
```bash
curl http://localhost:3000/api/progress/dashboard \
  -H "Authorization: Bearer TOKEN"
```

---

## 📱 Frontend Integration

For React Native or any frontend:

### 1. Base URL
```javascript
const API_URL = 'http://localhost:3000/api';
```

### 2. Register
```javascript
const response = await fetch(`${API_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'username',
    password: 'password',
    email: 'email@example.com'
  })
});
const data = await response.json();
localStorage.setItem('token', data.token);
```

### 3. Make Authenticated Requests
```javascript
const token = localStorage.getItem('token');
const response = await fetch(`${API_URL}/progress/dashboard`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📊 Database Status

Database is automatically initialized with:
- ✅ 14 tables created
- ✅ Row Level Security enabled
- ✅ Sample data loaded (achievements, tasks, quotes)
- ✅ All indexes created

Check Supabase dashboard to verify tables exist.

---

## 🔑 Key Endpoints by Feature

### Authentication
```
POST   /auth/register
POST   /auth/login
GET    /auth/profile
```

### Tracking
```
POST   /drinks/log
GET    /drinks/logs
POST   /mood/log
GET    /mood/logs
POST   /triggers/log
GET    /triggers/logs
```

### Gamification
```
GET    /gamification/profile
GET    /gamification/achievements
POST   /gamification/check-achievements
```

### Daily Tasks
```
GET    /tasks/daily
POST   /tasks/complete
GET    /tasks/today
```

### Progress Reports
```
GET    /progress/dashboard
GET    /progress/weekly
GET    /progress/monthly
```

See `API_DOCUMENTATION.md` for complete list.

---

## 🐛 Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install
```

### "SUPABASE_URL not found"
- Check `.env` file exists
- Verify Supabase credentials are correct
- File should be in project root

### "Cannot POST /api/auth/register"
- Check server is running
- Verify URL is correct: `http://localhost:3000/api/...`
- Check Content-Type header is set to `application/json`

### Token not working
- Token expires in 30 days
- Login again to get new token
- Include `Bearer ` prefix in Authorization header

---

## 📖 Next Steps

1. Read `README.md` for full documentation
2. Check `API_DOCUMENTATION.md` for all endpoints
3. Explore `src/controllers/` to understand data flow
4. Review `src/routes/` to see route definitions
5. Test all endpoints with Postman or curl

---

## 🎯 Common Tasks

### Add User to Database
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"pass123"}'
```

### Get User Stats
```bash
curl http://localhost:3000/api/gamification/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Daily Entry
```bash
# Log mood
curl -X POST http://localhost:3000/api/mood/log \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"moodType":"happy","moodScore":8}'

# Log drinks
curl -X POST http://localhost:3000/api/drinks/log \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"drinkCount":0}'

# Complete task
curl -X POST http://localhost:3000/api/tasks/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskId":1}'
```

### Check Progress
```bash
curl http://localhost:3000/api/progress/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💡 Tips

- Use Postman or Insomnia for easier API testing
- Token is valid for 30 days
- All timestamps are in ISO 8601 format
- Dates should be in YYYY-MM-DD format
- Points are awarded automatically for various actions

---

## 📞 Support

Check these files in order:
1. `QUICKSTART.md` (this file)
2. `README.md` (full documentation)
3. `API_DOCUMENTATION.md` (complete endpoint reference)
4. Source code in `src/` directory

---

**Ready to help users on their recovery journey! 🚀**
