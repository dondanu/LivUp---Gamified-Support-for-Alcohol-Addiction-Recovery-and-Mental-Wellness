# Implementation Plan: Anonymous to Registered User Conversion

## Overview

This implementation plan breaks down the anonymous-to-registered user conversion feature into discrete coding tasks. The approach follows a bottom-up strategy: starting with database schema and backend infrastructure, then building the conversion logic, and finally implementing the frontend components. Each task builds on previous work to ensure incremental progress with no orphaned code.

## Tasks

- [x] 1. Create database schema and migration for conversion tracking
  - Create `conversion_prompts` table with fields: id, user_id, milestone_type, shown_at, dismissed
  - Add unique constraint on (user_id, milestone_type)
  - Add foreign key constraint to users table with CASCADE delete
  - _Requirements: 7.1, 7.2_

- [ ] 2. Implement milestone detection utility
  - [x] 2.1 Create milestone detection module (`src/utils/milestoneDetection.js`)
    - Implement `detectMilestone(userId, eventType, eventData)` function
    - Support event types: 'achievement_unlocked', 'challenge_completed', 'points_earned', 'usage_days'
    - Check if milestone threshold is reached (first achievement, first challenge, 150+ points, 3/7 days)
    - Query conversion_prompts table to check if prompt already shown
    - Return { shouldShowPrompt, milestoneType, milestoneData }
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.2_
  
  - [ ]* 2.2 Write property test for milestone detection
    - **Property 10: Prompt Deduplication**
    - **Validates: Requirements 7.1, 7.2**
  
  - [x] 2.3 Create prompt tracking functions
    - Implement `recordPromptShown(userId, milestoneType)` function
    - Implement `clearPromptTracking(userId)` function for post-conversion cleanup
    - _Requirements: 7.1, 7.4_
  
  - [ ]* 2.4 Write unit tests for prompt tracking
    - Test recordPromptShown creates database record
    - Test clearPromptTracking deletes all user records
    - _Requirements: 7.1, 7.4_

- [ ] 3. Create conversion controller and endpoint
  - [x] 3.1 Implement conversion controller (`src/controllers/conversionController.js`)
    - Create `convertAnonymousToRegistered` function
    - Validate user is anonymous (check is_anonymous flag)
    - Validate email format, password length (min 6 chars), username presence
    - Check email uniqueness in users table
    - Check username uniqueness in users table
    - Hash password using bcrypt
    - Update user record: set is_anonymous=false, add email, password_hash, username
    - Clear conversion prompt tracking
    - Generate new JWT token with updated user info
    - Return token and updated user object
    - _Requirements: 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 7.4_
  
  - [ ]* 3.2 Write property test for in-place account update
    - **Property 6: In-Place Account Update**
    - **Validates: Requirements 5.5, 5.6**
  
  - [ ]* 3.3 Write property test for field updates
    - **Property 7: All Required Fields Updated During Conversion**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
  
  - [ ]* 3.4 Write property test for password hashing
    - **Property 12: Password Hashing Applied**
    - **Validates: Requirements 5.3**
  
  - [ ]* 3.5 Write property test for unique constraint validation
    - **Property 13: Unique Constraint Validation**
    - **Validates: Requirements 3.6, 8.3**
  
  - [ ]* 3.6 Write property test for input validation
    - **Property 4: Input Validation Rejects Invalid Data**
    - **Validates: Requirements 3.5, 8.1, 8.2, 8.4**

- [ ] 4. Add conversion route and validation
  - [x] 4.1 Create conversion route in auth routes (`src/routes/auth.js`)
    - Add POST /api/auth/convert endpoint
    - Require authentication (use authenticateToken middleware)
    - Add express-validator rules for email, password, username
    - Wire to convertAnonymousToRegistered controller
    - _Requirements: 3.5, 8.1, 8.2, 8.4_
  
  - [ ]* 4.2 Write unit tests for route validation
    - Test route requires authentication
    - Test validation middleware catches invalid inputs
    - _Requirements: 3.5_

