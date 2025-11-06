// Backend API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development - use localhost
  : 'http://localhost:3000/api';   // Production - update with your server URL

// For Android emulator, use 10.0.2.2 instead of localhost
export const API_BASE_URL_ANDROID = 'http://10.0.2.2:3000/api';

// For physical device, use your computer's IP address
// Example: export const API_BASE_URL_DEVICE = 'http://192.168.1.100:3000/api';
