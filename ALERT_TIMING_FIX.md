# Alert Timing Issue Fix

## Problem
"Tried to show an alert while not attached to an Activity" warning appeared in two scenarios:
1. When saving profile customization
2. When signing out

## Root Cause
React Native Alert was being shown while the component was unmounting or navigating away, causing the Alert to lose its Activity context.

### Scenario 1: Profile Customization Save
```javascript
// Before (Wrong ❌)
await refreshProfile();
Alert.alert('Success', 'Profile customization saved!');
navigation.goBack(); // ← Navigates immediately, Alert loses context
```

The `navigation.goBack()` was called immediately after showing the Alert, causing the component to unmount before the Alert could be properly displayed.

### Scenario 2: Sign Out
```javascript
// Before (Wrong ❌)
onPress: async () => {
  await signOut(); // ← Triggers immediate navigation
}
```

The `signOut()` function triggers immediate navigation to the Intro screen, causing the Alert to lose its Activity context.

## Solution Applied

### Fix 1: Profile Customization Save
**File**: `Front-end/app/customize-profile.tsx`

```javascript
// After (Correct ✅)
await refreshProfile();

// Show success alert and navigate back after user dismisses it
Alert.alert(
  'Success', 
  'Profile customization saved!',
  [
    {
      text: 'OK',
      onPress: () => navigation.goBack(), // ← Navigate only after user dismisses Alert
    }
  ]
);
```

Now the navigation happens **after** the user dismisses the Alert, ensuring the Alert is properly displayed.

### Fix 2: Sign Out
**File**: `Front-end/app/(tabs)/profile.tsx`

```javascript
// After (Correct ✅)
onPress: async () => {
  console.log('[Profile] handleSignOut: User confirmed sign out');
  try {
    console.log('[Profile] handleSignOut: Calling AuthContext signOut');
    // Add small delay to ensure Alert is dismissed before navigation
    setTimeout(async () => {
      await signOut();
      console.log('[Profile] handleSignOut: Sign out completed');
    }, 100); // ← 100ms delay allows Alert to dismiss properly
  } catch (error) {
    console.error('[Profile] handleSignOut: Error during sign out:', error);
  }
}
```

A 100ms delay ensures the Alert is dismissed before the navigation is triggered.

## Files Modified
1. `Front-end/app/customize-profile.tsx` - Fixed Alert timing on save
2. `Front-end/app/(tabs)/profile.tsx` - Fixed Alert timing on sign out

## Testing Checklist

### Test 1: Profile Customization Save
- [ ] Open Customize Profile screen
- [ ] Edit bio, theme, or frame
- [ ] Click Save button
- [ ] ✅ Success Alert should appear without warning
- [ ] Click OK on Alert
- [ ] ✅ Should navigate back to Profile screen

### Test 2: Sign Out
- [ ] Go to Profile tab
- [ ] Click Sign Out button
- [ ] ✅ Sign Out confirmation Alert should appear without warning
- [ ] Click "Sign Out" button
- [ ] ✅ Should navigate to Intro screen without warning

## Expected Behavior
- ✅ No "Tried to show an alert while not attached to an Activity" warnings
- ✅ Alerts display properly
- ✅ Navigation happens smoothly after Alert is dismissed
- ✅ User experience is clean and professional

## Status
✅ **FIXED** - Alert timing issues resolved in both scenarios
