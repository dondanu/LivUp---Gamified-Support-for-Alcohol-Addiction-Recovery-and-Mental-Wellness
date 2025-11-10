import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';

// Token storage key
const TOKEN_KEY = '@auth_token';

// API Client class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Get stored token
  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Store token
  private async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  // Remove token
  private async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Make API request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth methods
  async register(username: string, password: string, email?: string, isAnonymous: boolean = false) {
    const response = await this.request<{
      message: string;
      token: string;
      user: {
        id: string;
        username: string;
        email: string | null;
        isAnonymous: boolean;
      };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email, isAnonymous }),
    });

    if (response.token) {
      await this.setToken(response.token);
    }

    return response;
  }

  async login(username: string, password: string) {
    const response = await this.request<{
      message: string;
      token: string;
      user: {
        id: string;
        username: string;
        email: string | null;
        isAnonymous: boolean;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.token) {
      await this.setToken(response.token);
    }

    return response;
  }

  async getProfile() {
    return this.request<{
      user: {
        id: string;
        username: string;
        email: string | null;
        is_anonymous: boolean;
        created_at: string;
      };
      profile: {
        id: string;
        user_id: string;
        total_points: number;
        current_streak: number;
        longest_streak: number;
        level_id: number;
        avatar_type: string;
        days_sober: number;
        created_at: string;
        updated_at: string;
      };
    }>('/auth/profile');
  }

  async logout() {
    await this.removeToken();
  }

  // Drink tracking
  async logDrink(drinkCount: number, logDate?: string, notes?: string) {
    return this.request<{ message: string }>('/drinks/log', {
      method: 'POST',
      body: JSON.stringify({ drinkCount, logDate, notes }),
    });
  }

  async getDrinkLogs() {
    return this.request<{ logs: any[] }>('/drinks/logs');
  }

  async getDrinkStatistics() {
    return this.request<any>('/drinks/statistics');
  }

  async deleteDrinkLog(logId: string) {
    return this.request<{ message: string }>(`/drinks/${logId}`, {
      method: 'DELETE',
    });
  }

  // Mood tracking
  async logMood(mood: string, logDate?: string, notes?: string) {
    return this.request<{ message: string }>('/mood/log', {
      method: 'POST',
      body: JSON.stringify({ mood, logDate, notes }),
    });
  }

  async getMoodLogs() {
    return this.request<{ logs: any[] }>('/mood/logs');
  }

  async getMoodStatistics() {
    return this.request<any>('/mood/statistics');
  }

  async deleteMoodLog(logId: string) {
    return this.request<{ message: string }>(`/mood/${logId}`, {
      method: 'DELETE',
    });
  }

  // Trigger tracking
  async logTrigger(triggerType: string, description: string, logDate?: string) {
    return this.request<{ message: string }>('/triggers/log', {
      method: 'POST',
      body: JSON.stringify({ triggerType, description, logDate }),
    });
  }

  async getTriggerLogs() {
    return this.request<{ logs: any[] }>('/triggers/logs');
  }

  async getTriggerAnalysis() {
    return this.request<any>('/triggers/analysis');
  }

  async deleteTriggerLog(logId: string) {
    return this.request<{ message: string }>(`/triggers/${logId}`, {
      method: 'DELETE',
    });
  }

  // Gamification
  async getGamificationProfile() {
    return this.request<any>('/gamification/profile');
  }

  async addPoints(points: number, reason: string) {
    return this.request<{ message: string }>('/gamification/points', {
      method: 'POST',
      body: JSON.stringify({ points, reason }),
    });
  }

  async getAchievements() {
    return this.request<{ achievements: any[] }>('/gamification/achievements');
  }

  async getLevels() {
    return this.request<{ levels: any[] }>('/gamification/levels');
  }

  // Content
  async getQuote() {
    return this.request<{ quote: any }>('/content/quote');
  }

  async getAlternatives() {
    return this.request<{ alternatives: any[] }>('/content/alternatives');
  }

  async getRandomAlternative() {
    return this.request<{ alternative: any }>('/content/alternative/random');
  }

  // SOS/Contacts
  async getSOSContacts() {
    return this.request<{ contacts: any[]; count: number }>('/sos/contacts');
  }

  async addSOSContact(name: string, phone: string, relationship?: string) {
    return this.request<{ message: string; contact: any }>('/sos/contact', {
      method: 'POST',
      body: JSON.stringify({ contactName: name, contactPhone: phone, relationship }),
    });
  }

  async updateSOSContact(contactId: string, data: any) {
    return this.request<{ message: string; contact: any }>(`/sos/contact/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSOSContact(contactId: string) {
    return this.request<{ message: string }>(`/sos/contact/${contactId}`, {
      method: 'DELETE',
    });
  }

  // Challenges - Note: Backend may not have challenges endpoint, using tasks as alternative
  async getChallenges() {
    // Using daily tasks as challenges for now
    return this.request<{ tasks: any[] }>('/tasks/daily').then((response) => ({
      challenges: response.tasks || [],
    }));
  }

  async acceptChallenge(challengeId: string) {
    // Challenges might be handled through tasks
    return this.request<{ message: string }>('/tasks/complete', {
      method: 'POST',
      body: JSON.stringify({ taskId: challengeId }),
    });
  }

  async completeChallenge(userChallengeId: string) {
    // Challenges might be handled through tasks
    return this.request<{ message: string }>('/tasks/complete', {
      method: 'POST',
      body: JSON.stringify({ taskId: userChallengeId }),
    });
  }

  // Tasks
  async getDailyTasks() {
    return this.request<{ tasks: any[] }>('/tasks/daily');
  }

  async completeTask(taskId: string) {
    return this.request<{ message: string }>(`/tasks/${taskId}/complete`, {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const api = new ApiClient(BASE_URL);

