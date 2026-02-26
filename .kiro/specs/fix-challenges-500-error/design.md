# Design Document: Fix Challenges Screen 500 Error

## Overview

This bugfix addresses a critical race condition in the backend where the Express server starts accepting HTTP requests before the database initialization completes. When the frontend calls `/tasks/daily`, the `getDailyTasks` controller attempts to query the `daily_tasks` table, but if the table hasn't been created yet (or if the database connection isn't ready), the query fails with a 500 error.

The root cause is in the server startup sequence:
1. Server starts and begins listening on port 3000
2. Database connection pool is created asynchronously
3. Database initialization runs asynchronously (creates tables, inserts data)
4. Frontend makes request to `/tasks/daily` before step 3 completes
5. Query fails because table doesn't exist or connection isn't ready

The solution involves:
- Implementing a startup gate that blocks HTTP requests until database is ready
- Adding table existence verification before queries
- Improving error handling and logging throughout the database layer
- Adding retry logic in the frontend for transient failures

## Architecture

### Current Flow (Problematic)

```
Server Start → Listen on Port 3000
                    ↓
            (Async) Database Pool Creation
                    ↓
            (Async) Database Initialization
                    ↓
            Create Tables & Insert Data

Meanwhile...
Frontend Request → getDailyTasks Controller → Query daily_tasks → ERROR (table may not exist)
```

### Proposed Flow (Fixed)

```
Server Start → Database Pool Creation (await)
                    ↓
            Database Initialization (await)
                    ↓
            Verify Tables Created
                    ↓
            Listen on Port 3000 ✓
                    ↓
Frontend Request → Startup Gate Check → getDailyTasks Controller → Query daily_tasks → SUCCESS
```

## Components and Interfaces

### 1. Startup Gate Middleware

A new Express middleware that checks if the database is ready before processing requests.

```javascript
// src/middleware/startupGate.js

let databaseReady = false;
let initializationError = null;

function setDatabaseReady(ready, error = null) {
  databaseReady = ready;
  initializationError = error;
}

function startupGate(req, res, next) {
  // Allow health check and root routes to bypass the gate
  if (req.path === '/api/health' || req.path === '/' || req.path === '/api') {
    return next();
  }

  if (!databaseReady) {
    if (initializationError) {
      return res.status(503).json({
        error: 'Database initialization failed',
        message: 'The server is experiencing database issues. Please try again later.',
        retryAfter: 30
      });
    }
    
    return res.status(503).json({
      error: 'Service starting up',
      message: 'The server is initializing. Please try again in a few seconds.',
      retryAfter: 5
    });
  }

  next();
}

module.exports = { startupGate, setDatabaseReady };
```

### 2. Enhanced Database Initialization

Modify `src/config/database.js` to properly await initialization and signal readiness.

```javascript
// src/config/database.js (modified sections)

const { initializeDatabase } = require('./initDatabase');
const { setDatabaseReady } = require('../middleware/startupGate');

// Initialize database and signal readiness
async function initializeDatabaseWithGate() {
  try {
    console.log('🔄 Starting database initialization...');
    await initializeDatabase();
    console.log('✅ Database initialization complete');
    setDatabaseReady(true);
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    setDatabaseReady(false, error);
    return false;
  }
}

// Export initialization function
module.exports = {
  pool,
  query,
  queryOne,
  transaction,
  initializeDatabaseWithGate
};
```

### 3. Table Verification Helper

Add a utility function to verify table existence before queries.

```javascript
// src/utils/tableVerification.js

const { query } = require('../config/database');

async function verifyTableExists(tableName) {
  const sql = `
    SELECT COUNT(*) as count 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
    AND table_name = ?
  `;
  
  const { data, error } = await query(sql, [tableName]);
  
  if (error) {
    console.error(`[TableVerification] Error checking table ${tableName}:`, error);
    return false;
  }
  
  return data && data[0] && data[0].count > 0;
}

async function verifyTableHasData(tableName) {
  const sql = `SELECT COUNT(*) as count FROM ??`;
  const { data, error } = await query(sql, [tableName]);
  
  if (error) {
    console.error(`[TableVerification] Error checking data in ${tableName}:`, error);
    return false;
  }
  
  return data && data[0] && data[0].count > 0;
}

module.exports = { verifyTableExists, verifyTableHasData };
```

