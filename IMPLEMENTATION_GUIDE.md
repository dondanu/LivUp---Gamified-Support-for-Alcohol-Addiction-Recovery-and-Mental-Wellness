# Implementation Guide - Professional Standards

This guide helps you implement the critical improvements identified in the professional audit.

## 🚀 Quick Start - Phase 1 (Critical Fixes)

### 1. Install New Dependencies

```bash
cd Back-end
npm install --save-dev eslint prettier jest nodemon supertest
```

### 2. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your actual values
# IMPORTANT: Generate a secure JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Run Linter and Formatter

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### 5. Fix Frontend Error Handling

The error suppression in `App.tsx` has been removed and replaced with proper error boundaries.

**What changed**:
- ❌ Removed global error suppression
- ✅ Added ErrorBoundary component
- ✅ Only ignoring specific known warnings
- ✅ Errors now properly displayed in development

**Test it**:
```typescript
// Throw a test error to see the error boundary
throw new Error('Test error');
```

---

## 📦 Docker Setup

### Build and Run with Docker

```bash
cd Back-end

# Build the image
npm run docker:build

# Run with docker-compose (includes MySQL)
npm run docker:run

# Stop containers
npm run docker:stop
```

### Manual Docker Commands

```bash
# Build for production
docker build -t mind-fusion-backend --target production .

# Build for development
docker build -t mind-fusion-backend-dev --target development .

# Run production container
docker run -p 3000:3000 --env-file .env mind-fusion-backend

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop and remove
docker-compose down
```

---

## 🔄 CI/CD Setup (GitHub Actions)

### Enable GitHub Actions

1. Push your code to GitHub
2. Go to repository Settings → Actions → General
3. Enable "Allow all actions and reusable workflows"
4. Add secrets in Settings → Secrets and variables → Actions:
   - `JWT_SECRET`: Your JWT secret key

### What the CI Pipeline Does

On every push to `main` or `develop`:
1. ✅ Runs linter
2. ✅ Runs all tests
3. ✅ Checks code formatting
4. ✅ Uploads coverage to Codecov
5. ✅ Validates build

### View CI Results

- Go to your repository → Actions tab
- Click on any workflow run to see details
- Green checkmark = all tests passed
- Red X = something failed

---

## 🧪 Writing Tests

### Test Structure

```javascript
// __tests__/controllers/exampleController.test.js
const { functionToTest } = require('../../src/controllers/exampleController');
const { query, queryOne } = require('../../src/config/database');

jest.mock('../../src/config/database');

describe('Example Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    req.body = { data: 'test' };
    queryOne.mockResolvedValue({ data: { id: 1 } });

    // Act
    await functionToTest(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});
```

### Run Specific Tests

```bash
# Run tests for a specific file
npm test -- authController.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="should register"

# Run tests in watch mode
npm run test:watch
```

---

## 📝 Code Quality Workflow

### Before Committing

```bash
# 1. Format your code
npm run format

# 2. Run linter
npm run lint:fix

# 3. Run tests
npm test

# 4. Check everything passes
npm run format:check && npm run lint && npm test
```

### Set Up Pre-commit Hooks (Optional)

```bash
# Install husky
npm install --save-dev husky lint-staged

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "cd Back-end && npm run lint && npm test"
```

---

## 🔍 Debugging

### View Logs

```bash
# Docker logs
docker-compose logs -f backend

# Application logs (when running locally)
npm run dev
```

### Debug Tests

```javascript
// Add console.log in tests
it('should do something', async () => {
  console.log('Request body:', req.body);
  await functionToTest(req, res);
  console.log('Response:', res.json.mock.calls);
});
```

### Debug API Requests

```bash
# Test endpoint with curl
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","email":"test@example.com"}'

# Test with authentication
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Monitoring Test Coverage

### View Coverage Report

```bash
# Run tests with coverage
npm test -- --coverage

# Open HTML report
# Windows
start coverage/lcov-report/index.html

# Mac
open coverage/lcov-report/index.html

# Linux
xdg-open coverage/lcov-report/index.html
```

### Coverage Goals

- **Statements**: 70%+
- **Branches**: 70%+
- **Functions**: 70%+
- **Lines**: 70%+

---

## 🚨 Common Issues

### Issue: Tests Failing

**Solution**:
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Linter Errors

**Solution**:
```bash
# Auto-fix most issues
npm run lint:fix

# If still failing, check .eslintrc.json rules
```

### Issue: Docker Build Fails

**Solution**:
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t mind-fusion-backend .
```

### Issue: Database Connection Fails

**Solution**:
```bash
# Check MySQL is running
docker-compose ps

# Restart MySQL
docker-compose restart mysql

# Check logs
docker-compose logs mysql
```

---

## 📚 Next Steps

After completing Phase 1, move to:

1. **Phase 2**: Write more tests (target 70% coverage)
2. **Phase 3**: Set up staging environment
3. **Phase 4**: Add API versioning and pagination
4. **Phase 5**: Implement caching and monitoring

See `PROFESSIONAL_AUDIT_REPORT.md` for detailed action plan.

---

## 🆘 Getting Help

- Check `PROFESSIONAL_AUDIT_REPORT.md` for detailed analysis
- Review test examples in `__tests__/` directory
- Check CI logs in GitHub Actions tab
- Review Docker logs: `docker-compose logs -f`

---

## ✅ Checklist

Before pushing to production:

- [ ] All tests passing (70%+ coverage)
- [ ] Linter passing (no errors)
- [ ] Code formatted (Prettier)
- [ ] CI/CD pipeline green
- [ ] Docker build successful
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Health check endpoint working
- [ ] Error tracking configured
- [ ] Monitoring set up
