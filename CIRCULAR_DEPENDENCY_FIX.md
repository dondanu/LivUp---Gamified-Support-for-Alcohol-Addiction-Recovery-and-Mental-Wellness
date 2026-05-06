# Circular Dependency Fix - tokenManager Import Issue

## Problem
The app was crashing with error:
```
TypeError: property is not configurable
Cannot read property 'tokenManager' of undefined
```

## Root Cause
Circular dependency in module imports:
1. `AuthContext.tsx` imported `tokenManager` from `@/src/api/index.ts` (barrel export)
2. `@/src/api/index.ts` exported everything from `auth.ts`
3. `auth.ts` imported `tokenManager` from `./client.ts`
4. During module initialization, the barrel export wasn't fully loaded when modules tried to access `tokenManager`
5. This created a circular dependency where modules were trying to access each other before being fully initialized

## Solution Applied

### 1. Removed tokenManager from Barrel Export
**File**: `Front-end/src/api/index.ts`
- Removed `export { tokenManager } from './client'`
- Added comment explaining why it's not exported

### 2. Used Dynamic Imports in auth.ts
**File**: `Front-end/src/api/auth.ts`
- Changed from: `import apiClient, { tokenManager } from './client'`
- Changed to: `import apiClient from './client'`
- Used lazy loading inside functions:
  ```typescript
  const { tokenManager } = await import('./client');
  ```
- This ensures `tokenManager` is only imported when functions are called, not during module initialization

### 3. Direct Import in AuthContext
**File**: `Front-end/contexts/AuthContext.tsx`
- Changed from: `import { register, login, getProfile, logout, tokenManager } from '@/src/api'`
- Changed to: 
  ```typescript
  import { register, login, getProfile, logout } from '@/src/api';
  import { tokenManager } from '@/src/api/client';
  ```

## Why This Works
1. **Breaks circular dependency**: `tokenManager` is no longer part of the barrel export chain
2. **Lazy loading**: Dynamic imports in `auth.ts` ensure modules are fully initialized before access
3. **Direct imports**: Importing directly from source avoids barrel export complexity

## Files Modified
1. `Front-end/src/api/index.ts` - Removed tokenManager export
2. `Front-end/src/api/auth.ts` - Used dynamic imports for tokenManager
3. `Front-end/contexts/AuthContext.tsx` - Import tokenManager directly from client

## Testing
- App should now load without crashes
- Login/Register should work correctly
- Token management should function normally
- Profile customization (bio, theme, avatar_frame) should work

## Status
✅ Fixed - Ready for testing
