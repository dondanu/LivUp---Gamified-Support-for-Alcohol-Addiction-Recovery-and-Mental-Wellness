// Backend API Configuration
// Base URL for the backend API
// Uses environment variable API_BASE_URL from .env file
// For Android Emulator: use http://10.0.2.2:3000/api
// For iOS Simulator: use http://localhost:3000/api
// For Physical Device: use your computer's IP address, e.g., http://192.168.1.168:3000/api

import { Platform } from 'react-native';

let Config: { API_BASE_URL?: string } = {};
try {
  Config = require('react-native-config').default || {};
} catch (e) {
  // react-native-config not available, use default
}

// Get base URL from environment variable, or use platform-specific default
const getDefaultBaseURL = () => {
  if (Platform.OS === 'android') {
    // Check if running on emulator or physical device
    const isEmulator = Platform.constants?.Brand === 'google' || 
                       Platform.constants?.Manufacturer === 'Google' ||
                       Platform.constants?.Model?.includes('sdk') ||
                       Platform.constants?.Model?.includes('Emulator');
    
    if (isEmulator) {
      // Android Emulator uses 10.0.2.2 to access host machine's localhost
      return 'http://10.0.2.2:3000/api';
    } else {
      // Physical device - replace with your computer's IP address
      // Find your IP: Run 'ipconfig' in cmd and look for IPv4 Address
      return 'http://192.168.0.111:3000/api';  // e.g., 'http://192.168.1.105:3000/api'
    }
  } else if (Platform.OS === 'ios') {
    // iOS Simulator can use localhost
    return 'http://localhost:3000/api';
  } else {
    // Default fallback
    return 'http://192.168.0.111:3000/api';
  }
};

export const BASE_URL = Config.API_BASE_URL || getDefaultBaseURL();

// Log the base URL for debugging
console.log(`[API Config] Platform: ${Platform.OS}, Base URL: ${BASE_URL}`);

