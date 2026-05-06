// Central export file for all API modules
// This provides a clean interface to all backend APIs

// Auth APIs
export * from './auth';

// Drink Tracking APIs
export * from './drinks';

// Mood Tracking APIs
export * from './mood';

// Trigger Tracking APIs
export * from './triggers';

// Gamification APIs
export * from './gamification';

// Tasks APIs
export * from './tasks';

// Progress APIs
export * from './progress';

// Content APIs
export * from './content';

// SOS APIs
export * from './sos';

// Settings APIs
export * from './settings';

// Health API
export * from './health';

// Insights API
export * from './insights';

// Profile Customization API
export * from './profileCustomization';

// Milestones API
export * from './milestones';

// Journal API
export * from './journal';

// NOTE: tokenManager is NOT exported here to avoid circular dependencies
// Import it directly from './client' where needed

