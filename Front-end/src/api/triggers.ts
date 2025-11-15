import apiClient from './client';

export interface LogTriggerRequest {
  triggerType: 'stress' | 'party' | 'social' | 'boredom' | 'anxiety' | 'other';
  intensity: number; // 1-10
  logDate?: string;
  notes?: string;
}

export interface TriggerLog {
  id: string;
  user_id: string;
  trigger_type: string;
  intensity: number;
  log_date: string;
  notes: string | null;
  created_at: string;
}

export interface TriggerLogsResponse {
  logs: TriggerLog[];
  count: number;
}

export interface TriggerAnalysis {
  mostCommonTrigger: string | null;
  averageIntensity: number;
  triggerDistribution: Record<string, number>;
  triggerAverageIntensities: Record<string, number>;
  totalTriggers: number;
}

export interface LogTriggerResponse {
  message: string;
  triggerLog: TriggerLog;
}

// API 18: Log Trigger
export const logTrigger = async (data: LogTriggerRequest): Promise<LogTriggerResponse> => {
  const response = await apiClient.post<LogTriggerResponse>('/triggers/log', data);
  return response.data;
};

// API 19: Get Trigger Logs
export const getTriggerLogs = async (params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<TriggerLogsResponse> => {
  const response = await apiClient.get<TriggerLogsResponse>('/triggers/logs', { params });
  return response.data;
};

// API 20: Get Trigger Analysis
export const getTriggerAnalysis = async (): Promise<{ analysis: TriggerAnalysis }> => {
  const response = await apiClient.get<{ analysis: TriggerAnalysis }>('/triggers/analysis');
  return response.data;
};

// API 21: Delete Trigger Log
export const deleteTriggerLog = async (logId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/triggers/${logId}`);
  return response.data;
};

