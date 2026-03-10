# Anonymous to Registered User Conversion - Setup Guide

## Overview
This feature allows anonymous users to convert their accounts to full registered accounts at strategic milestone moments (first achievement, first challenge, 150+ points, 3/7 days usage).

## Database Setup

### 1. Run the Migration

Execute the SQL migration to create the `conversion_prompts` table:

```bash
# Connect to your MySQL database
mysql -u your_username -p your_database_name

# Run the migration
source migrations/create_conversion_prompts_table.sql
```

Or manually execute the SQL:

```sql
CREATE TABLE IF NOT EXISTS conversion_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  milestone_type VARCHAR(50) NOT NULL CHECK (milestone_type IN (
    'first_achievement',
    'first_challenge',
    'points_150',
    'usage_3_days',
    'usage_7_days'
  )),
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  dismissed BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT fk_conversion_prompts_user
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT unique_user_milestone 
    UNIQUE (user_id, milestone_type)
);

CREATE INDEX IF NOT EXISTS idx_conversion_prompts_user_id 
  ON conversion_prompts(user_id);

CREATE INDEX IF NOT EXISTS idx_conversion_prompts_milestone_type 
  ON conversion_prompts(milestone_type);
```

### 2. Verify Table Creation

```sql
DESCRIBE conversion_prompts;
```

## Testing the Feature

### Backend Testing

1. **Start the backend server:**
```bash
cd Back-end
npm run dev
```

2. **Create an anonymous user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_anon_user",
    "password": "test123",
    "isAnonymous": true
  }'
```

Save the returned token for subsequent requests.

3. **Trigger a milestone (e.g., complete a task):**
```bash
curl -X POST http://localhost:3000/api/tasks/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 1
  }'
```

Check the response for `conversionPrompt` field.

4. **Convert the account:**
```bash
curl -X POST http://localhost:3000/api/auth/convert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "newpassword123",
    "username": "my_username"
  }'
```

5. **Verify conversion:**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer NEW_TOKEN"
```

Check that `is_anonymous` is now `false`.

### Frontend Testing

1. **Start the React Native app:**
```bash
cd Front-end
npm start
```

2. **Test flow:**
   - Launch the app
   - Click "Continue Anonymously" on login screen
   - Complete a task or challenge
   - Watch for the conversion prompt to appear
   - Click "Create Account"
   - Fill in email, username, password
   - Submit and verify account is converted

## Milestone Triggers

The conversion prompt will appear when:

1. **First Achievement** - User unlocks their first badge
2. **First Challenge** - User completes their first task/challenge
3. **150 Points** - User reaches 150 total points
4. **3 Days Usage** - User has used the app for 3 consecutive days (not yet implemented)
5. **7 Days Usage** - User has used the app for 7 consecutive days (not yet implemented)

## API Endpoints

### POST /api/auth/convert
Convert an anonymous account to registered.

**Headers:**
- `Authorization: Bearer {token}`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "chosen_username"
}
```

**Response:**
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

## Troubleshooting

### Prompt not showing
- Verify user is anonymous (`is_anonymous = true`)
- Check that milestone was actually reached
- Verify `conversion_prompts` table exists
- Check backend logs for errors

### Conversion fails
- Verify email format is valid
- Check password is at least 6 characters
- Ensure username is at least 3 characters
- Verify email/username don't already exist

### Data not preserved
- Check that user_id remains the same before/after conversion
- Verify foreign key relationships are intact
- Check `conversion_prompts` records were cleared after conversion

## Next Steps

To complete the feature:
1. Implement usage tracking for 3/7 day milestones (tasks 8.1-8.3)
2. Add property-based tests (optional tasks marked with *)
3. Test end-to-end flow thoroughly
4. Deploy to production

## Files Modified/Created

### Backend
- `migrations/create_conversion_prompts_table.sql` - Database migration
- `src/utils/milestoneDetection.js` - Milestone detection logic
- `src/controllers/conversionController.js` - Conversion endpoint
- `src/routes/auth.js` - Added /convert route
- `src/controllers/gamificationController.js` - Enhanced with milestone detection
- `src/controllers/tasksController.js` - Enhanced with milestone detection

### Frontend
- `src/api/auth.ts` - Added convertAccount function
- `contexts/AuthContext.tsx` - Added convertToRegistered method
- `components/ConversionPrompt.tsx` - Conversion prompt modal
- `components/ConversionForm.tsx` - Conversion form modal
- `hooks/useMilestoneTracker.ts` - Milestone tracking hook
- `app/(tabs)/index.tsx` - Integrated conversion components

## Support

For issues or questions, check:
1. Backend logs for error messages
2. Frontend console for API errors
3. Database for data integrity
4. Network tab for API request/response details
