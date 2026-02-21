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
