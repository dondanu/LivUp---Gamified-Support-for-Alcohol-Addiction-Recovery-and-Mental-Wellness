# Profile Tab - Backend API Status Report

## ✅ Already Have Backend API

### 1. **Avatar Selection**
- **Screen**: Profile Tab (Main)
- **API**: `PUT /api/gamification/avatar`
- **Status**: ✅ Working
- **Features**: Change avatar (boy, girl, man, woman, basic)

### 2. **Emergency Contacts (SOS)**
- **Screen**: Profile Tab → Emergency Contacts Modal
- **API**: 
  - `GET /api/sos/contacts`
  - `POST /api/sos/contacts`
  - `PUT /api/sos/contacts/:id`
  - `DELETE /api/sos/contacts/:id`
- **Status**: ✅ Working
- **Features**: Add, view, update, delete emergency contacts

### 3. **Healthy Alternatives**
- **Screen**: Profile Tab → Healthy Alternatives Modal
- **API**: `GET /api/content/alternatives`
- **Status**: ✅ Working
- **Features**: View list of healthy activities

### 4. **Achievement Gallery**
- **Screen**: `achievement-gallery.tsx`
- **API**: `GET /api/gamification/achievements`
- **Status**: ✅ Working
- **Features**: View earned badges/achievements

### 5. **Personal Milestones**
- **Screen**: `personal-milestones.tsx`
- **API**: 
  - `GET /api/milestones`
  - `POST /api/milestones`
  - `PUT /api/milestones/:id`
  - `DELETE /api/milestones/:id`
- **Status**: ✅ Working (Just completed!)
- **Features**: Add, view, update, delete personal milestones

---

## ❌ Need Backend API (Currently Using Local State Only)

### 1. **Customize Profile** 🎨
- **Screen**: `customize-profile.tsx`
- **Current State**: Local state only
- **Needed API Endpoints**:
  - `GET /api/profile/customization` - Get user's customization settings
  - `PUT /api/profile/customization` - Update customization
- **Database Table Needed**: `user_customization`
  ```sql
  CREATE TABLE user_customization (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    bio VARCHAR(100),
    theme VARCHAR(20) DEFAULT 'purple',
    avatar_frame VARCHAR(20) DEFAULT 'none',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  ```
- **Features**:
  - Bio/tagline (max 100 chars)
  - Profile theme (6 options: purple, blue, green, orange, pink, dark)
  - Avatar frame (none, gold, silver, diamond)

### 2. **Personal Journal** 📝
- **Screen**: `personal-journal.tsx`
- **Current State**: Local state only
- **Needed API Endpoints**:
  - `GET /api/journal/entries` - Get all journal entries
  - `POST /api/journal/entries` - Add new entry
  - `PUT /api/journal/entries/:id` - Update entry
  - `DELETE /api/journal/entries/:id` - Delete entry
- **Database Table Needed**: `journal_entries`
  ```sql
  CREATE TABLE journal_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('note', 'gratitude', 'reason', 'mantra') NOT NULL,
    content TEXT NOT NULL,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_journal_user_id (user_id),
    INDEX idx_journal_date (entry_date)
  );
  ```
- **Features**:
  - 4 entry types: Note 📝, Gratitude 🙏, Reason 💪, Mantra ✨
  - Add, view, edit, delete entries
  - Group by type
  - Date tracking

### 3. **Settings** ⚙️
- **Screen**: `settings-screen.tsx`
- **Current State**: Partially implemented (user_settings table exists but not fully used)
- **Existing API**: `GET /api/settings` (basic)
- **Needed API Endpoints**:
  - `PUT /api/settings/email` - Change email
  - `PUT /api/settings/password` - Change password
  - `PUT /api/settings/notifications` - Update notification preferences
  - `PUT /api/settings/theme` - Update theme (dark/light mode)
  - `GET /api/settings/export` - Export user data
  - `DELETE /api/settings/account` - Delete account
- **Database Table**: `user_settings` (already exists, needs enhancement)
  ```sql
  -- Add these columns to existing user_settings table
  ALTER TABLE user_settings 
    ADD COLUMN dark_mode BOOLEAN DEFAULT FALSE,
    ADD COLUMN language VARCHAR(10) DEFAULT 'en',
    ADD COLUMN privacy_level VARCHAR(20) DEFAULT 'private';
  ```
- **Features**:
  - Account settings (email, password)
  - Notification preferences
  - Dark mode toggle
  - Language selection
  - Data export
  - Account deletion

### 4. **Social & Sharing** 👥
- **Screen**: `social-sharing.tsx`
- **Current State**: Local state only (uses Share API for native sharing)
- **Needed API Endpoints**:
  - `GET /api/social/profile-link` - Generate shareable profile link
  - `GET /api/social/qr-code` - Generate QR code for profile
  - `POST /api/social/share-log` - Log sharing activity (analytics)
  - `GET /api/social/friends` - Get friend list (future feature)
  - `POST /api/social/friend-request` - Send friend request (future feature)
- **Database Tables Needed**:
  ```sql
  -- For tracking shares (analytics)
  CREATE TABLE share_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    share_type ENUM('profile', 'achievement', 'progress') NOT NULL,
    platform VARCHAR(50),
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- For future social features
  CREATE TABLE user_friends (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (user_id, friend_id)
  );
  ```
- **Features**:
  - Share profile (native Share API - works)
  - Share achievements (native Share API - works)
  - Share progress (native Share API - works)
  - Copy profile link (needs backend)
  - QR code generation (needs backend)
  - Friend system (future feature)

---

## 📊 Summary

### Working with Backend API: 5 features
1. ✅ Avatar Selection
2. ✅ Emergency Contacts
3. ✅ Healthy Alternatives
4. ✅ Achievement Gallery
5. ✅ Personal Milestones

### Need Backend API: 4 features
1. ❌ Customize Profile (bio, theme, avatar frame)
2. ❌ Personal Journal (4 entry types)
3. ❌ Settings (email, password, notifications, dark mode, export, delete)
4. ❌ Social & Sharing (profile link, QR code, analytics)

---

## 🎯 Priority Recommendations

### High Priority (Core Features)
1. **Personal Journal** - Users want to track their thoughts and reasons
2. **Customize Profile** - Personalization increases engagement
3. **Settings - Account Management** - Email/password change is essential

### Medium Priority (Nice to Have)
4. **Settings - Data Export** - Privacy compliance
5. **Social & Sharing - Profile Link** - Sharing encouragement

### Low Priority (Future Features)
6. **Settings - Account Deletion** - Required for compliance but rarely used
7. **Social & Sharing - Friend System** - Social features for later

---

## 📝 Notes

- **Native Features Working**: Share API (profile, achievements, progress) works without backend
- **Existing Tables**: `user_settings` table exists but needs enhancement
- **Security**: Password change and account deletion need extra security measures
- **Privacy**: Data export needs to comply with GDPR/privacy laws
- **Analytics**: Share logs can help understand user engagement

---

## 🚀 Next Steps

If you want to implement these, we should prioritize:
1. **Personal Journal API** (most requested feature)
2. **Customize Profile API** (increases user engagement)
3. **Settings Enhancement** (account management)
4. **Social Features** (later phase)
