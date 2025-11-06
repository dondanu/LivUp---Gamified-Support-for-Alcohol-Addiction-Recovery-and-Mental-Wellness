# LivUp Mobile - React Native CLI

This is the React Native CLI version of the LivUp frontend, integrated with the Node.js backend.

## Prerequisites

1. **Node.js** (v20+)
2. **React Native CLI** (installed globally or via npx)
3. **Android Studio** (for Android development)
4. **Backend Server** running on `http://localhost:3000`

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the backend server:**
   ```bash
   cd ../../Back-end
   npm start
   ```
   The backend should be running on `http://localhost:3000`

3. **For Android Emulator:**
   - The app automatically uses `http://10.0.2.2:3000/api` (Android emulator's localhost)
   - No configuration needed

4. **For Physical Device:**
   - Update `src/config/env.ts` with your computer's IP address
   - Example: `http://192.168.1.100:3000/api`
   - Make sure your device and computer are on the same network

## Running the App

### Android

1. **Start Metro bundler:**
   ```bash
   npm start
   ```

2. **Run on Android (in another terminal):**
   ```bash
   npm run android
   ```

   Or:
   ```bash
   npx react-native run-android
   ```

### iOS (macOS only)

```bash
npm run ios
```

## API Integration

The app is configured to connect to the backend API at:
- **Android Emulator:** `http://10.0.2.2:3000/api`
- **iOS Simulator:** `http://localhost:3000/api`
- **Physical Device:** Update `src/config/env.ts` with your computer's IP

## Project Structure

```
src/
├── config/
│   └── env.ts          # API configuration
├── contexts/
│   └── AuthContext.tsx # Authentication context
├── lib/
│   └── api.ts          # API client for backend
└── screens/
    ├── HomeScreen.tsx
    ├── LoginScreen.tsx
    ├── PlaceholderScreen.tsx
    └── SOSScreen.tsx
```

## Features

- ✅ JWT-based authentication
- ✅ Integration with Node.js backend
- ✅ Home screen with stats, quotes, achievements
- ✅ Navigation (Stack + Bottom Tabs)
- ✅ AsyncStorage for token persistence

## Troubleshooting

1. **Connection refused errors:**
   - Make sure the backend is running on port 3000
   - For Android emulator, use `10.0.2.2` instead of `localhost`
   - For physical device, use your computer's IP address

2. **Metro bundler issues:**
   ```bash
   npm start -- --reset-cache
   ```

3. **Android build issues:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```
