import apiClient from './client';

export interface LogDrinkRequest {
  drinkCount: number;
  logDate?: string;
  notes?: string;
}

export interface DrinkLog {
  id: string;
  user_id: string;
  drink_count: number;
  log_date: string;
  notes: string | null;
  created_at: string;
}

export interface DrinkLogsResponse {
  logs: DrinkLog[];
  count: number;
}

export interface DrinkStatistics {
  totalDrinks: number;
  totalSoberDays: number;
  currentStreak: number;
  weeklyDrinks: number;
  totalLogs: number;
}

export interface LogDrinkResponse {
  message: string;
  drinkLog: DrinkLog;
  stats: {
    currentStreak: number;
    totalSoberDays: number;
    pointsEarned: number;
    totalPoints: number;
  };
}

// API 10: Log Drink
export const logDrink = async (data: LogDrinkRequest): Promise<LogDrinkResponse> => {
  const response = await apiClient.post<LogDrinkResponse>('/drinks/log', data);
  return response.data;
};

// API 11: Get Drink Logs
export const getDrinkLogs = async (params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<DrinkLogsResponse> => {
  const response = await apiClient.get<DrinkLogsResponse>('/drinks/logs', { params });
  return response.data;
};

// API 12: Get Drink Statistics
export const getDrinkStatistics = async (): Promise<{ statistics: DrinkStatistics }> => {
  const response = await apiClient.get<{ statistics: DrinkStatistics }>('/drinks/statistics');
  return response.data;
};

// API 13: Delete Drink Log
export const deleteDrinkLog = async (logId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/drinks/${logId}`);
  return response.data;
};

