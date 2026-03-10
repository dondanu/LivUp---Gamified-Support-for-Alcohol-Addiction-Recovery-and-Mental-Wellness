# Design Document: Anonymous to Registered User Conversion

## Overview

This feature enables anonymous users to convert their accounts to full registered accounts at strategic milestone moments. The conversion flow is triggered by significant achievements (first badge, first challenge completion, point thresholds, usage duration) and presents users with an attractive, motivational prompt that celebrates their accomplishment while emphasizing the benefits of creating a full account.

The conversion process updates the existing user record in-place, preserving all user progress (points, streaks, achievements, logs, tasks, mood entries) while adding email, password, and a user-chosen username. This approach maintains data integrity by keeping the same user_id and all foreign key relationships intact.

### Key Design Principles

1. **Non-Intrusive**: Prompts appear at celebratory moments but can be dismissed
2. **Data Preservation**: All user progress is maintained during conversion
3. **In-Place Update**: Existing user record is updated rather than creating a new account
4. **User Control**: Users choose their own username during conversion
5. **Seamless Experience**: After conversion, users can log in normally with email/password

## Architecture

### System Components

```mermaid
graph TB
    subgraph Frontend["Frontend (React Native)"]
        UI[UI Components]
        ConversionPrompt[Conversion Prompt Component]
        ConversionForm[Conversion Form Component]
        AuthContext[Auth Context]
        MilestoneTracker[Milestone Tracker Hook]
    end
    
    subgraph Backend["Backend (Node.js + Express)"]
        AuthController[Auth Controller]
        ConversionController[Conversion Controller]
        GamificationController[Gamification Controller]
        MilestoneMiddleware[Milestone Detection Middleware]
    end
    
    subgraph Database["Supabase Database"]
        Users[(users table)]
        UserProfiles[(user_profiles table)]
        ConversionPrompts[(conversion_prompts table)]
        Achievements[(achievements & user_achievements)]
        OtherData[(tasks, logs, moods, etc.)]
    end
    
    UI --> ConversionPrompt
    ConversionPrompt --> ConversionForm
    ConversionForm --> AuthContext
    AuthContext --> ConversionController
    
    GamificationController --> MilestoneMiddleware
    MilestoneMiddleware --> ConversionController
    
    ConversionController --> Users
    ConversionController --> ConversionPrompts
    AuthController --> Users
    AuthController --> UserProfiles
    
    Users -.->|foreign key| UserProfiles
    Users -.->|foreign key| Achievements
    Users -.->|foreign key| OtherData
</mermaid>

### Component Interaction Flow

1. **Milestone Detection**: When a user performs an action (completes challenge, earns points, etc.), the backend checks if a milestone has been reached
2. **Prompt Trigger**: If a milestone is reached and the user is anonymous, the backend returns a flag indicating a conversion prompt should be shown
3. **Prompt Display**: Frontend displays the conversion prompt with celebratory messaging
4. **User Action**: User either dismisses the prompt or clicks "Create Account"
5. **Conversion Flow**: If user proceeds, they fill out the conversion form (email, password, username)
6. **Account Update**: Backend validates inputs and updates the existing user record in-place
7. **Token Refresh**: Backend issues a new JWT token reflecting the registered user status
8. **State Update**: Frontend updates auth context with new user information

## Components and Interfaces

### Backend Components

#### 1. Conversion Controller (`conversionController.js`)

Handles the account conversion logic.

```javascript
// POST /api/auth/convert
const convertAnonymousToRegistered = async (req, res) => {
  // Input: { email, password, username }
  // Validates inputs
  // Checks if user is anonymous
  // Updates user record in-place
  // Returns new JWT token and updated user info
}

// GET /api/auth/conversion-eligibility
const checkConversionEligibility = async (req, res) => {
  // Returns whether user should see conversion prompt
  // Based on milestone tracking
}
```

#### 2. Milestone Detection Middleware (`milestoneDetection.js`)

Detects when milestone events occur and determines if conversion prompt should be triggered.

```javascript
const detectMilestone = async (userId, eventType, eventData) => {
  // eventType: 'achievement_unlocked', 'challenge_completed', 'points_earned', 'usage_days'
  // Checks if milestone has been reached
  // Checks if prompt has already been shown for this milestone
  // Returns { shouldShowPrompt: boolean, milestoneType: string, milestoneData: object }
}

