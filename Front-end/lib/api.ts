// Compatibility layer - Re-exports from new API structure
// This file maintains backward compatibility while transitioning to the new API structure
// All imports should eventually be updated to use '@/src/api' directly

export * from '@/src/api';

// Re-export as default api object for backward compatibility
import * as apiExports from '@/src/api';

// Create a compatibility object that matches the old API structure
export const api = {
  // Auth
  register: (username: string, password: string, email?: string, isAnonymous?: boolean) =>
    apiExports.register({ username, password, email, isAnonymous }),
  login: (username: string, password: string) =>
    apiExports.login({ username, password }),
  getProfile: apiExports.getProfile,
  logout: apiExports.logout,

  // Drinks
  logDrink: (drinkCount: number, logDate?: string, notes?: string) =>
    apiExports.logDrink({ drinkCount, logDate, notes }),
  getDrinkLogs: apiExports.getDrinkLogs,
  getDrinkStatistics: apiExports.getDrinkStatistics,
  deleteDrinkLog: apiExports.deleteDrinkLog,

  // Mood
  logMood: (mood: string, logDate?: string, notes?: string) => {
    // Map mood string to moodType and moodScore
    const moodType = mood as 'happy' | 'sad' | 'stressed' | 'anxious' | 'calm' | 'angry';
    return apiExports.logMood({ moodType, moodScore: 5, logDate, notes });
  },
  getMoodLogs: apiExports.getMoodLogs,
  getMoodStatistics: apiExports.getMoodStatistics,
  deleteMoodLog: apiExports.deleteMoodLog,

  // Triggers
  logTrigger: (triggerType: string, description: string, logDate?: string) =>
    apiExports.logTrigger({ 
      triggerType: triggerType as any, 
      intensity: 5, 
      logDate, 
      notes: description 
    }),
  getTriggerLogs: apiExports.getTriggerLogs,
  getTriggerAnalysis: apiExports.getTriggerAnalysis,
  deleteTriggerLog: apiExports.deleteTriggerLog,

  // Gamification
  getGamificationProfile: apiExports.getGamificationProfile,
  addPoints: (points: number, reason?: string) =>
    apiExports.addPoints({ points, reason }),
  getAchievements: apiExports.getAchievements,
  getLevels: apiExports.getLevels,
  checkAchievements: apiExports.checkAchievements,
  updateAvatar: (avatarType: string) =>
    apiExports.updateAvatar({ avatarType }),

  // Content
  getQuote: apiExports.getQuote,
  getAlternatives: apiExports.getAlternatives,
  getRandomAlternative: apiExports.getRandomAlternative,

  // SOS
  getSOSContacts: apiExports.getSOSContacts,
  addSOSContact: (name: string, phone: string, relationship?: string) =>
    apiExports.addSOSContact({ contactName: name, contactPhone: phone, relationship }),
  updateSOSContact: apiExports.updateSOSContact,
  deleteSOSContact: apiExports.deleteSOSContact,

  // Tasks
  getDailyTasks: apiExports.getDailyTasks,
  completeTask: (taskId: string) =>
    apiExports.completeTask({ taskId: parseInt(taskId) }),
  getCompletedTasks: apiExports.getCompletedTasks,
  getTodayTasks: apiExports.getTodayTasks,
  getTaskStatistics: apiExports.getTaskStatistics,
  deleteTaskCompletion: apiExports.deleteTaskCompletion,

  // Challenges (using tasks)
  getChallenges: async () => {
    const response = await apiExports.getDailyTasks();
    // Backend now returns both tasks and challenges, prefer challenges if available
    return { challenges: response.challenges || response.tasks || [] };
  },
  acceptChallenge: (challengeId: string) =>
    apiExports.completeTask({ taskId: parseInt(challengeId) }),
  completeChallenge: (userChallengeId: string) =>
    apiExports.completeTask({ taskId: parseInt(userChallengeId) }),
};
