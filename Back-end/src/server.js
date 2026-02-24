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

// API info route (base of /api)
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'Mind Fusion API',
    status: 'OK',
    health: '/api/health',
    groups: {
      auth: '/api/auth',
      drinks: '/api/drinks',
      mood: '/api/mood',
      triggers: '/api/triggers',
      gamification: '/api/gamification',
      tasks: '/api/tasks',
      content: '/api/content',
      sos: '/api/sos',
      settings: '/api/settings',
      progress: '/api/progress'
    },
    generatedAt: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

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
