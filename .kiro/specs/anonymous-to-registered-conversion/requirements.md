# Requirements Document

## Introduction

This feature enables anonymous users of the gamified alcohol recovery app to convert their accounts to full registered accounts at strategic milestone moments. The conversion preserves all user progress (points, streaks, achievements, logs, tasks, mood entries) while allowing users to secure their data with email/password authentication and enable cross-device synchronization.

## Glossary

- **Anonymous_User**: A user account created without email/password, identified by is_anonymous flag set to true
- **Registered_User**: A user account with email, password, and user-chosen username, identified by is_anonymous flag set to false
- **Conversion_Prompt**: A UI component that encourages anonymous users to create full accounts
- **Milestone_Event**: A significant user achievement that triggers a conversion prompt (first badge, first challenge completion, point threshold, usage duration)
- **Conversion_Flow**: The process of transforming an anonymous account to a registered account
- **User_Progress**: All data associated with a user including points, streaks, achievements, logs, tasks, and mood entries
- **Conversion_System**: The backend and frontend components that manage the account conversion process

## Requirements

### Requirement 1: Milestone-Based Conversion Triggers

**User Story:** As a product manager, I want to show conversion prompts at meaningful achievement moments, so that users are motivated to save their progress when they have something valuable to protect.

#### Acceptance Criteria

1. WHEN an anonymous user unlocks their first achievement or badge, THEN THE Conversion_System SHALL display a conversion prompt
2. WHEN an anonymous user completes their first challenge, THEN THE Conversion_System SHALL display a conversion prompt
3. WHEN an anonymous user reaches 150 or more points, THEN THE Conversion_System SHALL display a conversion prompt
4. WHEN an anonymous user has used the app for 3 consecutive days, THEN THE Conversion_System SHALL display a conversion prompt
5. WHEN an anonymous user has used the app for 7 consecutive days, THEN THE Conversion_System SHALL display a conversion prompt
6. WHEN a registered user triggers any milestone event, THEN THE Conversion_System SHALL NOT display a conversion prompt

### Requirement 2: Conversion Prompt Design and Behavior

**User Story:** As an anonymous user, I want to see attractive and motivational prompts that celebrate my achievements, so that I feel encouraged to create an account without feeling pressured.

#### Acceptance Criteria

1. WHEN a conversion prompt is displayed, THEN THE Conversion_System SHALL show the user's current accomplishment (points earned, badge unlocked, or days of usage)
2. WHEN a conversion prompt is displayed, THEN THE Conversion_System SHALL present benefits including "Save your progress", "Backup your data", "Sync across devices", and "Never lose your streak"
3. WHEN a conversion prompt is displayed, THEN THE Conversion_System SHALL use a celebratory tone that matches the achievement moment
4. WHEN a user dismisses a conversion prompt, THEN THE Conversion_System SHALL allow dismissal without blocking the user's workflow
5. WHEN a user dismisses a conversion prompt, THEN THE Conversion_System SHALL display the prompt again at the next milestone event
6. WHEN a conversion prompt is displayed, THEN THE Conversion_System SHALL provide clear "Create Account" and "Dismiss" action buttons

### Requirement 3: User-Driven Account Creation

**User Story:** As an anonymous user, I want to choose my own username and provide my email and password, so that I have control over my account identity.

#### Acceptance Criteria

1. WHEN a user clicks "Create Account" from a conversion prompt, THEN THE Conversion_System SHALL display a form requesting email, password, and username
2. WHEN the conversion form is displayed, THEN THE Conversion_System SHALL require the user to input their own username
3. WHEN the conversion form is displayed, THEN THE Conversion_System SHALL NOT auto-generate usernames
4. WHEN the conversion form is displayed, THEN THE Conversion_System SHALL NOT create temporary accounts
5. WHEN a user submits the conversion form with valid inputs, THEN THE Conversion_System SHALL validate email format, password strength, and username uniqueness
6. WHEN a user submits the conversion form with an email that already exists, THEN THE Conversion_System SHALL return an error message indicating the email is already registered

### Requirement 4: Data Preservation During Conversion

**User Story:** As an anonymous user converting to a registered account, I want all my progress preserved, so that I don't lose any achievements, points, or streaks I've earned.

