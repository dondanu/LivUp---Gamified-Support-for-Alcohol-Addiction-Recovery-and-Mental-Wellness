import apiClient from './client';

export interface HealthResponse {
  status: string;
  timestamp: string;
}

// API 8: Health Check (Public)
export const healthCheck = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};

