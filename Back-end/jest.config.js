module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/config/initDatabase.js', '!**/node_modules/**'],
  coverageThreshold: {
    global: {
      branches: 3,
      functions: 5,
      lines: 15,
      statements: 15,
    },
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  verbose: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
