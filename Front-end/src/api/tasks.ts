import apiClient from './client';

export interface Task {
  id: number;
  task_name: string;
  description: string | null;
  category: string;
  points: number;
  created_at: string;
}

export interface DailyTasksResponse {
  tasks: Task[];
  count: number;
}

export interface CompleteTaskRequest {
  taskId: number;
  completionDate?: string;
}

export interface CompleteTaskResponse {
  message: string;
  completion: any;
  profile: any;
  pointsAwarded: number;
}

export interface CompletedTask {
  id: string;
  user_id: string;
  task_id: number;
  completion_date: string;
  created_at: string;
  task?: Task;
}

export interface CompletedTasksResponse {
  tasks: CompletedTask[];
}

export interface TodayTasksResponse {
  today: string;
  completedTasks: CompletedTask[];
  availableTasks: Task[];
  completedCount: number;
  totalPointsEarnedToday: number;
}

export interface TaskStatistics {
  totalTasksCompleted: number;
  categoryCounts: Record<string, number>;
}

// API 7: Get Daily Tasks (Public)
export const getDailyTasks = async (params?: {
  category?: string;
  limit?: number;
}): Promise<DailyTasksResponse> => {
  const response = await apiClient.get<DailyTasksResponse>('/tasks/daily', { params });
  return response.data;
};

// API 29: Complete Task
export const completeTask = async (data: CompleteTaskRequest): Promise<CompleteTaskResponse> => {
  const response = await apiClient.post<CompleteTaskResponse>('/tasks/complete', data);
  return response.data;
};

// API 30: Get Completed Tasks
export const getCompletedTasks = async (): Promise<CompletedTasksResponse> => {
  const response = await apiClient.get<CompletedTasksResponse>('/tasks/completed');
  return response.data;
};

// API 31: Get Today's Tasks
export const getTodayTasks = async (): Promise<TodayTasksResponse> => {
  const response = await apiClient.get<TodayTasksResponse>('/tasks/today');
  return response.data;
};

// API 32: Get Task Statistics
export const getTaskStatistics = async (): Promise<{ statistics: TaskStatistics }> => {
  const response = await apiClient.get<{ statistics: TaskStatistics }>('/tasks/statistics');
  return response.data;
};

// API 33: Delete Task Completion (Uncomplete)
export const deleteTaskCompletion = async (completionId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/tasks/${completionId}`);
  return response.data;
};

