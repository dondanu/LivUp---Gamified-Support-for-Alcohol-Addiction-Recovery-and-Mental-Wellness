import AsyncStorage from '@react-native-async-storage/async-storage';

const ANONYMOUS_DATA_KEY = '@anonymous_user_data';
const ANONYMOUS_MODE_KEY = '@is_anonymous_mode';

export interface AnonymousUserData {
  // Tracking data
  drinkLogs: Array<{
    drinkCount: number;
    logDate: string;
    notes?: string;
  }>;
  moodLogs: Array<{
    moodType: string;
    moodScore: number;
    logDate: string;
    notes?: string;
  }>;
  completedTasks: Array<{
    taskId: number;
    taskName: string;
    pointsEarned: number;
    completionDate: string;
  }>;
  
  // Stats
  totalPoints: number;
  currentStreak: number;
  soberDays: number;
  
  // Milestones reached
  milestonesReached: Array<{
    type: 'first_task' | 'first_achievement' | 'points_150' | 'usage_3_days' | 'usage_7_days';
    reachedAt: string;
  }>;
  
  // First usage date
  firstUsedAt: string;
}

class AnonymousStorageManager {
  
  async isAnonymousMode(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ANONYMOUS_MODE_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking anonymous mode:', error);
      return false;
    }
  }
  
  async enableAnonymousMode(): Promise<void> {
    try {
      await AsyncStorage.setItem(ANONYMOUS_MODE_KEY, 'true');
      
      // Initialize empty data
      const initialData: AnonymousUserData = {
        drinkLogs: [],
        moodLogs: [],
        completedTasks: [],
        totalPoints: 0,
        currentStreak: 0,
        soberDays: 0,
        milestonesReached: [],
        firstUsedAt: new Date().toISOString(),
      };
      
      await this.saveData(initialData);
    } catch (error) {
      console.error('Error enabling anonymous mode:', error);
      throw error;
    }
  }
  
  async disableAnonymousMode(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ANONYMOUS_MODE_KEY);
      await AsyncStorage.removeItem(ANONYMOUS_DATA_KEY);
    } catch (error) {
      console.error('Error disabling anonymous mode:', error);
    }
  }
  
  async getData(): Promise<AnonymousUserData | null> {
    try {
      const data = await AsyncStorage.getItem(ANONYMOUS_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting anonymous data:', error);
      return null;
    }
  }
  
  async saveData(data: AnonymousUserData): Promise<void> {
    try {
      await AsyncStorage.setItem(ANONYMOUS_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving anonymous data:', error);
      throw error;
    }
  }
  
  async addCompletedTask(taskId: number, taskName: string, pointsEarned: number): Promise<void> {
    try {
      const data = await this.getData();
      if (!data) return;
      
      data.completedTasks.push({
        taskId,
        taskName,
        pointsEarned,
        completionDate: new Date().toISOString(),
      });
      
      data.totalPoints += pointsEarned;
      
      const taskCount = data.completedTasks.length;
      
      // Add milestone after EVERY task
      data.milestonesReached.push({
        type: 'first_task',
        reachedAt: new Date().toISOString(),
      });
      
      // Check for points milestone
      if (data.totalPoints >= 150 && !data.milestonesReached.find(m => m.type === 'points_150')) {
        data.milestonesReached.push({
          type: 'points_150',
          reachedAt: new Date().toISOString(),
        });
      }
      
      await this.saveData(data);
    } catch (error) {
      console.error('Error adding completed task:', error);
      throw error;
    }
  }
  
  async addDrinkLog(drinkCount: number, logDate: string, notes?: string): Promise<void> {
    try {
      const data = await this.getData();
      if (!data) return;
      
      data.drinkLogs.push({
        drinkCount,
        logDate,
        notes,
      });
      
      // Calculate sober days
      const soberLogs = data.drinkLogs.filter(log => log.drinkCount === 0);
      data.soberDays = soberLogs.length;
      
      await this.saveData(data);
    } catch (error) {
      console.error('Error adding drink log:', error);
      throw error;
    }
  }
  
  async addMoodLog(moodType: string, moodScore: number, logDate: string, notes?: string): Promise<void> {
    try {
      const data = await this.getData();
      if (!data) return;
      
      data.moodLogs.push({
        moodType,
        moodScore,
        logDate,
        notes,
      });
      
      await this.saveData(data);
    } catch (error) {
      console.error('Error adding mood log:', error);
      throw error;
    }
  }
  
  async checkMilestones(): Promise<{
    shouldPrompt: boolean;
    milestoneType?: string;
    milestoneData?: any;
  }> {
    try {
      const data = await this.getData();
      if (!data) {
        console.log('[Milestone Check] No data found');
        return { shouldPrompt: false };
      }
      
      console.log('[Milestone Check] Total milestones reached:', data.milestonesReached.length);
      console.log('[Milestone Check] Milestones:', data.milestonesReached);
      
      const latestMilestone = data.milestonesReached[data.milestonesReached.length - 1];
      
      if (latestMilestone) {
        // Check if this milestone was reached in the last 5 seconds (just happened)
        const timeSinceReached = Date.now() - new Date(latestMilestone.reachedAt).getTime();
        
        console.log('[Milestone Check] Latest milestone:', latestMilestone.type);
        console.log('[Milestone Check] Time since reached:', timeSinceReached, 'ms');
        
        if (timeSinceReached < 5000) {
          console.log('[Milestone Check] Should prompt: YES');
          return {
            shouldPrompt: true,
            milestoneType: latestMilestone.type,
            milestoneData: {
              totalPoints: data.totalPoints,
              completedTasks: data.completedTasks.length,
            },
          };
        } else {
          console.log('[Milestone Check] Milestone too old, not prompting');
        }
      } else {
        console.log('[Milestone Check] No milestones found');
      }
      
      return { shouldPrompt: false };
    } catch (error) {
      console.error('Error checking milestones:', error);
      return { shouldPrompt: false };
    }
  }
}

export const anonymousStorage = new AnonymousStorageManager();
