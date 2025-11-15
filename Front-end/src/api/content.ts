import apiClient from './client';

export interface Quote {
  id: number;
  quote_text: string;
  author: string | null;
  category: string | null;
}

export interface Alternative {
  id: number;
  activity_name: string;
  description: string;
  category: string | null;
}

// API 3: Get Motivational Quote (Public)
export const getQuote = async (): Promise<{ quote: Quote }> => {
  const response = await apiClient.get<{ quote: Quote }>('/content/quote');
  return response.data;
};

// API 4: Get Alternatives (Public)
export const getAlternatives = async (): Promise<{ alternatives: Alternative[] }> => {
  const response = await apiClient.get<{ alternatives: Alternative[] }>('/content/alternatives');
  return response.data;
};

// API 5: Get Random Alternative (Public)
export const getRandomAlternative = async (): Promise<{ alternative: Alternative }> => {
  const response = await apiClient.get<{ alternative: Alternative }>('/content/alternative/random');
  return response.data;
};

