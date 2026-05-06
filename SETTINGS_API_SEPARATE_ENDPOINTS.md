# Settings API - Separate Endpoints ✅

## Backend API Endpoints (All Separate)

### 1. GET `/api/settings`
**Purpose**: Get user settings  
**Auth**: Required  
**Response**:
```json
{
  "settings": {
    "id": 1,
    "user_id": 1,
    "notifications_enabled": true,
    "theme": "light",
    "reminder_frequency": "daily",
    "daily_reminder_time": null,
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-01-01 00:00:00"
  }
}
```

---

### 2. PUT `/api/settings/notifications`
**Purpose**: Update notifications only  
**Auth**: Required  
**Body**:
```json
{
  "notificationsEnabled": true
}
```
**Validation**:
- `notificationsEnabled` must be boolean

**Response**:
```json
{
  "message": "Notifications updated successfully",
  "settings": { ... }
}
```

---

### 3. PUT `/api/settings/theme`
**Purpose**: Update theme only  
**Auth**: Required  
**Body**:
```json
{
  "theme": "dark"
}
```
**Validation**:
- `theme` must be "light" or "dark"

**Response**:
```json
{
  "message": "Theme updated successfully",
  "settings": { ... }
}
```

---

### 4. PUT `/api/settings/email`
**Purpose**: Change email  
**Auth**: Required  
**Body**:
```json
{
  "newEmail": "newemail@example.com"
}
```
**Validation**:
- Valid email format
- Email not already in use

**Response**:
```json
{
  "message": "Email updated successfully"
}
```

---

### 5. PUT `/api/settings/password`
**Purpose**: Change password  
**Auth**: Required  
**Body**:
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```
**Validation**:
- Current password must be correct
- New password min 6 characters

**Response**:
```json
{
  "message": "Password updated successfully"
}
```

---

### 6. GET `/api/settings/export`
**Purpose**: Export all user data  
**Auth**: Required  
**Response**:
```json
{
  "message": "Data exported successfully",
  "data": {
    "user": { ... },
    "profile": { ... },
    "settings": { ... },
    "drinkLogs": [ ... ],
    "moodLogs": [ ... ],
    "journalEntries": [ ... ],
    "milestones": [ ... ],
    "exportedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 7. DELETE `/api/settings/account`
**Purpose**: Delete account permanently  
**Auth**: Required  
**Body**:
```json
{
  "password": "mypassword123"
}
```
**Validation**:
- Password must be correct

**Response**:
```json
{
  "message": "Account deleted successfully"
}
```

**Note**: Deletes all user data via CASCADE

---

## Database Table

**Table**: `user_settings`

```sql
CREATE TABLE user_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  daily_reminder_time TIME,
  reminder_frequency ENUM('daily', 'weekly', 'none') DEFAULT 'daily',
  theme ENUM('light', 'dark') DEFAULT 'light',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Files Modified

### Backend
1. ✅ `Back-end/src/controllers/settingsController.js`
   - Removed: `updateSettings()`
   - Added: `updateNotifications()`
   - Added: `updateTheme()`
   - Kept: `getSettings()`, `changeEmail()`, `changePassword()`, `exportData()`, `deleteAccount()`

2. ✅ `Back-end/src/routes/settings.js`
   - Removed: `PUT /api/settings`
   - Added: `PUT /api/settings/notifications`
   - Added: `PUT /api/settings/theme`
   - Kept all other routes

### Frontend
1. ✅ `Front-end/src/api/settings.ts`
   - Removed: `updateSettings()`
   - Added: `updateNotifications()`
   - Added: `updateTheme()`
   - Updated types

2. ✅ `Front-end/app/settings-screen.tsx`
   - Updated imports
   - `handleToggleNotifications()` now calls `updateNotifications()`
   - `handleToggleDarkMode()` now calls `updateTheme()`

---

## Testing Checklist

### Backend Testing
```bash
# Start server
cd Back-end
npm start

# Test endpoints (need auth token)
curl -X GET http://localhost:3000/api/settings -H "Authorization: Bearer TOKEN"
curl -X PUT http://localhost:3000/api/settings/notifications -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"notificationsEnabled":false}'
curl -X PUT http://localhost:3000/api/settings/theme -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"theme":"dark"}'
curl -X PUT http://localhost:3000/api/settings/email -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"newEmail":"new@test.com"}'
curl -X PUT http://localhost:3000/api/settings/password -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"currentPassword":"old","newPassword":"new123"}'
curl -X GET http://localhost:3000/api/settings/export -H "Authorization: Bearer TOKEN"
curl -X DELETE http://localhost:3000/api/settings/account -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"password":"mypass"}'
```

### Frontend Testing
- [ ] Open Settings screen
- [ ] Toggle notifications switch (should call `/api/settings/notifications`)
- [ ] Toggle dark mode switch (should call `/api/settings/theme`)
- [ ] Change email (should call `/api/settings/email`)
- [ ] Change password (should call `/api/settings/password`)
- [ ] Export data (should call `/api/settings/export`)
- [ ] Delete account (should call `/api/settings/account`)

---

## Summary

✅ **All endpoints are now SEPARATE** as requested:
- PUT `/api/settings/email` - Change email
- PUT `/api/settings/password` - Change password
- PUT `/api/settings/notifications` - Notifications
- PUT `/api/settings/theme` - Dark mode
- GET `/api/settings/export` - Export data
- DELETE `/api/settings/account` - Delete account

✅ **Backend**: Controllers and routes updated
✅ **Frontend**: API client and screen updated
✅ **Database**: Uses existing `user_settings` table

**Ready to test!** Restart backend server and test all endpoints.
