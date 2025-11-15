# API Integration Setup Guide

## Overview
The frontend has been migrated from Supabase to use Axios with your Node.js backend. All 41 backend APIs are now integrated.

## Environment Configuration

### 1. Create `.env` file
Create a `.env` file in the `Front-end` directory with the following content:

```env
# Backend API Configuration
# For Android Emulator: use http://10.0.2.2:3000/api
# For iOS Simulator: use http://localhost:3000/api
# For Physical Device: use your computer's IP address, e.g., http://192.168.1.168:3000/api

API_BASE_URL=http://192.168.1.168:3000/api
```

### 2. Update IP Address
Replace `192.168.1.168` with your actual computer's IP address:
- **Windows**: Run `ipconfig` in Command Prompt and look for IPv4 Address
- **Mac/Linux**: Run `ifconfig` in Terminal and look for inet address

### 3. Platform-Specific URLs
- **Android Emulator**: `http://10.0.2.2:3000/api`
- **iOS Simulator**: `http://localhost:3000/api`
- **Physical Device**: `http://YOUR_IP_ADDRESS:3000/api`

## Installation

Install the required packages:

```bash
cd Front-end
npm install axios react-native-config
```

For iOS, you may need to run:
```bash
cd ios && pod install && cd ..
```

## API Structure

All APIs are organized in `Front-end/src/api/`:

- `client.ts` - Axios instance with token management
- `auth.ts` - Authentication APIs (3 endpoints)
- `drinks.ts` - Drink tracking APIs (4 endpoints)
- `mood.ts` - Mood tracking APIs (4 endpoints)
- `triggers.ts` - Trigger tracking APIs (4 endpoints)
- `gamification.ts` - Gamification APIs (6 endpoints)
- `tasks.ts` - Tasks APIs (6 endpoints)
- `progress.ts` - Progress APIs (4 endpoints)
- `content.ts` - Content APIs (3 endpoints)
- `sos.ts` - SOS APIs (4 endpoints)
- `settings.ts` - Settings APIs (2 endpoints)
- `health.ts` - Health check API (1 endpoint)
- `index.ts` - Central export file

## Usage

### Import APIs
```typescript
import { register, login, getProfile, logDrink } from '@/src/api';
```

### Example Usage
```typescript
// Register
const response = await register({
  username: 'user123',
  password: 'password123',
  email: 'user@example.com',
  isAnonymous: false
});

// Login
const response = await login({
  username: 'user123',
  password: 'password123'
});

// Log Drink
await logDrink({
  drinkCount: 0,
  logDate: '2025-01-15',
  notes: 'No drinks today'
});
```

## Token Management

Tokens are automatically managed by the Axios client:
- Tokens are stored in AsyncStorage
- Automatically added to request headers
- Automatically cleared on 401 errors

## Backward Compatibility

The old `lib/api.ts` file has been updated to maintain backward compatibility with existing code. All existing imports will continue to work.

## All 41 APIs Integrated

✅ Authentication (3)
✅ Drink Tracking (4)
✅ Mood Tracking (4)
✅ Trigger Tracking (4)
✅ Gamification (6)
✅ Tasks (6)
✅ Progress (4)
✅ Content (3)
✅ SOS (4)
✅ Settings (2)
✅ Health (1)

## Next Steps

1. Create `.env` file with your backend URL
2. Install dependencies: `npm install`
3. Update IP address in `.env` if using physical device
4. Test the connection by running the app

## Troubleshooting

### Connection Issues
- Ensure backend is running on port 3000
- Check firewall settings
- Verify IP address is correct
- For Android emulator, use `10.0.2.2` instead of localhost

### Token Issues
- Tokens are automatically managed
- If authentication fails, check backend JWT configuration
- Clear app data if token issues persist

