# Quick Reference Card

## 🚀 Common Commands

### Backend Development
```bash
cd Back-end

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Check code quality
npm run lint
npm run format:check

# Fix code quality issues
npm run lint:fix
npm run format

# Run everything
npm run lint && npm run format:check && npm test
```

### Docker
```bash
cd Back-end

# Start all services (backend + MySQL)
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend

# Rebuild containers
docker-compose up --build
```

### Frontend Development
```bash
cd Front-end

# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## 📁 Important Files

### Configuration
- `Back-end/.env` - Environment variables (DO NOT COMMIT)
- `Back-end/.env.example` - Template for .env
- `Back-end/.eslintrc.json` - Linting rules
- `Back-end/.prettierrc.json` - Formatting rules
- `Back-end/jest.config.js` - Test configuration

### Docker
- `Back-end/Dockerfile` - Container definition
- `Back-end/docker-compose.yml` - Multi-container setup
- `Back-end/.dockerignore` - Files to exclude from image

### CI/CD
- `.github/workflows/backend-ci.yml` - Automated testing

### Documentation
- `PROFESSIONAL_AUDIT_REPORT.md` - Full analysis
- `IMPLEMENTATION_GUIDE.md` - How to implement
- `PROFESSIONAL_IMPROVEMENTS_SUMMARY.md` - What changed
- `SECURITY_FIXES_SUMMARY.md` - Security improvements

---

## 🧪 Testing

### Run Specific Tests
```bash
# Run one test file
npm test -- authController.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should register"

# Run with coverage
npm test -- --coverage

# Update snapshots
npm test -- -u
```

### Write a Test
```javascript
describe('Feature', () => {
  it('should do something', async () => {
    // Arrange
    const input = { data: 'test' };
    
    // Act
    const result = await functionToTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

---

## 🔍 Debugging

### View Logs
```bash
# Docker logs
docker-compose logs -f backend

# Follow specific service
docker-compose logs -f mysql

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Test API Endpoints
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","email":"test@test.com"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Get profile (with token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Common Issues

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### "Tests failing"
```bash
npx jest --clearCache
npm test
```

### "Docker build fails"
```bash
docker system prune -a
docker-compose build --no-cache
```

### "Database connection error"
```bash
docker-compose restart mysql
docker-compose logs mysql
```

---

## 📊 Project Status

### Current Score: 6.2/10

| Category | Score | Status |
|----------|-------|--------|
| Structure | 8/10 | ✅ Good |
| Testing | 2/10 | ❌ Critical |
| Security | 7/10 | ✅ Good |
| Documentation | 8/10 | ✅ Good |
| Deployment | 3/10 | ⚠️ Needs Work |

### To Reach Production (10/10)
- [ ] Write tests (70%+ coverage)
- [ ] Set up monitoring
- [ ] Add error tracking
- [ ] Create deployment docs
- [ ] Security audit
- [ ] Load testing

---

## 🎯 Next Actions

### Today (30 min)
1. Install dependencies: `npm install`
2. Copy .env: `cp .env.example .env`
3. Run tests: `npm test`

### This Week (5 hours)
1. Read audit report (30 min)
2. Write tests for auth (2 hours)
3. Write tests for other controllers (2 hours)
4. Set up GitHub Actions (30 min)

### This Month (40 hours)
1. Achieve 70% test coverage (20 hours)
2. Add monitoring (5 hours)
3. Create deployment docs (5 hours)
4. Security improvements (5 hours)
5. Performance optimization (5 hours)

---

## 📚 Resources

### Documentation
- Jest: https://jestjs.io/
- ESLint: https://eslint.org/
- Docker: https://docs.docker.com/
- GitHub Actions: https://docs.github.com/en/actions

### Your Docs
- Full audit: `PROFESSIONAL_AUDIT_REPORT.md`
- Implementation: `IMPLEMENTATION_GUIDE.md`
- Summary: `PROFESSIONAL_IMPROVEMENTS_SUMMARY.md`

---

## ✅ Pre-Commit Checklist

Before committing code:
- [ ] Tests pass: `npm test`
- [ ] Linter passes: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] No console.logs in production code
- [ ] Environment variables in .env (not hardcoded)
- [ ] Documentation updated

---

## 🆘 Getting Help

1. Check error message carefully
2. Search in documentation files
3. Check GitHub Actions logs
4. Review Docker logs
5. Test API with curl
6. Check database connection

---

## 💡 Pro Tips

1. **Always run tests before committing**
   ```bash
   npm test && git commit
   ```

2. **Use watch mode during development**
   ```bash
   npm run test:watch
   ```

3. **Check coverage regularly**
   ```bash
   npm test -- --coverage
   open coverage/lcov-report/index.html
   ```

4. **Format code automatically**
   ```bash
   npm run format
   ```

5. **Use Docker for consistent environment**
   ```bash
   docker-compose up
   ```

---

## 🎓 Key Learnings

1. **Testing is not optional** - It's essential for production
2. **Error suppression is dangerous** - Use error boundaries instead
3. **Code quality tools save time** - Catch bugs before they happen
4. **CI/CD automates quality** - Tests run on every commit
5. **Docker ensures consistency** - Same environment everywhere

---

**Remember**: Professional code is tested, documented, and maintainable! 🚀
