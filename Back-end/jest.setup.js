// Jest setup file to prevent database connections during tests

// Mock the database module to prevent actual connections
jest.mock('./src/config/database', () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
  transaction: jest.fn(),
  pool: {
    getConnection: jest.fn(),
    end: jest.fn(),
  },
  initializeDatabaseWithGate: jest.fn().mockResolvedValue(true),
}));

// Mock the startup gate to always allow requests in tests
jest.mock('./src/middleware/startupGate', () => ({
  startupGate: (req, res, next) => next(),
  setDatabaseReady: jest.fn(),
}));

// Set NODE_ENV to test to prevent database initialization
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// Suppress console logs during tests unless explicitly needed
if (!process.env.VERBOSE_TESTS) {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}
