import client from './client';

export interface UserSettings {
  id: number;
  user_id: number;
  notifications_enabled: boolean;
  daily_reminder_time: string | null;
  reminder_frequency: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateNotificationsRequest {
  notificationsEnabled: boolean;
}

export interface UpdateThemeRequest {
  theme: 'light' | 'dark';
}

export interface ChangeEmailRequest {
  newEmail: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface SettingsResponse {
  settings: UserSettings;
}

export interface MessageResponse {
  message: string;
}

export interface ExportDataResponse {
  message: string;
  data: {
    user: any;
    profile: any;
    settings: any;
    drinkLogs: any[];
    moodLogs: any[];
    journalEntries: any[];
    milestones: any[];
    exportedAt: string;
  };
}

/**
 * Get user settings
 */
export const getSettings = async (): Promise<SettingsResponse> => {
  const response = await client.get<SettingsResponse>('/settings');
  return response.data;
};

/**
 * Update notifications
 */
export const updateNotifications = async (data: UpdateNotificationsRequest): Promise<SettingsResponse> => {
  const response = await client.put<SettingsResponse>('/settings/notifications', data);
  return response.data;
};

/**
 * Update theme
 */
export const updateTheme = async (data: UpdateThemeRequest): Promise<SettingsResponse> => {
  const response = await client.put<SettingsResponse>('/settings/theme', data);
  return response.data;
};

/**
 * Change email
 */
export const changeEmail = async (data: ChangeEmailRequest): Promise<MessageResponse> => {
  const response = await client.put<MessageResponse>('/settings/email', data);
  return response.data;
};

/**
 * Change password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<MessageResponse> => {
  const response = await client.put<MessageResponse>('/settings/password', data);
  return response.data;
};

/**
 * Export user data
 */
export const exportData = async (): Promise<ExportDataResponse> => {
  const response = await client.get<ExportDataResponse>('/settings/export');
  return response.data;
};

/**
 * Delete account
 */
export const deleteAccount = async (data: DeleteAccountRequest): Promise<MessageResponse> => {
  const response = await client.delete<MessageResponse>('/settings/account', { data });
  return response.data;
};
