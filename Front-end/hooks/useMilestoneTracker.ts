import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface MilestoneInfo {
  shouldShowPrompt: boolean;
  milestoneType: 'first_achievement' | 'first_challenge' | 'points_150' | 'usage_3_days' | 'usage_7_days';
  milestoneData: {
    achievementName?: string;
    challengeName?: string;
    pointsEarned?: number;
    totalPoints?: number;
    daysUsed?: number;
  };
}

export const useMilestoneTracker = () => {
  const [promptInfo, setPromptInfo] = useState<MilestoneInfo | null>(null);
  const { user } = useAuth();

  /**
   * Check an API response for conversion prompt data
   * @param apiResponse - The response from an API call
   */
  const checkResponse = useCallback((apiResponse: any) => {
    // Only show prompts to anonymous users
    if (!user?.isAnonymous) {
      return;
    }

    // Check if response contains conversionPrompt field
    if (apiResponse?.conversionPrompt) {
      const { shouldShowPrompt, milestoneType, milestoneData } = apiResponse.conversionPrompt;

      if (shouldShowPrompt && milestoneType) {
        setPromptInfo({
          shouldShowPrompt,
          milestoneType,
          milestoneData: milestoneData || {},
        });
      }
    }
  }, [user?.isAnonymous]);

  /**
   * Dismiss the current prompt
   */
  const dismissPrompt = useCallback(() => {
    setPromptInfo(null);
  }, []);

  return {
    promptInfo,
    checkResponse,
    dismissPrompt,
  };
};