- [ ] 5. Checkpoint - Test backend conversion flow
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Enhance gamification controller with milestone detection
  - [x] 6.1 Update checkAndAwardAchievements function
    - After awarding achievements, call detectMilestone with 'achievement_unlocked' event
    - Check if this is the first achievement (earnedIds.size === 0 before awarding)
    - Include conversionPrompt field in response if shouldShowPrompt is true
    - _Requirements: 1.1, 2.1_
  
  - [x] 6.2 Update updateUserPoints function
    - After updating points, call detectMilestone with 'points_earned' event
    - Pass newTotalPoints in eventData
    - Include conversionPrompt field in response if shouldShowPrompt is true
    - _Requirements: 1.3, 2.1_
  
  - [ ]* 6.3 Write property test for registered users never see prompts
    - **Property 1: Registered Users Never See Conversion Prompts**
    - **Validates: Requirements 1.6**

- [ ] 7. Enhance tasks and challenges controllers with milestone detection
  - [x] 7.1 Update task completion endpoint
    - After completing task, check if it's the first task completion
    - Call detectMilestone with 'challenge_completed' event if first completion
    - Include conversionPrompt field in response
    - _Requirements: 1.2, 2.1_
  
  - [ ] 7.2 Update challenge completion endpoint
    - After completing challenge, check if it's the first challenge
    - Call detectMilestone with 'challenge_completed' event if first completion
    - Include conversionPrompt field in response
    - _Requirements: 1.2, 2.1_

- [ ] 8. Implement usage tracking for time-based milestones
  - [ ] 8.1 Create usage tracking utility
    - Implement function to check consecutive usage days
    - Query user activity logs to determine usage patterns
    - Call detectMilestone with 'usage_days' event when 3 or 7 days reached
    - _Requirements: 1.4, 1.5_
  
  - [ ] 8.2 Add usage check to profile fetch or daily login
    - Integrate usage tracking into getProfile or a daily check endpoint
    - Include conversionPrompt field in response if milestone reached
    - _Requirements: 1.4, 1.5_
  
  - [ ]* 8.3 Write unit tests for usage tracking
    - Test 3-day milestone detection
    - Test 7-day milestone detection
    - Test non-consecutive days don't trigger milestone
    - _Requirements: 1.4, 1.5_

- [ ] 9. Checkpoint - Test backend milestone detection
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Create frontend conversion API functions
  - [x] 10.1 Add conversion API function to api.ts
    - Create `convertAccount(email, password, username)` function
    - Make POST request to /api/auth/convert
    - Handle response and errors
    - Store new token using tokenManager
    - _Requirements: 3.1, 6.1_
  
  - [ ]* 10.2 Write unit tests for API function
    - Test successful conversion request
    - Test error handling
    - Test token storage
    - _Requirements: 3.1_

- [ ] 11. Enhance AuthContext with conversion method
  - [x] 11.1 Add convertToRegistered method to AuthContext
    - Accept email, password, username parameters
    - Call convertAccount API function
    - Update user state with response
    - Refresh profile data
    - Return error object if conversion fails
    - _Requirements: 3.1, 6.1_
  
  - [ ]* 11.2 Write property test for post-conversion authentication
    - **Property 8: Post-Conversion Authentication Round Trip**
    - **Validates: Requirements 6.2, 6.3**
  
  - [ ]* 11.3 Write property test for JWT token status
    - **Property 9: New JWT Token Reflects Registered Status**
    - **Validates: Requirements 6.1**

- [ ] 12. Create ConversionPrompt component
  - [x] 12.1 Implement ConversionPrompt.tsx component
    - Create modal component with celebratory design
    - Accept props: visible, milestoneType, milestoneData, onDismiss, onConvert
    - Display milestone-specific messaging based on milestoneType
    - Show accomplishment from milestoneData (achievement name, points, days, etc.)
    - Display benefits: "Save your progress", "Backup your data", "Sync across devices", "Never lose your streak"
    - Provide "Create Account" button that calls onConvert
    - Provide "Maybe Later" button that calls onDismiss
    - Use celebratory styling (colors, animations, icons)
    - _Requirements: 2.1, 2.2, 2.4, 2.6_
  
  - [ ]* 12.2 Write unit tests for ConversionPrompt
    - Test component renders with different milestone types
    - Test dismiss button calls onDismiss
    - Test create account button calls onConvert
    - Test milestone data is displayed correctly
    - _Requirements: 2.1, 2.6_

