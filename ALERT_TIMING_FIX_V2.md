# Alert Timing Issue Fix V2 - Using InteractionManager

## Problem
"Tried to show an alert while not attached to an Activity" warning persisted even after initial fix attempts. This is a common React Native issue where Alerts are shown during component transitions or unmounting.

## Root Cause
React Native's Alert component requires an active Activity context. When navigation or state changes happen immediately after showing an Alert, the Activity context can be lost before the Alert is properly rendered.

## Solution: InteractionManager

React Native's `InteractionManager` allows us to defer Alert display until after all interactions (animations, transitions) are complete. This ensures the Alert has a stable Activity context.

### Key Changes

#### 1. Import InteractionManager
```javascript
import {
  View,
  Text,
  Alert,
  InteractionManager, // ← Added
} from 'react-native';
```

#### 2. Wrap Alert.alert() calls with InteractionManager.runAfterInteractions()

This ensures the Alert is shown only after all ongoing interactions complete.

## Files Modified

### 1. Front-end/app/customize-profile.tsx

**Before:**
```javascript
await refreshProfile();
Alert.alert('Success', 'Profile customization saved!', [
  {
    text: 'OK',
    onPress: () => navigation.goBack(),
  }
]);
```

**After:**
```javascript
await refreshProfile();

// Use InteractionManager to ensure Alert shows after all interactions complete
InteractionManager.runAfterInteractions(() => {
  Alert.alert(
    'Success', 
    'Profile customization saved!',
    [
      {
        text: 'OK',
        onPress: () => {
          // Small delay before navigation to ensure Alert is dismissed
          setTimeout(() => navigation.goBack(), 50);
        },
      }
    ]
  );
});
```

**Benefits:**
- ✅ Alert waits for all animations/transitions to complete
- ✅ 50ms delay ensures Alert dismissal before navigation
- ✅ No Activity context loss

### 2. Front-end/app/(tabs)/profile.tsx

**Before:**
```javascript
const handleSignOut = async () => {
  Alert.alert('Sign Out', message, [
    {
      text: 'Sign Out',
      onPress: async () => {
        setTimeout(async () => {
          await signOut();
        }, 100);
      },
    },
  ]);
};
```

**After:**
```javascript
const handleSignOut = () => {
  // Use InteractionManager to ensure Alert shows properly
  InteractionManager.runAfterInteractions(() => {
    Alert.alert('Sign Out', message, [
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          // Add delay to ensure Alert is dismissed before navigation
          setTimeout(async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error during sign out:', error);
            }
          }, 150);
        },
      },
    ]);
  });
};
```

**Benefits:**
- ✅ Alert waits for all interactions to complete
- ✅ 150ms delay ensures Alert dismissal before sign out navigation
- ✅ Proper error handling
- ✅ No Activity context loss

## Why This Works

### InteractionManager.runAfterInteractions()
- Waits for all animations, gestures, and transitions to complete
- Ensures a stable UI state before showing Alert
- Prevents Activity context loss during transitions

### setTimeout() delays
- **50ms** for simple navigation (customize profile save)
- **150ms** for complex navigation (sign out with auth state changes)
- Ensures Alert is fully dismissed before triggering navigation

## Testing Instructions

### Test 1: Profile Customization Save
1. Open app and login
2. Navigate to Profile tab
3. Click "Customize Profile"
4. Edit bio, theme, or frame
5. Click Save button
6. ✅ Success Alert should appear **without warning**
7. Click OK
8. ✅ Should navigate back smoothly

### Test 2: Sign Out
1. Go to Profile tab
2. Click Sign Out button
3. ✅ Confirmation Alert should appear **without warning**
4. Click "Sign Out"
5. ✅ Should navigate to Intro screen smoothly

### Test 3: Rapid Actions
1. Save profile customization multiple times quickly
2. ✅ No warnings should appear
3. Try sign out immediately after other actions
4. ✅ No warnings should appear

## Expected Console Output

### Successful Save:
```
[CustomizeProfile] Saving: {bio: 'ee', theme: 'dark', avatar_frame: 'gold'}
[API Request] PUT /auth/profile
[API Response] 200 /auth/profile
[AuthContext] fetchProfile: Profile response: {total_points: 400, level_id: 3}
✅ No "Tried to show an alert" warning
```

### Successful Sign Out:
```
[Profile] handleSignOut: Sign out button pressed
[Profile] handleSignOut: User confirmed sign out
[Profile] handleSignOut: Calling AuthContext signOut
[AuthContext] signOut: Starting sign out process
✅ No "Tried to show an alert" warning
```

## Additional Notes

### Hot Reload Issue
If you still see the warning after applying this fix:
1. **Stop the Metro bundler** (Ctrl+C)
2. **Clear cache**: `npm start -- --reset-cache`
3. **Rebuild the app**: Close and reopen the app completely
4. Hot reload may not pick up InteractionManager changes properly

### Alternative: Toast Notifications
If Alert issues persist, consider using a Toast library:
- `react-native-toast-message`
- `react-native-simple-toast`
- These don't require Activity context

## Status
✅ **FIXED** - Using InteractionManager to ensure stable Activity context for Alerts

## Files Modified
1. `Front-end/app/customize-profile.tsx` - Added InteractionManager for save Alert
2. `Front-end/app/(tabs)/profile.tsx` - Added InteractionManager for sign out Alert
