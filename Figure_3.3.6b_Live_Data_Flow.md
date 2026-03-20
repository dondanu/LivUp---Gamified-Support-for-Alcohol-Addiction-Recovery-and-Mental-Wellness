# Figure 3.3.6b: Live Data Flow – React Native Frontend Receiving Backend API Data

## Visual Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           REACT NATIVE FRONTEND                                 │
│                              (Mobile App)                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   Auth Screen   │    │  Dashboard      │    │  Progress View  │            │
│  │                 │    │                 │    │                 │            │
│  │ • Login/Register│    │ • Daily Stats   │    │ • Weekly Report │            │
│  │ • Profile       │    │ • Mood Tracker  │    │ • Monthly Data  │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                     │
│           ▼                       ▼                       ▼                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                        API CLIENT LAYER                                     ││
│  │                     (Front-end/lib/api.ts)                                  ││
│  │                                                                             ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          ││
│  │  │    Auth     │ │   Drinks    │ │    Mood     │ │  Progress   │          ││
│  │  │   Service   │ │   Service   │ │   Service   │ │   Service   │          ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                      │                                          │
└──────────────────────────────────────┼──────────────────────────────────────────┘
                                       │
                    HTTP/HTTPS Requests │ JSON Responses
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND API SERVER                                   │
│                         (Node.js + Express.js)                                 │
│                        Base URL: http://10.225.86.63:3000/api                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   Auth Routes   │    │  Drinks Routes  │    │   Mood Routes   │            │
│  │                 │    │                 │    │                 │            │
│  │ POST /auth/login│    │ POST /drinks/log│    │ POST /mood/log  │            │
│  │ POST /register  │    │ GET /drinks/logs│    │ GET /mood/logs  │            │
│  │ GET /profile    │    │ GET /statistics │    │ GET /statistics │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                     │
│           ▼                       ▼                       ▼                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                        CONTROLLER LAYER                                     ││
│  │                                                                             ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          ││
│  │  │    Auth     │ │   Drinks    │ │    Mood     │ │ Gamification│          ││
│  │  │ Controller  │ │ Controller  │ │ Controller  │ │ Controller  │          ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                           DATABASE LAYER                                    ││
│  │                            (SQLite/MySQL)                                   ││
│  │                                                                             ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          ││
│  │  │    Users    │ │ Drink_Logs  │ │  Mood_Logs  │ │   Tasks     │          ││
│  │  │    Table    │ │    Table    │ │    Table    │ │   Table     │          ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Live Data Flow Examples

### 1. User Authentication Flow
```
Frontend → POST /api/auth/login → Backend Controller → Database → JWT Token → Frontend
```

### 2. Drink Logging Flow
```
Frontend → POST /api/drinks/log → Drinks Controller → Database Insert → Statistics Update → JSON Response → Frontend UI Update
```

### 3. Dashboard Data Loading
```
Frontend → GET /api/progress/dashboard → Progress Controller → Multiple DB Queries → Aggregated Data → JSON Response → Dashboard Refresh
```

### 4. Real-time Statistics Flow
```
Frontend → GET /api/drinks/statistics → Drinks Controller → Database Aggregation → Current Stats → JSON Response → Charts Update
```

## API Endpoints Summary (41 Total)

### Authentication (3 endpoints)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Drinks Tracking (4 endpoints)
- `POST /api/drinks/log` - Log drink consumption
- `GET /api/drinks/logs` - Get drink history
- `GET /api/drinks/statistics` - Get drink statistics
- `DELETE /api/drinks/:logId` - Delete drink log

### Mood Tracking (4 endpoints)
- `POST /api/mood/log` - Log mood entry
- `GET /api/mood/logs` - Get mood history
- `GET /api/mood/statistics` - Get mood statistics
- `DELETE /api/mood/:logId` - Delete mood log

### Progress Tracking (4 endpoints)
- `GET /api/progress/weekly` - Weekly progress report
- `GET /api/progress/monthly` - Monthly progress report
- `GET /api/progress/overall` - Overall progress summary
- `GET /api/progress/dashboard` - Dashboard data

### Gamification (7 endpoints)
- `GET /api/gamification/profile` - User gamification profile
- `POST /api/gamification/points` - Add points
- `GET /api/gamification/achievements` - Get achievements
- `GET /api/gamification/levels` - Get level system
- `POST /api/gamification/check-achievements` - Check new achievements
- `PUT /api/gamification/avatar` - Update avatar

## Data Flow Characteristics

### Request Format
```json
{
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer <JWT_TOKEN>"
  },
  "body": {
    "data": "payload"
  }
}
```

### Response Format
```json
{
  "message": "Success message",
  "data": {
    "result": "response data"
  },
  "timestamp": "2025-03-20T10:30:00Z"
}
```

### Error Handling
```json
{
  "error": "Error message",
  "details": "Additional error details",
  "status": 400
}
```

## Technology Stack

**Frontend (React Native)**
- TypeScript
- Axios for HTTP requests
- AsyncStorage for local data
- React Navigation
- JWT token management

**Backend (Node.js)**
- Express.js framework
- JWT authentication
- SQLite/MySQL database
- RESTful API design
- Middleware for validation

**Communication**
- HTTP/HTTPS protocol
- JSON data format
- Bearer token authentication
- Real-time data synchronization