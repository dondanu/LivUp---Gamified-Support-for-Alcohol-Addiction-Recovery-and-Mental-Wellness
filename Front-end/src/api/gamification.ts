import apiClient from './client';

export interface Level {
  id: number;
  level_name: string;
  min_points: number;
  max_points: number | null;
  description: string | null;
}

export interface Achievement {
  id: number;
  achievement_name: string;
  description: string;
  points_required: number;
  icon: string | null;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: number;
  earned_at: string;
  achievement?: Achievement;
}

export interface GamificationProfile {
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
  currentLevel: Level;
  nextLevel: Level | null;
  achievements: UserAchievement[];
  progressToNextLevel: string;
}

export interface AddPointsRequest {
  points: number;
  reason?: string;
}

export interface AddPointsResponse {
  message: string;
  profile: any;
  pointsAdded: number;
  reason: string;
  leveledUp: boolean;
  newLevel: Level | null;
}

export interface CheckAchievementsResponse {
  message: string;
  newAchievements: Achievement[];
  pointsAwarded: number;
}

export interface UpdateAvatarRequest {
  avatarType: string;
}

export interface UpdateAvatarResponse {
  message: string;
  profile: any;
}

// API 22: Get Gamification Profile
export const getGamificationProfile = async (): Promise<GamificationProfile> => {
  const response = await apiClient.get<GamificationProfile>('/gamification/profile');
  return response.data;
};

// API 23: Add Points
export const addPoints = async (data: AddPointsRequest): Promise<AddPointsResponse> => {
  const response = await apiClient.post<AddPointsResponse>('/gamification/points', data);
  return response.data;
};

// API 6: Get Levels (Public)
export const getLevels = async (): Promise<{ levels: Level[] }> => {
  const response = await apiClient.get<{ levels: Level[] }>('/gamification/levels');
  return response.data;
};

// API 24: Get Achievements
export const getAchievements = async (): Promise<{
  achievements: Achievement[];
  totalAchievements: number;
  earnedCount: number;
}> => {
  const response = await apiClient.get<{
    achievements: Achievement[];
    totalAchievements: number;
    earnedCount: number;
  }>('/gamification/achievements');
  return response.data;
};

// API 25: Check Achievements
export const checkAchievements = async (): Promise<CheckAchievementsResponse> => {
  const response = await apiClient.post<CheckAchievementsResponse>('/gamification/check-achievements');
  return response.data;
};

// API 26: Update Avatar
export const updateAvatar = async (data: UpdateAvatarRequest): Promise<UpdateAvatarResponse> => {
  const response = await apiClient.put<UpdateAvatarResponse>('/gamification/avatar', data);
  return response.data;
};