- [ ] 13. Create ConversionForm component
  - [x] 13.1 Implement ConversionForm.tsx component
    - Create modal form component
    - Accept props: visible, onSubmit, onCancel, loading, error
    - Add email input with validation (email format)
    - Add password input with validation (min 6 characters)
    - Add username input with validation (required, min 3 characters)
    - Show inline validation errors
    - Display loading state during submission
    - Display error message from props
    - Provide "Create Account" submit button
    - Provide "Cancel" button that calls onCancel
    - _Requirements: 3.1, 3.2, 3.5, 8.1, 8.2, 8.4_
  
  - [ ]* 13.2 Write unit tests for ConversionForm
    - Test form validation (email, password, username)
    - Test form submission calls onSubmit with correct data
    - Test cancel button calls onCancel
    - Test error display
    - Test loading state
    - _Requirements: 3.1, 3.5_

- [ ] 14. Create useMilestoneTracker hook
  - [x] 14.1 Implement useMilestoneTracker.ts hook
    - Create state for promptInfo (milestoneType, milestoneData, shouldShowPrompt)
    - Implement checkResponse function that inspects API responses for conversionPrompt field
    - Only set promptInfo if user is anonymous and conversionPrompt exists
    - Implement dismissPrompt function that clears promptInfo
    - Return { promptInfo, checkResponse, dismissPrompt }
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ]* 14.2 Write unit tests for useMilestoneTracker
    - Test hook detects milestone in API response
    - Test hook ignores milestone for registered users
    - Test dismissPrompt clears state
    - _Requirements: 1.6_

- [ ] 15. Integrate conversion flow into main app
  - [x] 15.1 Add conversion components to app layout
    - Import ConversionPrompt and ConversionForm components
    - Import useMilestoneTracker hook
    - Add state for showing conversion form
    - Render ConversionPrompt when promptInfo is set
    - Render ConversionForm when user clicks "Create Account"
    - Handle form submission by calling AuthContext.convertToRegistered
    - Handle successful conversion by hiding form and showing success message
    - Handle errors by displaying error in form
    - _Requirements: 2.4, 2.5, 3.1_
  
  - [x] 15.2 Integrate milestone checking into API calls
    - Wrap gamification API calls with checkResponse from useMilestoneTracker
    - Wrap task/challenge completion calls with checkResponse
    - Wrap profile fetch with checkResponse for usage-based milestones
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 15.3 Write property test for prompt reappearance
    - **Property 3: Dismissed Prompts Reappear at Different Milestones**
    - **Validates: Requirements 2.5**
  
  - [ ]* 15.4 Write property test for prompt contains milestone info
    - **Property 2: Conversion Prompt Contains Milestone Information**
    - **Validates: Requirements 2.1**

- [ ] 16. Implement data preservation verification
  - [ ]* 16.1 Write property test for complete data preservation
    - **Property 5: Complete Data Preservation During Conversion**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**
  
  - [ ]* 16.2 Write property test for prompt tracking cleanup
    - **Property 11: Prompt Tracking Cleanup After Conversion**
    - **Validates: Requirements 7.4**
  
  - [ ]* 16.3 Write property test for error recovery
    - **Property 14: Error Recovery Maintains Anonymous State**
    - **Validates: Requirements 8.5**

- [ ] 17. Add error handling and edge cases
  - [ ] 17.1 Enhance conversion controller error handling
    - Add try-catch blocks around database operations
    - Use transactions to ensure atomicity
    - Return appropriate HTTP status codes (400, 403, 409, 500)
    - Return user-friendly error messages
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 17.2 Enhance frontend error handling
    - Display network errors with retry option
    - Display validation errors inline
    - Display server errors from response
    - Handle token expiration gracefully
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 17.3 Write unit tests for error scenarios
    - Test conversion fails when user is not anonymous
    - Test conversion fails with duplicate email
    - Test conversion fails with duplicate username
    - Test conversion fails with invalid inputs
    - Test user remains anonymous after failed conversion
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 18. Final checkpoint - End-to-end testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties across many inputs (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- Backend uses Node.js + Express + Supabase
- Frontend uses React Native + TypeScript
- Property-based testing library: fast-check