const recordPromptShown = async (userId, milestoneType) => {
  // Records that a prompt was shown for a specific milestone
  // Prevents duplicate prompts for the same milestone
}
```

#### 3. Enhanced Gamification Controller

Existing `gamificationController.js` is enhanced to integrate milestone detection.

```javascript
// Enhanced checkAndAwardAchievements
const checkAndAwardAchievements = async (req, res) => {
  // Existing logic...
  // After awarding achievements, check for first achievement milestone
  const milestone = await detectMilestone(userId, 'achievement_unlocked', { 
    isFirstAchievement: newAchievements.length > 0 && earnedIds.size === 0 
  });
  
  // Return milestone info in response
  return res.json({
    // existing response...
    conversionPrompt: milestone.shouldShowPrompt ? milestone : null
  });
}

// Enhanced updateUserPoints
const updateUserPoints = async (req, res) => {
  // Existing logic...
  // After updating points, check for points milestone
  const milestone = await detectMilestone(userId, 'points_earned', { 
    totalPoints: newTotalPoints 
  });
  
  // Return milestone info in response
}
```

#### 4. Enhanced Auth Controller

Existing `authController.js` is enhanced with conversion endpoint.

```javascript
// New endpoint: POST /api/auth/convert
const convertAccount = async (req, res) => {
  const { email, password, username } = req.body;
  const userId = req.user.userId; // From JWT token
  
  // Validate inputs
  // Check if user is anonymous
  // Check if email/username already exist
  // Hash password
  // Update user record (set is_anonymous = false, add email, password, username)
  // Issue new JWT token
  // Return updated user info
}
```

### Frontend Components

#### 1. Conversion Prompt Component (`ConversionPrompt.tsx`)

Displays the motivational prompt when a milestone is reached.

```typescript
interface ConversionPromptProps {
  visible: boolean;
  milestoneType: 'first_achievement' | 'first_challenge' | 'points_threshold' | 'usage_days';
  milestoneData: {
    achievementName?: string;
    challengeName?: string;
    pointsEarned?: number;
    daysUsed?: number;
  };
  onDismiss: () => void;
  onConvert: () => void;
}

const ConversionPrompt: React.FC<ConversionPromptProps> = ({
  visible,
  milestoneType,
  milestoneData,
  onDismiss,
  onConvert
}) => {
  // Renders modal with celebratory design
  // Shows milestone-specific messaging
  // Displays benefits of creating account
  // Provides "Create Account" and "Maybe Later" buttons
}
```

#### 2. Conversion Form Component (`ConversionForm.tsx`)

Displays the form for users to input their email, password, and username.

```typescript
interface ConversionFormProps {
  visible: boolean;
  onSubmit: (email: string, password: string, username: string) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
}

const ConversionForm: React.FC<ConversionFormProps> = ({
  visible,
  onSubmit,
  onCancel,
  loading,
  error
}) => {
  // Renders form with email, password, username inputs
  // Validates inputs client-side
  // Shows loading state during submission
  // Displays error messages
}
```

#### 3. Milestone Tracker Hook (`useMilestoneTracker.ts`)

Custom hook that monitors API responses for milestone events and triggers conversion prompts.

```typescript
interface MilestoneInfo {
  shouldShowPrompt: boolean;
  milestoneType: string;
  milestoneData: object;
}

const useMilestoneTracker = () => {
  const [promptInfo, setPromptInfo] = useState<MilestoneInfo | null>(null);
  const { user } = useAuth();
  
  const checkResponse = (apiResponse: any) => {
    // Checks if API response contains conversionPrompt field
    // If user is anonymous and prompt should be shown, update state
    if (user?.isAnonymous && apiResponse.conversionPrompt) {
      setPromptInfo(apiResponse.conversionPrompt);
    }
  };
  
  const dismissPrompt = () => {
    setPromptInfo(null);
  };
  
  return { promptInfo, checkResponse, dismissPrompt };
}
```

#### 4. Enhanced Auth Context

Existing `AuthContext.tsx` is enhanced with conversion method.

```typescript
interface AuthContextType {
  // Existing properties...
  convertToRegistered: (email: string, password: string, username: string) => Promise<{ error: any }>;
}

