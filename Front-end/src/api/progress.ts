import apiClient from './client';

export interface WeeklyReport {
  period: {
    startDate: string;
    endDate: string;
  };
  soberDays: number;
  totalDrinks: number;
  currentStreak: number;
  tasksCompleted: number;
  pointsEarned: number;
  newAchievements: any[];
  averageMood: number | null;
  drinkLogs: any[];
  moodLogs: any[];
  achievements: any[];
}

export interface MonthlyReport {
  period: {
    startDate: string;
    endDate: string;
  };
  soberDays: number;
  totalDrinks: number;
  currentStreak: number;
  longestStreak?: number;
  totalDaysSober?: number;
  tasksCompleted: number;
  tasksByCategory?: { [key: string]: number };
  pointsEarned: number;
  totalPoints?: number;
  currentLevel?: number;
  newAchievements: any[];
  averageMood: number | null;
  triggerCounts?: { [key: string]: number };
  moodLogsCount?: number;
  triggerLogsCount?: number;
  drinkLogs: any[];
  moodLogs: any[];
  achievements: any[];
}

export interface OverallProgress {
  profile: any;
  statistics: {
    daysInApp: number;
    totalDrinks: number;
    soberDays: number;
    tasksCompleted: number;
    achievementsEarned: number;
    totalAchievements: number;
    achievementProgress: string;
  };
  recentAchievements: any[];
}

export interface Dashboard {
  profile: any;
  today: {
    drinkLog: any | null;
    moodLog: any | null;
    tasksCompleted: any[];
  };
  recentAchievements: any[];
  motivationalQuote: any | null;
}

// API 34: Get Weekly Progress
export const getWeeklyProgress = async (): Promise<{ weeklyReport: WeeklyReport }> => {
  const response = await apiClient.get<{ weeklyReport: WeeklyReport }>('/progress/weekly');
  return response.data;
};

// API 35: Get Monthly Progress
export const getMonthlyProgress = async (): Promise<{ monthlyReport: MonthlyReport }> => {
  const response = await apiClient.get<{ monthlyReport: MonthlyReport }>('/progress/monthly');
  return response.data;
};

// API 36: Get Overall Progress
export const getOverallProgress = async (): Promise<{ overallProgress: OverallProgress }> => {
  const response = await apiClient.get<{ overallProgress: OverallProgress }>('/progress/overall');
  return response.data;
};

// API 37: Get Dashboard
export const getDashboard = async (): Promise<{ dashboard: Dashboard }> => {
  const response = await apiClient.get<{ dashboard: Dashboard }>('/progress/dashboard');
  return response.data;
};

