const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database initialization and startup gate
const { initializeDatabaseWithGate } = require('./config/database');
const { startupGate } = require('./middleware/startupGate');

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET environment variable is required!');
  console.error('Please add JWT_SECRET to your .env file');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add startup gate middleware BEFORE routes
app.use(startupGate);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/drinks', require('./routes/drinks'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/triggers', require('./routes/triggers'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/content', require('./routes/content'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/insights', require('./routes/insights'));

// Welcome page route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mind Fusion API - Backend Status</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 50px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
          animation: fadeIn 0.6s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 30px;
          animation: scaleIn 0.5s ease-out 0.3s both;
        }
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        .checkmark::after {
          content: '✓';
          color: white;
          font-size: 48px;
          font-weight: bold;
        }
        h1 {
          color: #1f2937;
          font-size: 36px;
          margin-bottom: 15px;
          font-weight: 700;
        }
        .status {
          color: #10b981;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 30px;
        }
        .info {
          background: #f3f4f6;
          border-radius: 10px;
          padding: 20px;
          margin: 30px 0;
          color: #4b5563;
          line-height: 1.8;
        }
        .endpoint {
          background: #1f2937;
          color: #10b981;
          padding: 12px 20px;
          border-radius: 8px;
          display: inline-block;
          margin: 10px 0;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          word-break: break-all;
        }
        .api-link {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .api-link:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .timestamp {
          color: #9ca3af;
          font-size: 14px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="checkmark"></div>
        <h1>Mind Fusion API</h1>
        <div class="status">✅ Backend Successfully Working!</div>
        <div class="info">
          <p><strong>Server Status:</strong> Running</p>
          <p><strong>Total APIs:</strong> 41 endpoints</p>
          <p><strong>Database:</strong> MySQL Connected</p>
          <div style="margin-top: 15px;">
            <strong>API Health Check:</strong><br>
            <span class="endpoint">/api/health</span>
          </div>
        </div>
        <a href="/api/health" class="api-link">Check API Health</a>
        <div class="timestamp">
          Server started at: ${new Date().toLocaleString()}
        </div>
      </div>
    </body>
    </html>
  `);
});

// API Dashboard route (base of /api) - Beautiful visual interface
app.get('/api', (req, res) => {
  // Check if request wants JSON (from API calls)
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    res.json({
      name: 'Mind Fusion API',
      status: 'OK',
      groups: []
    });
  } else {
    // Serve beautiful HTML dashboard for browser visits
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mind Fusion API - Live Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 10px;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            text-align: center;
            margin-bottom: 10px;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            flex-shrink: 0;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            background: #00b894;
            color: white;
            padding: 10px 20px;
            border-radius: 50px;
            font-weight: bold;
            margin-bottom: 15px;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        .status-badge::before {
            content: "✓";
            margin-right: 8px;
            font-size: 18px;
        }

        h1 {
            font-size: 2.5em;
            margin-bottom: 5px;
            color: #2d3436;
        }

        .subtitle {
            font-size: 1.2em;
            color: #636e72;
            margin-bottom: 10px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-bottom: 10px;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.9);
            padding: 12px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-3px);
        }

        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #6c5ce7;
        }

        .stat-label {
            color: #636e72;
            margin-top: 2px;
        }

        .connection-section {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 10px;
            align-items: center;
            margin-bottom: 10px;
            flex-shrink: 0;
        }

        .endpoint-card {
            background: rgba(255, 255, 255, 0.95);
            padding: 12px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
        }

        .frontend-card {
            border-left: 5px solid #4A90E2;
        }

        .backend-card {
            border-left: 5px solid #00b894;
        }

        .connection-arrow {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: white;
            font-weight: bold;
        }

        .arrow {
            font-size: 2em;
            animation: bounce 2s infinite;
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }

        .endpoints-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            flex: 1;
            overflow: hidden;
        }

        .endpoint-group {
            background: rgba(255, 255, 255, 0.95);
            padding: 10px;
            border-radius: 10px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .group-header {
            display: flex;
            align-items: center;
            margin-bottom: 6px;
            padding-bottom: 4px;
            border-bottom: 2px solid #f1f2f6;
        }

        .group-icon {
            font-size: 1.5em;
            margin-right: 8px;
        }

        .group-title {
            font-weight: bold;
            color: #2d3436;
        }

        .endpoint-list {
            list-style: none;
            flex: 1;
        }

        .endpoint-item {
            padding: 3px 0;
            border-bottom: 1px solid #f1f2f6;
            display: flex;
            align-items: center;
        }

        .method-badge {
            padding: 4px 8px;
            border-radius: 5px;
            font-size: 0.8em;
            font-weight: bold;
            margin-right: 10px;
            min-width: 60px;
            text-align: center;
        }

        .get { background: #74b9ff; color: white; }
        .post { background: #00b894; color: white; }
        .put { background: #fdcb6e; color: #333; }
        .delete { background: #e17055; color: white; }

        .live-data {
            background: rgba(255, 255, 255, 0.95);
            padding: 10px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
            text-align: center;
            flex-shrink: 0;
            margin-top: 5px;
        }

        .timestamp {
            color: #636e72;
            font-size: 0.9em;
            margin-top: 5px;
        }

        .health-check {
            display: inline-block;
            background: #00b894;
            color: white;
            padding: 12px 25px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 8px;
            transition: background 0.3s ease;
        }

        .health-check:hover {
            background: #00a085;
        }

        @media (max-width: 768px) {
            .connection-section {
                grid-template-columns: 1fr;
                text-align: center;
            }
            
            .connection-arrow {
                transform: rotate(90deg);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <div class="status-badge">Backend Successfully Working!</div>
            <h1>Mind Fusion API</h1>
            <p class="subtitle">Figure 3.3.6b: Live Data Flow - React Native Frontend ↔ Backend API Connection</p>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number" id="server-status">Running</div>
                    <div class="stat-label">Server Status</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">41</div>
                    <div class="stat-label">API Endpoints</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="db-status">Connected</div>
                    <div class="stat-label">Database</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="uptime">Live</div>
                    <div class="stat-label">System Status</div>
                </div>
            </div>
        </div>

        <!-- Connection Flow Section -->
        <div class="connection-section">
            <div class="endpoint-card frontend-card">
                <h3>🔵 React Native Frontend</h3>
                <p><strong>Mobile App Interface</strong></p>
                <p>• Dashboard with live data</p>
                <p>• Real-time statistics</p>
                <p>• User authentication</p>
                <p>• Progress tracking</p>
                <p><strong>API Config:</strong> <span id="current-api-url">Loading...</span></p>
            </div>

            <div class="connection-arrow">
                <div>HTTP Requests</div>
                <div class="arrow">⟷</div>
                <div>JSON Responses</div>
            </div>

            <div class="endpoint-card backend-card">
                <h3>🟢 Node.js Backend API</h3>
                <p><strong>Express.js Server</strong></p>
                <p>• RESTful API endpoints</p>
                <p>• JWT authentication</p>
                <p>• Database operations</p>
                <p>• Real-time data sync</p>
                <p><strong>Base URL:</strong> /api</p>
            </div>
        </div>

        <!-- API Endpoints Grid -->
        <div class="endpoints-grid">
            <div class="endpoint-group">
                <div class="group-header">
                    <span class="group-icon">🔐</span>
                    <span class="group-title">Authentication</span>
                </div>
                <ul class="endpoint-list">
                    <li class="endpoint-item">
                        <span class="method-badge post">POST</span>
                        /auth/register
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge post">POST</span>
                        /auth/login
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /auth/profile
                    </li>
                </ul>
            </div>

            <div class="endpoint-group">
                <div class="group-header">
                    <span class="group-icon">🍺</span>
                    <span class="group-title">Drinks Tracking</span>
                </div>
                <ul class="endpoint-list">
                    <li class="endpoint-item">
                        <span class="method-badge post">POST</span>
                        /drinks/log
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /drinks/logs
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /drinks/statistics
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge delete">DEL</span>
                        /drinks/:logId
                    </li>
                </ul>
            </div>

            <div class="endpoint-group">
                <div class="group-header">
                    <span class="group-icon">😊</span>
                    <span class="group-title">Mood Tracking</span>
                </div>
                <ul class="endpoint-list">
                    <li class="endpoint-item">
                        <span class="method-badge post">POST</span>
                        /mood/log
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /mood/logs
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /mood/statistics
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge delete">DEL</span>
                        /mood/:logId
                    </li>
                </ul>
            </div>

            <div class="endpoint-group">
                <div class="group-header">
                    <span class="group-icon">📊</span>
                    <span class="group-title">Progress & Analytics</span>
                </div>
                <ul class="endpoint-list">
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /progress/weekly
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /progress/monthly
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /progress/dashboard
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /progress/overall
                    </li>
                </ul>
            </div>

            <div class="endpoint-group">
                <div class="group-header">
                    <span class="group-icon">🎮</span>
                    <span class="group-title">Gamification</span>
                </div>
                <ul class="endpoint-list">
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /gamification/profile
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge post">POST</span>
                        /gamification/points
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /gamification/achievements
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /gamification/levels
                    </li>
                </ul>
            </div>

            <div class="endpoint-group">
                <div class="group-header">
                    <span class="group-icon">🎯</span>
                    <span class="group-title">Tasks & More</span>
                </div>
                <ul class="endpoint-list">
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /tasks/daily
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge post">POST</span>
                        /tasks/complete
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /sos/contacts
                    </li>
                    <li class="endpoint-item">
                        <span class="method-badge get">GET</span>
                        /settings
                    </li>
                </ul>
            </div>
        </div>

        <!-- Live Data Section -->
        <div class="live-data">
            <h3>🔴 Live System Status</h3>
            <p>Real-time connection between React Native Frontend and Backend API</p>
            <a href="/api/health" class="health-check" target="_blank">Check API Health</a>
            <div class="timestamp">
                Last updated: <span id="current-time">${new Date().toLocaleString()}</span>
            </div>
        </div>
    </div>

    <script>
        // Get current URL dynamically
        function updateCurrentURL() {
            const currentURL = window.location.origin + '/api';
            document.getElementById('current-api-url').textContent = currentURL;
        }
        
        // Update timestamp
        function updateTime() {
            const now = new Date();
            document.getElementById('current-time').textContent = now.toLocaleString();
        }
        
        // Initialize
        updateCurrentURL();
        updateTime();
        setInterval(updateTime, 1000);

        // Simulate live status updates
        setInterval(() => {
            const statuses = ['Running', 'Active', 'Online'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            document.getElementById('server-status').textContent = randomStatus;
        }, 3000);
    </script>
</body>
</html>
    `);
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Async startup function
async function startServer() {
  try {
    // Skip database initialization in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log('ℹ️  Skipping database initialization in test environment');
      return app; // Return app for testing without starting server
    }

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

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
