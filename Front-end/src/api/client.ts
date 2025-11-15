import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@/lib/config';

const TOKEN_KEY = '@auth_token';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Debug logging
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('[API Request Data]', JSON.stringify(config.data, null, 2));
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      // Server responded with error
      console.error(`[API Error] ${error.response.status} ${error.config?.url}`);
      console.error('[API Error Data]', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // Request made but no response
      console.error('[API Error] No response received', error.request);
    } else {
      // Error setting up request
      console.error('[API Error]', error.message);
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid - clear token
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

// Token management helpers
export const tokenManager = {
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },
  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },
};

export default apiClient;

