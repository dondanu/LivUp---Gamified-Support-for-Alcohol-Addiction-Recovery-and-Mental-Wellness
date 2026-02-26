# React Native .env Solution

## The Problem

React Native **CANNOT** directly read `.env` files at runtime like Node.js can. This is because:
1. React Native runs in a JavaScript engine (Hermes/JSC), not Node.js
2. There is no `fs` module to read files
3. `.env` files must be processed at **build time**, not runtime

## The ONLY Working Solutions

### Option 1: Use react-native-dotenv (Recommended)
**Status**: ✅ Already configured in your project

**How it works**:
- Babel reads `.env` at build time
- Transforms `import { API_BASE_URL } from '@env'` into actual values
- Requires Metro restart with cache clear

**Steps to make it work**:
1. Stop Metro (Ctrl+C)
2. Run: `npx react-native start --reset-cache`
3. Wait for Metro to fully start
4. Reload app (shake → Reload)

**Files**:
- `.env` - Contains `API_BASE_URL=http://192.168.0.111:3000/api`
- `babel.config.js` - Configured with `react-native-dotenv`
- `lib/config.ts` - Imports from `@env`

### Option 2: Hardcode in config.ts (Simple, Works Immediately)
**Status**: ❌ You rejected this

```typescript
export const BASE_URL = 'http://192.168.0.111:3000/api';
```

**Pros**: Works immediately, no setup needed
**Cons**: URL is in code, not in `.env`

### Option 3: Use react-native-config (Native Module)
**Status**: ❌ Requires native rebuild

Requires:
- Native Android/iOS configuration
- Full app rebuild (not just Metro restart)
- More complex setup

## Why It's Not Working Now

The error "Unable to resolve module @env" means:
1. Metro bundler hasn't reloaded the Babel configuration
2. The cache still has old bundle without `@env` module

## What You Need to Do

**Stop Metro completely**:
- Find the terminal running Metro
- Press Ctrl+C
- Close that terminal

**Start Metro with clean cache**:
```bash
cd Front-end
npx react-native start --reset-cache
```

**Wait** for Metro to show: "Metro waiting on port 8081"

**Reload app**: Shake device → Reload

## Current Configuration

### .env file:
```
API_BASE_URL=http://192.168.0.111:3000/api
```

### babel.config.js:
```javascript
plugins: [
  ['module:react-native-dotenv', {
    moduleName: '@env',
    path: '.env',
  }],
]
```

### lib/config.ts:
```typescript
import { API_BASE_URL } from '@env';
export const BASE_URL = API_BASE_URL;
```

## The Reality

**You want**: Import directly from `.env` with no extra files
**The truth**: React Native cannot do this without build-time transformation

**Your options**:
1. Accept `react-native-dotenv` and restart Metro properly
2. Accept hardcoded URL in `config.ts` (works immediately)
3. Spend hours setting up `react-native-config` with native builds

There is no magic solution. This is how React Native works.

## My Recommendation

**Just restart Metro properly**:
```bash
# Stop Metro (Ctrl+C)
cd Front-end
npx react-native start --reset-cache
# Wait for "Metro waiting on port 8081"
# Reload app
```

The `@env` import will work after Metro restarts with the new Babel config.
