import apiClient from './client';

export interface UserSettings {
  id: string;
  user_id: string;
  notifications_enabled: boolean;
  reminder_frequency: 'daily' | 'weekly' | 'none';
  theme: 'light' | 'dark';
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingsRequest {
  notificationsEnabled?: boolean;
  reminderFrequency?: 'daily' | 'weekly' | 'none';
  theme?: 'light' | 'dark';
}

// API 27: Get Settings
export const getSettings = async (): Promise<UserSettings> => {
  const response = await apiClient.get<UserSettings>('/settings');
  return response.data;
};

// API 28: Update Settings
export const updateSettings = async (data: UpdateSettingsRequest): Promise<UserSettings> => {
  const response = await apiClient.put<UserSettings>('/settings', data);
  return response.data;
};

