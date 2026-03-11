import apiClient from './client';

export interface SmartInsights {
  type: 'welcome' | 'excellent' | 'good' | 'moderate' | 'warning' | 'neutral';
  title: string;
  message: string;
  tips: string[];
  stats: {
    alcoholFreeDays: number;
    totalDrinks: number;
    commonMood: string | null;
    topTrigger: string | null;
  };
}

export interface InsightsResponse {
  insights: SmartInsights;
  generatedAt: string;
}

// Get smart insights based on user's tracking data
export const getSmartInsights = async (): Promise<InsightsResponse> => {
  const response = await apiClient.get<InsightsResponse>('/insights');
  return response.data;
};