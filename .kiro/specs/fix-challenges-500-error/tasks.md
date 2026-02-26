# Implementation Plan: Fix Challenges Screen 500 Error

## Overview

This implementation plan addresses the race condition where the Express server accepts HTTP requests before database initialization completes. The fix involves implementing a startup gate middleware, enhancing error handling, adding table verification, and improving frontend retry logic.

## Tasks

- [x] 1. Create startup gate middleware
  - Create `Back-end/src/middleware/startupGate.js` with database readiness checking
  - Implement `startupGate` middleware function that blocks requests when database is not ready
  - Implement `setDatabaseReady` function to update readiness state
  - Allow health check routes (`/api/health`, `/`, `/api`) to bypass the gate
  - Return 503 with retry-after header when database is not ready
  - Return 503 with error details when initialization failed
  - _Requirements: 1.1, 1.4_

- [ ]* 1.1 Write property test for startup gate blocking behavior
  - **Property 1: Server startup sequence ensures database readiness**
  - **Validates: Requirements 1.1**

- [x] 2. Create table verification utility
  - Create `Back-end/src/utils/tableVerification.js` with table checking functions
  - Implement `verifyTableExists` function that queries information_schema
  - Implement `verifyTableHasData` function that checks row count
  - Add error handling and logging for verification failures
  - _Requirements: 3.1, 3.3_

- [ ]* 2.1 Write property test for table verification
  - **Property 6: Table verification precedes queries**
  - **Validates: Requirements 3.1, 3.2**

- [x] 3. Enhance database initialization with gate integration
  - Modify `Back-end/src/config/database.js` to export `initializeDatabaseWithGate` function
  - Implement async initialization that awaits `initializeDatabase()` completion
  - Call `setDatabaseReady(true)` on successful initialization
  - Call `setDatabaseReady(false, error)` on initialization failure
  - Add detailed error logging for initialization failures
  - _Requirements: 1.1, 1.2, 5.1_

- [ ]* 3.1 Write property test for database initialization idempotency
  - **Property 8: Database initialization is idempotent**
  - **Validates: Requirements 5.1**

- [ ]* 3.2 Write property test for initialization error logging
  - **Property 2: Database initialization failures are logged with complete details**
  - **Validates: Requirements 1.2, 2.1, 2.4, 3.3, 5.2**

- [x] 4. Update server startup sequence
  - Modify `Back-end/src/server.js` to import `initializeDatabaseWithGate` and `startupGate`
  - Add `startupGate` middleware before route definitions
  - Create async `startServer()` function that awaits database initialization
  - Only call `app.listen()` after database initialization completes
  - Add logging for database readiness status in startup message
  - Handle initialization failures gracefully (start server but log warning)
  - _Requirements: 1.1, 1.2_

- [ ]* 4.1 Write integration test for cold start scenario
  - Test that server blocks requests until database is ready
  - Test that requests succeed after initialization completes
  - _Requirements: 1.1, 1.4_

- [x] 5. Enhance getDailyTasks controller with validation and verification
  - Modify `Back-end/src/controllers/tasksController.js` getDailyTasks function
  - Add parameter validation for `limit` (must be 1-100) and `category` (non-empty string)
  - Return 400 status with validation errors for invalid parameters
  - Add table existence verification before querying
  - Return 503 status when table doesn't exist
  - Enhance error logging to include full error object with stack trace
  - Add query parameter logging for debugging
  - Ensure error responses include `error` and `message` fields
  - Include `details` field in development mode only
  - _Requirements: 2.1, 2.2, 2.4, 3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 8.3, 8.4_

- [ ]* 5.1 Write property test for parameter validation
  - **Property 9: Parameter validation rejects invalid inputs**
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ]* 5.2 Write property test for error response format
  - **Property 12: Error responses have consistent format**
  - **Validates: Requirements 8.3, 8.4**

- [ ]* 5.3 Write property test for success response format
  - **Property 11: Success responses have consistent format**
  - **Validates: Requirements 8.1, 8.2**

- [x] 6. Add frontend retry logic for 503 responses
  - Modify `Front-end/src/api/client.ts` to add response interceptor
  - Implement automatic retry for 503 responses with retry-after header
  - Wait for specified retry-after duration before retrying
  - Only retry once per request (track with `_retryCount` flag)
  - Log retry attempts for debugging
  - _Requirements: 4.2_

- [ ]* 6.1 Write property test for frontend retry behavior
  - **Property 7: Frontend retries 503 responses automatically**
  - **Validates: Requirements 4.2**

- [x] 7. Enhance frontend error handling in challenges screen
  - Modify `Front-end/app/(tabs)/challenges.tsx` loadChallenges function
  - Add specific error handling for 503 status (show "System Starting Up" alert)
  - Add specific error handling for 500 status (show "Unable to Load Challenges" alert)
  - Add generic error handling for network errors (show "Connection Error" alert)
  - Include "Retry" button in all error alerts that calls loadChallenges again
  - _Requirements: 4.1, 4.3, 4.4_

- [ ]* 7.1 Write unit tests for frontend error message display
  - Test 500 error shows user-friendly message
  - Test 503 error shows startup message
  - Test network error shows connection message
  - Test all error alerts include retry button
  - _Requirements: 4.1, 4.3_

- [x] 8. Add connection pool monitoring and leak detection
  - Modify `Back-end/src/config/database.js` to add connection monitoring
  - Log warning when connection pool is exhausted
  - Return 503 status when pool is full
  - Add timeout handling for long-running queries
  - Ensure connections are released in all code paths (success, error, timeout)
  - _Requirements: 1.3, 7.1, 7.2, 7.3_

- [ ]* 8.1 Write property test for connection pool management
  - **Property 10: Database connections are properly released**
  - **Validates: Requirements 7.1, 7.2**

- [ ]* 8.2 Write integration test for connection pool exhaustion
  - Test that exhausting pool returns 503
  - Test that connections are released after queries complete
  - _Requirements: 1.3, 7.3_

- [x] 9. Checkpoint - Verify all changes and run tests
  - Ensure all tests pass (unit, property, and integration tests)
  - Test cold start scenario manually (restart server and immediately make request)
  - Test with empty database (verify initialization creates tables)
  - Test with missing daily_tasks table (verify 503 response)
  - Test parameter validation with invalid inputs
  - Test frontend retry logic with mocked 503 responses
  - Ask the user if questions arise

- [x] 10. Update documentation and add monitoring
  - Add comments explaining the startup gate pattern
  - Document the retry logic in frontend API client
  - Add logging statements for debugging (initialization, verification, errors)
  - Update README with information about database initialization
  - Document the 503 response format and retry-after header
  - _Requirements: 1.2, 2.1, 3.3_

## Notes

- Tasks marked with `*` are optional property/unit tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The checkpoint task ensures incremental validation before final deployment
- Property tests validate universal correctness properties across many inputs
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows with real database