const convertToRegistered = async (email: string, password: string, username: string) => {
  try {
    const response = await convertAccount({ email, password, username });
    
    // Update user state with new information
    setUser(response.user);
    
    // Refresh profile
    await fetchProfile();
    
    return { error: null };
  } catch (error: any) {
    // Handle errors
    return { error: { message: errorMessage } };
  }
}
```

### API Endpoints

#### New Endpoints

1. **POST /api/auth/convert**
   - Purpose: Convert anonymous account to registered account
   - Auth: Required (JWT token)
   - Request Body:
     ```json
     {
       "email": "user@example.com",
       "password": "securePassword123",
       "username": "chosen_username"
     }
     ```
   - Response:
     ```json
     {
       "message": "Account converted successfully",
       "token": "new_jwt_token",
       "user": {
         "id": "user_id",
         "username": "chosen_username",
         "email": "user@example.com",
         "isAnonymous": false
       }
     }
     ```
   - Error Responses:
     - 400: Invalid input (email format, password strength, missing fields)
     - 403: User is not anonymous
     - 409: Email or username already exists
     - 500: Server error

2. **GET /api/auth/conversion-eligibility**
   - Purpose: Check if user should see conversion prompt
   - Auth: Required (JWT token)
   - Response:
     ```json
     {
       "eligible": true,
       "milestoneType": "first_achievement",
       "milestoneData": {
         "achievementName": "First Steps"
       }
     }
     ```

#### Enhanced Endpoints

Existing endpoints that trigger milestone detection will include `conversionPrompt` field in their responses:

- **POST /api/gamification/check-achievements**
- **POST /api/gamification/points**
- **POST /api/tasks/complete**
- **POST /api/challenges/complete**

Enhanced response format:
```json
{
  // Existing response fields...
  "conversionPrompt": {
    "shouldShowPrompt": true,
    "milestoneType": "first_achievement",
    "milestoneData": {
      "achievementName": "First Steps",
      "pointsEarned": 50
    }
  }
}
```

## Data Models

### Database Schema Changes

#### 1. New Table: `conversion_prompts`

Tracks which conversion prompts have been shown to each user.

```sql
CREATE TABLE conversion_prompts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  milestone_type ENUM(
    'first_achievement',
    'first_challenge',
    'points_150',
    'usage_3_days',
    'usage_7_days'
  ) NOT NULL,
  shown_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dismissed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_milestone (user_id, milestone_type)
);
```

#### 2. Enhanced `users` Table

No schema changes needed. Existing fields support conversion:
- `is_anonymous`: BOOLEAN (will be set to false during conversion)
- `email`: VARCHAR (nullable, will be populated during conversion)
- `password_hash`: VARCHAR (will be populated during conversion)
- `username`: VARCHAR (will be updated from anonymous_xyz to user-chosen username)

### Data Flow During Conversion

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Clicks "Create Account"
    Frontend->>User: Shows conversion form
    User->>Frontend: Submits email, password, username
    Frontend->>Backend: POST /api/auth/convert
    
    Backend->>Database: Check if email exists
    Database-->>Backend: Email available
    Backend->>Database: Check if username exists
    Database-->>Backend: Username available
    
    Backend->>Backend: Hash password
    Backend->>Database: UPDATE users SET email=?, password_hash=?, username=?, is_anonymous=false WHERE id=?
    Database-->>Backend: Update successful
    
    Backend->>Backend: Generate new JWT token
    Backend-->>Frontend: Return token + updated user
    Frontend->>Frontend: Update auth context
    Frontend->>User: Show success message
</mermaid>

### Data Preservation Strategy

During conversion, the following data is preserved by maintaining the same `user_id`:

1. **user_profiles**: All gamification data (points, streaks, level, avatar)
2. **user_achievements**: All unlocked achievements
3. **user_daily_tasks**: All task history
4. **drink_logs**: All drink tracking data
5. **mood_logs**: All mood entries
6. **user_settings**: All user preferences
7. **challenge_progress**: All challenge completion data

The conversion process does NOT:
- Create a new user record
- Copy data between records
- Change the user_id
- Break any foreign key relationships

## Error Handling

### Backend Error Scenarios

1. **Invalid Email Format**
   - Validation: Use express-validator to check email format
   - Response: 400 with message "Invalid email format"

2. **Weak Password**
   - Validation: Minimum 6 characters (consistent with existing auth)
   - Response: 400 with message "Password must be at least 6 characters"

3. **Email Already Exists**
   - Check: Query users table for existing email
   - Response: 409 with message "Email already exists"

4. **Username Already Exists**
   - Check: Query users table for existing username
   - Response: 409 with message "Username already exists"

5. **User Not Anonymous**
   - Check: Verify is_anonymous flag is true
   - Response: 403 with message "User is already registered"

6. **Database Update Failure**
   - Use transaction to ensure atomicity
   - Rollback on failure
   - Response: 500 with message "Failed to convert account"

### Frontend Error Handling

1. **Network Errors**
   - Display: "Unable to connect. Please check your internet connection."
   - Action: Allow retry

2. **Validation Errors**
   - Display inline error messages for each field
   - Prevent form submission until valid

3. **Server Errors**
   - Display error message from server response
   - For 409 conflicts, suggest alternative username/email

4. **Token Expiration**
   - If conversion fails due to expired token, redirect to login
   - Preserve form data if possible

### Error Recovery

1. **Partial Update Failure**
   - Use database transactions to ensure all-or-nothing updates
   - If transaction fails, user remains anonymous with all data intact

2. **Token Generation Failure**
   - If user record is updated but token generation fails:
     - User can log in with new credentials
     - Return 201 with message to log in again

3. **Prompt Tracking Failure**
   - If milestone detection fails, don't block core functionality
   - Log error and continue without showing prompt
   - User can still manually convert via settings

## Testing Strategy

### Unit Testing

Unit tests will focus on specific examples, edge cases, and error conditions. Property-based tests will handle comprehensive input coverage.

#### Backend Unit Tests

1. **Conversion Controller Tests**
   - Test successful conversion with valid inputs
   - Test rejection when user is not anonymous
   - Test rejection when email already exists
   - Test rejection when username already exists
   - Test password hashing is applied
   - Test JWT token is generated correctly

2. **Milestone Detection Tests**
   - Test first achievement detection
   - Test first challenge detection
   - Test points threshold detection (150 points)
   - Test usage duration detection (3 days, 7 days)
   - Test prompt tracking prevents duplicates

3. **Validation Tests**
   - Test email format validation
   - Test password length validation
   - Test username length validation
   - Test empty field rejection

#### Frontend Unit Tests

1. **Conversion Prompt Component Tests**
   - Test prompt displays correct milestone message
   - Test dismiss button hides prompt
   - Test convert button triggers form display
   - Test different milestone types render correctly

2. **Conversion Form Component Tests**
   - Test form validation (email, password, username)
   - Test form submission calls API
   - Test error messages display correctly
   - Test loading state during submission

3. **Milestone Tracker Hook Tests**
   - Test hook detects milestone in API response
   - Test hook ignores milestone for registered users
   - Test dismiss clears prompt state

4. **Auth Context Tests**
   - Test convertToRegistered updates user state
   - Test convertToRegistered refreshes profile
   - Test error handling in conversion

### Property-Based Testing

Property-based tests will verify universal properties across all inputs. Each test will run a minimum of 100 iterations with randomized inputs.

Configuration:
- Library: fast-check (JavaScript/TypeScript property-based testing library)
- Iterations: 100 minimum per test
- Each test tagged with: **Feature: anonymous-to-registered-conversion, Property {number}: {property_text}**

### Integration Testing

1. **End-to-End Conversion Flow**
   - Create anonymous user
   - Trigger milestone event
   - Verify prompt appears
   - Submit conversion form
   - Verify user can log in with new credentials
   - Verify all data is preserved

2. **Milestone Trigger Integration**
   - Complete challenge and verify prompt
   - Earn achievement and verify prompt
   - Reach point threshold and verify prompt
   - Use app for 3/7 days and verify prompt

3. **Data Preservation Integration**
   - Create anonymous user with various data
   - Convert account
   - Verify all data accessible after conversion

### Test Data

- Use factory functions to generate test users with various states
- Generate random but valid emails, passwords, usernames
- Create test milestones with different types and data
- Mock database responses for unit tests
- Use test database for integration tests


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Registered Users Never See Conversion Prompts

*For any* registered user (is_anonymous = false) and any milestone event (achievement, challenge, points, usage days), the system should never return a conversion prompt flag in the API response.

**Validates: Requirements 1.6**

### Property 2: Conversion Prompt Contains Milestone Information

*For any* conversion prompt displayed, the prompt data should contain the specific accomplishment information relevant to the milestone type (achievement name for first achievement, challenge name for first challenge, point total for points threshold, days count for usage milestones).

**Validates: Requirements 2.1**

### Property 3: Dismissed Prompts Reappear at Different Milestones

*For any* anonymous user who dismisses a conversion prompt for milestone type A, when they later trigger a different milestone type B, the system should display a new conversion prompt for milestone type B.

**Validates: Requirements 2.5**

### Property 4: Input Validation Rejects Invalid Data

*For any* conversion form submission with invalid inputs (malformed email, password shorter than 6 characters, or empty required fields), the system should return an appropriate validation error message and not update the user record.

**Validates: Requirements 3.5, 8.1, 8.2, 8.4**

### Property 5: Complete Data Preservation During Conversion

*For any* anonymous user with associated data (points, streaks, achievements, logs, tasks, mood entries), when the account is converted to registered, all data should remain accessible and unchanged, verified by querying all related tables using the same user_id.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**

### Property 6: In-Place Account Update

*For any* anonymous user conversion, the user_id before conversion should equal the user_id after conversion, and the total count of user records in the database should not increase.

**Validates: Requirements 5.5, 5.6**

### Property 7: All Required Fields Updated During Conversion

*For any* successful conversion with provided email, password, and username, the updated user record should have is_anonymous set to false, email set to the provided email, password_hash populated with a bcrypt hash, and username set to the provided username.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 8: Post-Conversion Authentication Round Trip

*For any* converted user with email and password, logging out and then logging back in with those credentials should successfully authenticate and return access to all preserved user data.

**Validates: Requirements 6.2, 6.3**

### Property 9: New JWT Token Reflects Registered Status

*For any* successful account conversion, the returned JWT token should decode to show is_anonymous as false and contain the user's new email and username.

**Validates: Requirements 6.1**

### Property 10: Prompt Deduplication

*For any* anonymous user and milestone type, if a conversion prompt has been shown for that milestone type, triggering the same milestone type again should not return a conversion prompt flag.

**Validates: Requirements 7.1, 7.2**

### Property 11: Prompt Tracking Cleanup After Conversion

*For any* anonymous user with conversion prompt tracking records, after successful conversion, all tracking records for that user should be deleted from the conversion_prompts table.

**Validates: Requirements 7.4**

### Property 12: Password Hashing Applied

*For any* conversion with a plaintext password, the stored password_hash should be a valid bcrypt hash and should not equal the plaintext password.

**Validates: Requirements 5.3**

### Property 13: Unique Constraint Validation

*For any* conversion attempt where the provided email or username already exists in the users table, the system should return a 409 conflict error and not modify the user record.

**Validates: Requirements 3.6, 8.3**

### Property 14: Error Recovery Maintains Anonymous State

*For any* conversion attempt that fails due to validation errors or backend errors, the user's is_anonymous flag should remain true and all user data should remain unchanged.

**Validates: Requirements 8.5**