### 4. Enhanced getDailyTasks Controller

Improve error handling, logging, and add table verification.

```javascript
// src/controllers/tasksController.js (getDailyTasks function - enhanced)

const { verifyTableExists, verifyTableHasData } = require('../utils/tableVerification');

const getDailyTasks = async (req, res) => {
  try {
    // Validate and sanitize parameters
    const { category, limit = 20 } = req.query;
    
    // Validate limit parameter
    const limitValue = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    
    // Validate category parameter if provided
    if (category && (typeof category !== 'string' || category.trim().length === 0)) {
      return res.status(400).json({ 
        error: 'Invalid category parameter',
        message: 'Category must be a non-empty string'
      });
    }
    
    // Verify table exists
    const tableExists = await verifyTableExists('daily_tasks');
    if (!tableExists) {
      console.error('[Tasks] daily_tasks table does not exist');
      return res.status(503).json({
        error: 'Database not ready',
        message: 'The challenges system is initializing. Please try again in a moment.',
        retryAfter: 10
      });
    }
    
    // Build query
    let sql = 'SELECT * FROM daily_tasks';
    const params = [];

    if (category) {
      sql += ' WHERE category = ?';
      params.push(category.trim());
    }

    sql += ' ORDER BY points_reward DESC LIMIT ?';
    params.push(limitValue);

    console.log(`[Tasks] Executing query: ${sql}`, `Params: [${params.join(', ')}]`);
    
    const result = await query(sql, params);
    const { data, error } = result;
    
    if (error) {
      console.error('[Tasks] Query error:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sql: error.sql,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        stack: error.stack
      });
      
      return res.status(500).json({ 
        error: 'Database query failed', 
        message: 'Failed to retrieve challenges. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    if (!data) {
      console.error('[Tasks] Query returned null/undefined data', {
        sql,
        params,
        result
      });
      return res.status(500).json({ 
        error: 'Database query returned no data',
        message: 'An unexpected error occurred. Please try again.'
      });
    }
    
    console.log(`[Tasks] Raw data from query: Array of ${data.length} items`);
    if (data.length > 0) {
      console.log(`[Tasks] First task sample:`, JSON.stringify(data[0], null, 2));
    }
    
    // Filter active tasks
    const activeTasks = (data || []).filter(task => {
      const isActive = task.is_active;
      const isActiveValue = isActive === 1 || isActive === true || isActive === '1' || 
                           isActive === 'TRUE' || isActive === null || isActive === undefined;
      return isActiveValue;
    });
    
    console.log(`[Tasks] Found ${activeTasks.length} active tasks from ${(data || []).length} total tasks`);
    
    // Remove duplicates by task_name
    const taskMap = new Map();
    activeTasks.forEach(task => {
      const title = task.task_name;
      if (!taskMap.has(title) || (taskMap.get(title).points_reward || 0) < (task.points_reward || 0)) {
        taskMap.set(title, task);
      }
    });
    
    const uniqueTasks = Array.from(taskMap.values());
    const tasks = uniqueTasks.map(task => ({
      id: task.id.toString(),
      title: task.task_name,
      description: task.description,
      points_reward: task.points_reward,
      difficulty: task.difficulty || 'Easy',
      category: task.category,
      is_active: task.is_active,
      created_at: task.created_at
    }));
    
    console.log(`[Tasks] Returning ${tasks.length} unique challenges`);
    res.status(200).json({ tasks, challenges: tasks, count: tasks.length });
  } catch (error) {
    console.error('[Tasks] Unexpected error in getDailyTasks:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Server error', 
      message: 'An unexpected error occurred. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
```

### 5. Modified Server Startup

Update `src/server.js` to await database initialization before listening.

