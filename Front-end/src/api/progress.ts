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

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  drinkCount: number | null;
  mood: string | null;
  moodNotes: string | null;
  triggers: Array<{
    type: string;
    description: string | null;
  }>;
  notes: string | null;
  achievements: Array<{
    name: string;
    description: string;
    icon: string;
  }>;
  isSober: boolean | null;
}

export interface CalendarData {
  success: boolean;
  month: string;
  currentStreak: number;
  registrationMonth: string | null;
  registrationDate: string | null;
  calendar: CalendarDay[];
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

// API 38: Get Calendar Data
export const getCalendarData = async (month: string): Promise<CalendarData> => {
  const response = await apiClient.get<CalendarData>(`/progress/calendar?month=${month}`);
  return response.data;
};

// API 39: Get Weekly Comparison
export interface WeeklyComparison {
  success: boolean;
  currentWeek: {
    totalDrinks: number;
    soberDays: number;
    daysLogged: number;
    averageMood: number | null;
    mostCommonMood: string | null;
  };
  lastWeek: {
    totalDrinks: number;
    soberDays: number;
    daysLogged: number;
    averageMood: number | null;
    mostCommonMood: string | null;
  };
  comparison: {
    drinks: number; // percentage change
    soberDays: number; // percentage change
    mood: number | null; // percentage change
  };
}

export const getWeeklyComparison = async (): Promise<WeeklyComparison> => {
  const response = await apiClient.get<WeeklyComparison>('/progress/weekly-comparison');
  return response.data;
};

// API 40: Get Stats Summary
export interface StatsSummary {
  success: boolean;
  allTime: {
    soberDays: number;
    totalDrinks: number;
    drinksAvoided: number;
    moneySaved: number;
    daysInApp: number;
    totalPoints: number;
  };
  thisMonth: {
    soberDays: number;
    totalDrinks: number;
    averageDrinks: number;
    daysLogged: number;
    mostCommonMood: string | null;
  };
}

export const getStatsSummary = async (): Promise<StatsSummary> => {
  const response = await apiClient.get<StatsSummary>('/progress/stats-summary');
  return response.data;
};
