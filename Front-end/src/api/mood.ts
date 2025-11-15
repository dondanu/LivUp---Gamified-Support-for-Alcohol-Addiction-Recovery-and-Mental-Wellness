import apiClient from './client';

export interface LogMoodRequest {
  moodType: 'happy' | 'sad' | 'stressed' | 'anxious' | 'calm' | 'angry';
  moodScore: number; // 1-10
  logDate?: string;
  notes?: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  mood_type: string;
  mood_score: number;
  log_date: string;
  notes: string | null;
  created_at: string;
}

export interface MoodLogsResponse {
  logs: MoodLog[];
  count: number;
}

export interface MoodStatistics {
  averageMoodScore: number;
  mostCommonMood: string | null;
  moodDistribution: Record<string, number>;
  totalLogs: number;
}

export interface LogMoodResponse {
  message: string;
  moodLog: MoodLog;
}

// API 14: Log Mood
export const logMood = async (data: LogMoodRequest): Promise<LogMoodResponse> => {
  const response = await apiClient.post<LogMoodResponse>('/mood/log', data);
  return response.data;
};

// API 15: Get Mood Logs
export const getMoodLogs = async (params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<MoodLogsResponse> => {
  const response = await apiClient.get<MoodLogsResponse>('/mood/logs', { params });
  return response.data;
};

// API 16: Get Mood Statistics
export const getMoodStatistics = async (): Promise<{ statistics: MoodStatistics }> => {
  const response = await apiClient.get<{ statistics: MoodStatistics }>('/mood/statistics');
  return response.data;
};

// API 17: Delete Mood Log
export const deleteMoodLog = async (logId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/mood/${logId}`);
  return response.data;
};

