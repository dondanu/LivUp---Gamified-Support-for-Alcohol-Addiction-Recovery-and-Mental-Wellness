# Mind Fusion Backend - Start Here

Welcome! This is the complete backend for the Mind Fusion gamified alcohol recovery app.

## 📖 Reading Guide

Read these in order:

### 1. **QUICKSTART.md** (5 min read)
Start with this file. It has the fastest way to get the server running.

### 2. **API_DOCUMENTATION.md** (reference)
All 41 API endpoints with request/response examples. Bookmark this!

### 3. **SETUP_GUIDE.md** (detailed read)
Comprehensive setup with troubleshooting, database operations, and frontend integration.

### 4. **README.md** (overview)
Full feature overview, project structure, and architecture explanation.

### 5. **PROJECT_SUMMARY.md** (components)
Component breakdown, what's included, and statistics.

### 6. **BACKEND_CHECKLIST.md** (verification)
Implementation checklist showing everything that's complete.

---

## ⚡ TL;DR - Get Running in 3 Steps

```bash
# 1. Install
npm install

# 2. Create .env file with:
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
JWT_SECRET=your_secret
PORT=3000

# 3. Run
npm run dev
```

Done! Server running at `http://localhost:3000`

---

## 🗂️ What's in This Project

- **31 source files** (controllers, routes, middleware)
- **14 database tables** (with security)
- **41 API endpoints** (fully documented)
- **82 pre-seeded records** (ready to use)
- **6 documentation files** (2000+ lines)

---

## 📱 Main Features

✓ User auth (registration, login)
✓ Drink tracking (with streaks)
✓ Mood tracking (6 emotions)
✓ Trigger tracking (pattern analysis)
✓ Gamification (points, levels, achievements)
✓ Daily tasks (20 pre-made tasks)
✓ Progress reports (weekly, monthly, overall)
✓ SOS support (emergency contacts)
✓ Settings & preferences

---

## �� Next Actions

1. **Read** → Open QUICKSTART.md next
2. **Setup** → Follow 3-step installation
3. **Test** → Use curl commands in QUICKSTART.md
4. **Reference** → Use API_DOCUMENTATION.md for endpoints
5. **Deploy** → Follow instructions in SETUP_GUIDE.md

---

## 🆘 Quick Help

**Problem** → **Solution**
- Server won't start → Check .env file, check port 3000 is free
- Can't connect to DB → Verify Supabase credentials in .env
- API returns 401 → Check token format: `Bearer {token}`
- Endpoint not found → Check API_DOCUMENTATION.md
- Still stuck? → Read SETUP_GUIDE.md troubleshooting section

---

## 💡 Pro Tips

- Use Postman or Insomnia for testing APIs
- Save your JWT token for testing authenticated endpoints
- Check API_DOCUMENTATION.md for complete endpoint reference
- Database is auto-configured - nothing to set up
- All data is user-isolated via RLS

---

## 📊 Project Stats

| Item | Count |
|------|-------|
| API Endpoints | 41 |
| Database Tables | 14 |
| Source Files | 31 |
| Documentation Lines | 2000+ |
| Pre-seeded Records | 82 |

---

**Ready? Open QUICKSTART.md and get started! 🎉**

(This file is just navigation. The real work happens in the other docs.)
