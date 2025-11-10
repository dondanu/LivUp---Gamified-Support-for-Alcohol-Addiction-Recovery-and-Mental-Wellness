import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './config';

// Token storage key
const TOKEN_KEY = '@auth_token';

// API Client class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[API] API Client initialized');
    console.log(`[API] Base URL: ${baseUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
    
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // Remove trailing slash from baseUrl if present
    const normalizedBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const url = `${normalizedBaseUrl}${normalizedEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const method = options.method || 'GET';
      const requestBody = options.body ? JSON.parse(options.body) : null;
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`[API] ${method} ${endpoint}`);
      console.log(`[API] Full URL: ${url}`);
      if (requestBody) {
        console.log(`[API] Request Body:`, JSON.stringify(requestBody, null, 2));
      }
      if (token) {
        console.log(`[API] Token: ${token.substring(0, 20)}...`);
      } else {
        console.log(`[API] No token (public endpoint)`);
      }
      
      const startTime = Date.now();
      const response = await fetch(url, {
        ...options,
        headers,
      });
      const duration = Date.now() - startTime;

      console.log(`[API] Response Status: ${response.status} (${duration}ms)`);
      console.log(`[API] Response Headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorData: any = {};
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
            console.log(`[API] Error Response:`, JSON.stringify(errorData, null, 2));
          }
        } catch (e) {
          // If response is not JSON, use status text
          errorData = { error: response.statusText || `HTTP error! status: ${response.status}` };
          console.log(`[API] Error Response (non-JSON):`, errorData);
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      if (!responseText) {
        console.log(`[API] Response: (empty)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return {} as T;
      }
      
      const responseData = JSON.parse(responseText);
      console.log(`[API] Response Data:`, JSON.stringify(responseData, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      return responseData;
    } catch (error: any) {
      // Provide more detailed error information
      if (error.message && error.message.includes('Network request failed')) {
        console.error(`[API] Network Error [${endpoint}]:`, {
          url,
          message: 'Cannot connect to backend server. Please check:',
          checks: [
            '1. Is the backend server running?',
            '2. Is the IP address correct? (current: 192.168.8.159:3000)',
            '3. Are you on the same network?',
            '4. Check firewall settings',
          ],
        });
        throw new Error(`Cannot connect to backend server at ${normalizedBaseUrl}. Please ensure the server is running and accessible.`);
      }
      console.error(`[API] Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth methods
  async register(username: string, password: string, email?: string, isAnonymous: boolean = false) {
    console.log('[API] register() called with:', { username, email, isAnonymous });
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
      console.log('[API] Token received, storing...');
      await this.setToken(response.token);
      console.log('[API] Token stored successfully');
    }

    console.log('[API] register() completed successfully');
    return response;
  }

  async login(username: string, password: string) {
    console.log('[API] login() called with username:', username);
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
      console.log('[API] Token received, storing...');
      await this.setToken(response.token);
      console.log('[API] Token stored successfully');
    }

    console.log('[API] login() completed successfully');
    return response;
  }

  async getProfile() {
    console.log('[API] getProfile() called');
    const response = await this.request<{
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
    console.log('[API] getProfile() completed successfully');
    return response;
  }

  async logout() {
    console.log('[API] logout() called');
    await this.removeToken();
    console.log('[API] logout() completed - token removed');
  }

  // Drink tracking
  async logDrink(drinkCount: number, logDate?: string, notes?: string) {
    console.log('[API] logDrink() called:', { drinkCount, logDate, notes });
    return this.request<{ message: string }>('/drinks/log', {
      method: 'POST',
      body: JSON.stringify({ drinkCount, logDate, notes }),
    });
  }

  async getDrinkLogs() {
    console.log('[API] getDrinkLogs() called');
    return this.request<{ logs: any[] }>('/drinks/logs');
  }

  async getDrinkStatistics() {
    console.log('[API] getDrinkStatistics() called');
    return this.request<any>('/drinks/statistics');
  }

  async deleteDrinkLog(logId: string) {
    console.log('[API] deleteDrinkLog() called:', { logId });
    return this.request<{ message: string }>(`/drinks/${logId}`, {
      method: 'DELETE',
    });
  }

  // Mood tracking
  async logMood(mood: string, logDate?: string, notes?: string) {
    console.log('[API] logMood() called:', { mood, logDate, notes });
    return this.request<{ message: string }>('/mood/log', {
      method: 'POST',
      body: JSON.stringify({ mood, logDate, notes }),
    });
  }

  async getMoodLogs() {
    console.log('[API] getMoodLogs() called');
    return this.request<{ logs: any[] }>('/mood/logs');
  }

  async getMoodStatistics() {
    console.log('[API] getMoodStatistics() called');
    return this.request<any>('/mood/statistics');
  }

  async deleteMoodLog(logId: string) {
    console.log('[API] deleteMoodLog() called:', { logId });
    return this.request<{ message: string }>(`/mood/${logId}`, {
      method: 'DELETE',
    });
  }

  // Trigger tracking
  async logTrigger(triggerType: string, description: string, logDate?: string) {
    console.log('[API] logTrigger() called:', { triggerType, description, logDate });
    return this.request<{ message: string }>('/triggers/log', {
      method: 'POST',
      body: JSON.stringify({ triggerType, description, logDate }),
    });
  }

  async getTriggerLogs() {
    console.log('[API] getTriggerLogs() called');
    return this.request<{ logs: any[] }>('/triggers/logs');
  }

  async getTriggerAnalysis() {
    console.log('[API] getTriggerAnalysis() called');
    return this.request<any>('/triggers/analysis');
  }

  async deleteTriggerLog(logId: string) {
    console.log('[API] deleteTriggerLog() called:', { logId });
    return this.request<{ message: string }>(`/triggers/${logId}`, {
      method: 'DELETE',
    });
  }

  // Gamification
  async getGamificationProfile() {
    console.log('[API] getGamificationProfile() called');
    return this.request<any>('/gamification/profile');
  }

  async addPoints(points: number, reason: string) {
    console.log('[API] addPoints() called:', { points, reason });
    return this.request<{ message: string }>('/gamification/points', {
      method: 'POST',
      body: JSON.stringify({ points, reason }),
    });
  }

  async getAchievements() {
    console.log('[API] getAchievements() called');
    return this.request<{ achievements: any[] }>('/gamification/achievements');
  }

  async getLevels() {
    console.log('[API] getLevels() called');
    return this.request<{ levels: any[] }>('/gamification/levels');
  }

  // Content
  async getQuote() {
    console.log('[API] getQuote() called');
    return this.request<{ quote: any }>('/content/quote');
  }

  async getAlternatives() {
    console.log('[API] getAlternatives() called');
    return this.request<{ alternatives: any[] }>('/content/alternatives');
  }

  async getRandomAlternative() {
    console.log('[API] getRandomAlternative() called');
    return this.request<{ alternative: any }>('/content/alternative/random');
  }

  // SOS/Contacts
  async getSOSContacts() {
    console.log('[API] getSOSContacts() called');
    return this.request<{ contacts: any[]; count: number }>('/sos/contacts');
  }

  async addSOSContact(name: string, phone: string, relationship?: string) {
    console.log('[API] addSOSContact() called:', { name, phone, relationship });
    return this.request<{ message: string; contact: any }>('/sos/contact', {
      method: 'POST',
      body: JSON.stringify({ contactName: name, contactPhone: phone, relationship }),
    });
  }

  async updateSOSContact(contactId: string, data: any) {
    console.log('[API] updateSOSContact() called:', { contactId, data });
    return this.request<{ message: string; contact: any }>(`/sos/contact/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSOSContact(contactId: string) {
    console.log('[API] deleteSOSContact() called:', { contactId });
    return this.request<{ message: string }>(`/sos/contact/${contactId}`, {
      method: 'DELETE',
    });
  }

  // Challenges - Note: Backend may not have challenges endpoint, using tasks as alternative
  async getChallenges() {
    console.log('[API] getChallenges() called');
    // Using daily tasks as challenges for now
    return this.request<{ tasks: any[] }>('/tasks/daily').then((response) => ({
      challenges: response.tasks || [],
    }));
  }

  async acceptChallenge(challengeId: string) {
    console.log('[API] acceptChallenge() called:', { challengeId });
    // Challenges might be handled through tasks
    return this.request<{ message: string }>('/tasks/complete', {
      method: 'POST',
      body: JSON.stringify({ taskId: challengeId }),
    });
  }

  async completeChallenge(userChallengeId: string) {
    console.log('[API] completeChallenge() called:', { userChallengeId });
    // Challenges might be handled through tasks
    return this.request<{ message: string }>('/tasks/complete', {
      method: 'POST',
      body: JSON.stringify({ taskId: userChallengeId }),
    });
  }

  // Tasks
  async getDailyTasks() {
    console.log('[API] getDailyTasks() called');
    return this.request<{ tasks: any[] }>('/tasks/daily');
  }

  async completeTask(taskId: string) {
    console.log('[API] completeTask() called:', { taskId });
    return this.request<{ message: string }>(`/tasks/${taskId}/complete`, {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const api = new ApiClient(BASE_URL);

