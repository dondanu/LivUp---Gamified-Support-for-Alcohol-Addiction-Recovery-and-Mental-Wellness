import client from './client';

export interface Milestone {
  id: number;
  user_id: number;
  title: string;
  milestone_date: string;
  type: 'sobriety' | 'custom';
  created_at: string;
  updated_at: string;
}

export interface AddMilestoneRequest {
  title: string;
  date: string;
  type?: 'sobriety' | 'custom';
}

export interface UpdateMilestoneRequest {
  title?: string;
  date?: string;
}

export interface MilestonesResponse {
  milestones: Milestone[];
}

export interface MilestoneResponse {
  message: string;
  milestone: Milestone;
}

/**
 * Get all milestones for the authenticated user
 */
export const getMilestones = async (): Promise<MilestonesResponse> => {
  const response = await client.get<MilestonesResponse>('/milestones');
  return response.data;
};

/**
 * Add a new milestone
 */
export const addMilestone = async (data: AddMilestoneRequest): Promise<MilestoneResponse> => {
  const response = await client.post<MilestoneResponse>('/milestones', data);
  return response.data;
};

/**
 * Update an existing milestone
 */
export const updateMilestone = async (
  id: number,
  data: UpdateMilestoneRequest
): Promise<MilestoneResponse> => {
  const response = await client.put<MilestoneResponse>(`/milestones/${id}`, data);
  return response.data;
};

/**
 * Delete a milestone
 */
export const deleteMilestone = async (id: number): Promise<{ message: string }> => {
  const response = await client.delete<{ message: string }>(`/milestones/${id}`);
  return response.data;
};