#### Acceptance Criteria

1. WHEN an anonymous user successfully converts to a registered account, THEN THE Conversion_System SHALL preserve all points associated with the user
2. WHEN an anonymous user successfully converts to a registered account, THEN THE Conversion_System SHALL preserve all streaks associated with the user
3. WHEN an anonymous user successfully converts to a registered account, THEN THE Conversion_System SHALL preserve all achievements and badges associated with the user
4. WHEN an anonymous user successfully converts to a registered account, THEN THE Conversion_System SHALL preserve all logs associated with the user
5. WHEN an anonymous user successfully converts to a registered account, THEN THE Conversion_System SHALL preserve all tasks associated with the user
6. WHEN an anonymous user successfully converts to a registered account, THEN THE Conversion_System SHALL preserve all mood entries associated with the user
7. WHEN an anonymous user successfully converts to a registered account, THEN THE Conversion_System SHALL maintain all foreign key relationships to the original user_id

### Requirement 5: Backend Account Transformation

**User Story:** As a backend developer, I want to update the existing anonymous user record rather than creating a new account, so that all data relationships remain intact.

#### Acceptance Criteria

1. WHEN an anonymous user converts to a registered account, THEN THE Conversion_System SHALL update the existing user record by setting is_anonymous to false
2. WHEN an anonymous user converts to a registered account, THEN THE Conversion_System SHALL add the user-provided email to the existing user record
3. WHEN an anonymous user converts to a registered account, THEN THE Conversion_System SHALL add the user-provided password (hashed) to the existing user record
4. WHEN an anonymous user converts to a registered account, THEN THE Conversion_System SHALL replace the anonymous username with the user-provided username
5. WHEN an anonymous user converts to a registered account, THEN THE Conversion_System SHALL retain the same user_id
6. WHEN an anonymous user converts to a registered account, THEN THE Conversion_System SHALL NOT create a new user record

### Requirement 6: Post-Conversion Authentication

**User Story:** As a newly registered user, I want to log in with my email and password on any device, so that I can access my account from multiple devices.

#### Acceptance Criteria

1. WHEN a user completes account conversion, THEN THE Conversion_System SHALL issue a new JWT token reflecting the registered user status
2. WHEN a converted user logs out and attempts to log in, THEN THE Conversion_System SHALL authenticate using the email and password provided during conversion
3. WHEN a converted user successfully logs in, THEN THE Conversion_System SHALL grant access to all preserved user progress
4. WHEN a converted user attempts to log in with incorrect credentials, THEN THE Conversion_System SHALL return an authentication error

### Requirement 7: Conversion State Management

**User Story:** As a developer, I want to track which milestones have triggered prompts, so that users don't see duplicate prompts for the same milestone.

#### Acceptance Criteria

1. WHEN a conversion prompt is displayed for a specific milestone, THEN THE Conversion_System SHALL record that the prompt was shown for that milestone
2. WHEN a milestone event occurs that has already triggered a prompt, THEN THE Conversion_System SHALL NOT display another prompt for that same milestone
3. WHEN a user dismisses a prompt and later triggers a different milestone, THEN THE Conversion_System SHALL display a new prompt for the new milestone
4. WHEN a user converts their account, THEN THE Conversion_System SHALL clear all conversion prompt tracking data for that user

### Requirement 8: Input Validation and Error Handling

**User Story:** As a user attempting to convert my account, I want clear feedback on validation errors, so that I can successfully complete the conversion process.

#### Acceptance Criteria

1. WHEN a user submits a conversion form with an invalid email format, THEN THE Conversion_System SHALL return an error message indicating the email format is invalid
2. WHEN a user submits a conversion form with a weak password, THEN THE Conversion_System SHALL return an error message indicating password requirements
3. WHEN a user submits a conversion form with a username that already exists, THEN THE Conversion_System SHALL return an error message indicating the username is taken
4. WHEN a user submits a conversion form with empty required fields, THEN THE Conversion_System SHALL return an error message indicating which fields are required
5. WHEN a conversion fails due to a backend error, THEN THE Conversion_System SHALL maintain the user's anonymous account state and display a user-friendly error message
