import apiClient from './client';

export interface ProfileCustomization {
  id: number;
  user_id: number;
  bio: string | null;
  theme: string;
  avatarFrame: string; // Changed to camelCase to match backend response
  created_at: string;
  updated_at: string;
}

export interface ProfileCustomizationResponse {
  customization: ProfileCustomization;
}

export interface UpdateProfileCustomizationRequest {
  bio?: string;
  theme?: string;
  avatarFrame?: string; // Changed to camelCase to match backend
}

/**
 * Get user's profile customization
 */
export async function getProfileCustomization(): Promise<ProfileCustomizationResponse> {
  const response = await apiClient.get<ProfileCustomizationResponse>('/profile/customization');
  return response.data;
}

/**
 * Update user's profile customization
 */
export async function updateProfileCustomization(
  data: UpdateProfileCustomizationRequest
): Promise<ProfileCustomizationResponse> {
  const response = await apiClient.put<ProfileCustomizationResponse>('/profile/customization', data);
  return response.data;
}
