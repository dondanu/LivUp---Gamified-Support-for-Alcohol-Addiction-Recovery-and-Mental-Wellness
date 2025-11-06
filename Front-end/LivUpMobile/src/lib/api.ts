import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL_ANDROID } from '../config/env';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android' ? API_BASE_URL_ANDROID : 'http://localhost:3000/api';

const TOKEN_KEY = '@auth_token';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }

  private async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  private async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async register(username: string, password: string, email?: string, isAnonymous = false) {
    const data = await this.request<{ message: string; token: string; user: any }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ username, password, email, isAnonymous }),
      }
    );
    if (data.token) {
      await this.setToken(data.token);
    }
    return data;
  }

  async login(username: string, password: string) {
    const data = await this.request<{ message: string; token: string; user: any }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );
    if (data.token) {
      await this.setToken(data.token);
    }
    return data;
  }

  async getProfile() {
    return this.request<{ user: any; profile: any }>('/auth/profile');
  }

  async logout() {
    await this.removeToken();
  }

  // Content methods
  async getMotivationalQuote() {
    return this.request<{ quote: { id: number; quote: string; author: string } }>('/content/quote');
  }

  // Gamification methods
  async getGamificationProfile() {
    return this.request<{
      profile: any;
      currentLevel: any;
      nextLevel: any;
      achievements: any[];
      progressToNextLevel: string;
    }>('/gamification/profile');
  }

  async getAchievements() {
    return this.request<{ achievements: any[]; totalAchievements: number; earnedCount: number }>(
      '/gamification/achievements'
    );
  }

  // Drinks methods
  async getDrinkStatistics() {
    return this.request<{
      statistics: {
        totalDrinks: number;
        totalSoberDays: number;
        currentStreak: number;
        weeklyDrinks: number;
        totalLogs: number;
      };
    }>('/drinks/statistics');
  }

  // Progress methods
  async getDashboard() {
    return this.request<{
      dashboard: {
        profile: any;
        today: { drinkLog: any; moodLog: any; tasksCompleted: any[] };
        recentAchievements: any[];
        motivationalQuote: any;
      };
    }>('/progress/dashboard');
  }
}

export const apiClient = new ApiClient();