```javascript
// src/server.js (modified startup section)

const { initializeDatabaseWithGate } = require('./config/database');
const { startupGate } = require('./middleware/startupGate');

// ... existing middleware ...

// Add startup gate middleware BEFORE routes
app.use(startupGate);

// ... existing routes ...

// Async startup function
async function startServer() {
  try {
    // Initialize database first
    const dbReady = await initializeDatabaseWithGate();
    
    if (!dbReady) {
      console.warn('⚠️  Server starting with database initialization failure');
      console.warn('⚠️  API requests will return 503 until database is ready');
    }
    
    // Start listening only after database is ready
    app.listen(PORT, () => {
      const serverUrl = `http://localhost:${PORT}`;
      console.log('\n' + '='.repeat(60));
      console.log('🚀 Mind Fusion API Server Started Successfully!');
      console.log('='.repeat(60));
      console.log(`📍 Server URL: ${serverUrl}`);
      console.log(`🌐 Open in browser: ${serverUrl}`);
      console.log(`📊 Health Check: ${serverUrl}/api/health`);
      console.log(`📚 API Base: ${serverUrl}/api`);
      console.log('='.repeat(60));
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: MySQL - ${dbReady ? '✅ Ready' : '⚠️  Initializing'}`);
      console.log(`Port: ${PORT}`);
      console.log('='.repeat(60));
      console.log(`\n✨ Click here to view: ${serverUrl}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
```

### 6. Frontend Retry Logic

Enhance the frontend API client to handle 503 responses with automatic retry.

```typescript
// Front-end/src/api/client.ts (add retry logic)

