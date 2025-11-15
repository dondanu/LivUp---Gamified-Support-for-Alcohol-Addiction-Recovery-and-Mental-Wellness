import apiClient, { tokenManager } from './client';

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  isAnonymous?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string | null;
  isAnonymous: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ProfileResponse {
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
}

// API 1: Register User
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  if (response.data.token) {
    await tokenManager.setToken(response.data.token);
  }
  return response.data;
};

// API 2: Login
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  if (response.data.token) {
    await tokenManager.setToken(response.data.token);
  }
  return response.data;
};

// API 9: Get User Profile
export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await apiClient.get<ProfileResponse>('/auth/profile');
  return response.data;
};

// Logout (clears token)
export const logout = async (): Promise<void> => {
  await tokenManager.removeToken();
};