import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add retry interceptor for 503 responses
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retryCount?: number };
    
    // Handle 503 Service Unavailable with retry
    if (error.response?.status === 503 && config && !config._retryCount) {
      const retryAfter = (error.response.data as any)?.retryAfter || 5;
      console.log(`[API] Service unavailable, retrying after ${retryAfter}s...`);
      
      config._retryCount = 1;
      
      // Wait for the specified retry-after duration
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      
      // Retry the request
      return apiClient.request(config);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 7. Enhanced Frontend Error Handling

Update the challenges screen to show better error messages.

```typescript
// Front-end/app/(tabs)/challenges.tsx (error handling enhancement)

const loadChallenges = async () => {
  if (!profile?.id) return;

  try {
    console.log('[Challenges] Loading challenges...');
    const challengesResponse = await api.getChallenges();
    // ... existing logic ...
  } catch (error: any) {
    console.error('[Challenges] Error loading challenges:', error);
    
    // Show user-friendly error message
    if (error.response?.status === 503) {
      Alert.alert(
        'System Starting Up',
        'The challenges system is initializing. Please try again in a moment.',
        [{ text: 'Retry', onPress: () => loadChallenges() }]
      );
    } else if (error.response?.status === 500) {
      Alert.alert(
        'Unable to Load Challenges',
        'We\'re experiencing technical difficulties. Please try again later.',
        [{ text: 'Retry', onPress: () => loadChallenges() }]
      );
    } else {
      Alert.alert(
        'Connection Error',
        'Please check your internet connection and try again.',
        [{ text: 'Retry', onPress: () => loadChallenges() }]
      );
    }
    
    setChallenges([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};
```

## Data Models

No changes to existing data models. The `daily_tasks` table structure remains the same:

```sql
CREATE TABLE IF NOT EXISTS daily_tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  difficulty VARCHAR(20) DEFAULT 'Easy',
  points_reward INT DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Correctness Properties


A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Server startup sequence ensures database readiness

*For any* server startup sequence, the server should not accept API requests (except health checks) until database initialization completes, ensuring requests never fail due to missing tables.

**Validates: Requirements 1.1**

### Property 2: Database initialization failures are logged with complete details

*For any* database initialization failure, the system should log the complete error object including message, stack trace, error code, and context about what operation failed.

**Validates: Requirements 1.2, 2.1, 2.4, 3.3, 5.2**

### Property 3: Connection pool exhaustion returns service unavailable

*For any* state where the database connection pool is exhausted, subsequent requests should receive a 503 status with a descriptive error message about connection issues.

**Validates: Requirements 1.3**

### Property 4: Requests during initialization receive 503 responses

*For any* request made while database initialization is in progress, the server should return a 503 status with a retry-after header rather than processing the request.

**Validates: Requirements 1.4**

### Property 5: Query failures return 500 with details in development mode

*For any* database query failure in development mode, the response should have status 500 and include both a user-friendly error message and technical details in the response body.

**Validates: Requirements 2.2**

### Property 6: Table verification precedes queries

*For any* request to getDailyTasks, the system should verify the daily_tasks table exists before attempting to query it, returning 503 if the table is missing.

**Validates: Requirements 3.1, 3.2**

### Property 7: Frontend retries 503 responses automatically

*For any* 503 response with a retry-after header, the frontend API client should wait the specified duration and automatically retry the request once.

**Validates: Requirements 4.2**

### Property 8: Database initialization is idempotent

*For any* number of times database initialization runs, it should check for existing tables before creating them and never fail due to tables already existing.

**Validates: Requirements 5.1**

### Property 9: Parameter validation rejects invalid inputs

*For any* invalid parameter values (limit outside 1-100 range, empty category string, non-numeric limit), the getDailyTasks controller should return a 400 status with validation error details.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 10: Database connections are properly released

*For any* database query (successful or failed), the connection should be released back to the pool after the query completes or times out.

**Validates: Requirements 7.1, 7.2**

### Property 11: Success responses have consistent format

*For any* successful getDailyTasks request, the response should include both `tasks` and `challenges` arrays and a `count` field matching the array length.

**Validates: Requirements 8.1, 8.2**

### Property 12: Error responses have consistent format

*For any* error in getDailyTasks, the response should include an `error` field with a user-friendly message, and in development mode, should also include a `details` field with technical information.

**Validates: Requirements 8.3, 8.4**

## Error Handling

### Database Connection Errors

- **Connection pool exhaustion**: Return 503 with retry-after header
- **Connection timeout**: Log warning, release connection, return 500
- **Connection refused**: Log error with connection details, return 503

### Query Errors

- **Table doesn't exist**: Return 503 with message about system initializing
- **SQL syntax error**: Log full error with query and parameters, return 500
- **Null/undefined result**: Log query details, return 500
- **Query timeout**: Release connection, log warning, return 500

### Initialization Errors

- **Database doesn't exist**: Attempt to create it, log result
- **Insufficient permissions**: Log detailed error, set initialization failed state
- **Table creation fails**: Log which table failed, continue with other tables
- **Data insertion fails**: Log which insert failed, continue with other inserts

### Frontend Error Handling

- **500 errors**: Show user-friendly message with manual retry button
- **503 errors**: Automatically retry after specified delay, show "starting up" message
- **Network errors**: Show connection error message with manual retry
- **Timeout errors**: Show timeout message with manual retry

## Testing Strategy

This bugfix requires both unit tests and integration tests to ensure the race condition is resolved and error handling works correctly.

### Unit Tests

Unit tests should focus on individual components and specific error scenarios:

1. **Startup Gate Middleware**
   - Test that health check routes bypass the gate
   - Test that API routes are blocked when database is not ready
   - Test that API routes are allowed when database is ready
   - Test 503 response format when initialization is in progress
   - Test 503 response format when initialization failed

2. **Table Verification**
   - Test verifyTableExists returns true for existing tables
   - Test verifyTableExists returns false for non-existent tables
   - Test verifyTableHasData returns true for tables with data
   - Test verifyTableHasData returns false for empty tables
   - Test error handling when information_schema query fails

3. **Parameter Validation**
   - Test limit parameter clamping (negative → 1, over 100 → 100)
   - Test limit parameter with non-numeric values
   - Test category parameter with empty string
   - Test category parameter with null/undefined
   - Test default values when parameters are omitted

4. **Error Response Formatting**
   - Test 500 error response includes error and message fields
   - Test 500 error response includes details field in development mode
   - Test 500 error response excludes details field in production mode
   - Test 503 error response includes retryAfter field
   - Test success response includes tasks, challenges, and count fields

5. **Frontend Retry Logic**
   - Test 503 response triggers automatic retry
   - Test retry waits for retry-after duration
   - Test retry only happens once (no infinite loops)
   - Test non-503 errors don't trigger retry
   - Test retry uses same request configuration

### Property-Based Tests

Property tests should verify universal behaviors across many inputs and scenarios:

1. **Server Startup Sequence Property**
   - Generate: Random delays in database initialization
   - Test: Requests made during initialization always get 503, never 500
   - Verify: Once initialization completes, requests succeed

2. **Logging Completeness Property**
   - Generate: Various types of database errors
   - Test: All errors result in logs containing error message, stack trace, and context
   - Verify: Logs are parseable and contain required fields

3. **Connection Pool Management Property**
   - Generate: Random sequences of queries (some successful, some failing)
   - Test: Connection pool size returns to initial value after all queries complete
   - Verify: No connection leaks occur

4. **Parameter Validation Property**
   - Generate: Random parameter values (valid and invalid)
   - Test: Invalid parameters always return 400, valid parameters return 200 or 500
   - Verify: No invalid parameters cause crashes or unexpected behavior

5. **Response Format Consistency Property**
   - Generate: Various database states (empty table, full table, missing table)
   - Test: All success responses have tasks, challenges, and count fields
   - Verify: All error responses have error and message fields

6. **Idempotency Property**
   - Generate: Random number of initialization runs (1-10)
   - Test: Running initialization multiple times doesn't cause errors
   - Verify: Final database state is identical regardless of run count

7. **Frontend Retry Property**
   - Generate: Random retry-after values (1-30 seconds)
   - Test: Frontend waits the specified duration before retrying
   - Verify: Retry happens exactly once per 503 response

### Integration Tests

Integration tests should verify the complete flow from frontend to database:

1. **Cold Start Test**
   - Start server from scratch
   - Make immediate request to /tasks/daily
   - Verify: Either succeeds or returns 503 (never 500)
   - Wait for retry-after duration
   - Retry request
   - Verify: Request succeeds

2. **Database Recovery Test**
   - Start server with database unavailable
   - Verify: Server starts but returns 503 for API requests
   - Make database available
   - Restart server
   - Verify: Requests now succeed

3. **Empty Table Test**
   - Start server with empty daily_tasks table
   - Make request to /tasks/daily
   - Verify: Returns 200 with empty arrays

4. **Connection Pool Exhaustion Test**
   - Make concurrent requests exceeding pool size
   - Verify: Some requests succeed, others get 503
   - Wait for connections to be released
   - Verify: Subsequent requests succeed

5. **Frontend Error Handling Test**
   - Mock 500 error from backend
   - Verify: Frontend shows user-friendly error message
   - Verify: Retry button is present
   - Mock 503 error from backend
   - Verify: Frontend automatically retries after delay

### Test Configuration

- **Property tests**: Minimum 100 iterations per test
- **Integration tests**: Run against real MySQL database (not mocked)
- **Unit tests**: Use mocks for database connections
- **Test environment**: Set NODE_ENV=test to avoid polluting logs
- **Coverage target**: 90% code coverage for modified files

### Test Tags

Each property test must include a comment tag referencing the design property:

```javascript
// Feature: fix-challenges-500-error, Property 1: Server startup sequence ensures database readiness
test('server blocks requests until database is ready', async () => {
  // Test implementation
});
```

## Implementation Notes

### Deployment Considerations

1. **Zero-downtime deployment**: The startup gate ensures new instances don't serve traffic until ready
2. **Health check endpoint**: Always available for load balancer health checks
3. **Graceful shutdown**: Ensure in-flight requests complete before shutdown
4. **Database migration**: Run migrations before deploying new code

### Performance Impact

- **Startup time**: Adds 2-5 seconds to server startup (database initialization)
- **Request latency**: Adds <1ms for table verification check
- **Memory overhead**: Minimal (startup gate state is a single boolean)
- **Connection pool**: No change to existing pool configuration

### Monitoring and Observability

Add logging for:
- Database initialization start/complete/failure
- Startup gate state changes
- Table verification failures
- Connection pool exhaustion events
- Query failures with full context

Add metrics for:
- Database initialization duration
- Requests blocked by startup gate
- Table verification check duration
- Connection pool utilization
- Query error rate

### Rollback Plan

If issues occur after deployment:
1. Revert to previous version (removes startup gate)
2. Database schema is unchanged, so no migration rollback needed
3. Frontend changes are backward compatible (retry logic is additive)

### Future Improvements

1. **Connection pool monitoring**: Add metrics for pool size, wait time, and utilization
2. **Automatic table repair**: If table is missing, trigger re-initialization automatically
3. **Circuit breaker**: If database fails repeatedly, stop attempting queries temporarily
4. **Request queuing**: Instead of returning 503, queue requests during initialization
5. **Distributed initialization**: Use distributed lock to ensure only one instance initializes database
