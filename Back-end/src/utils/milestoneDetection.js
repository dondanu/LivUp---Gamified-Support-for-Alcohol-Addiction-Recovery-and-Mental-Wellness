const { query, queryOne } = require('../config/database');

/**
 * Milestone Detection Utility
 * Detects when anonymous users reach significant milestones and determines
 * if a conversion prompt should be shown.
 */

/**
 * Detect if a milestone has been reached and if a conversion prompt should be shown
 * @param {string} userId - The user's ID
 * @param {string} eventType - Type of event: 'achievement_unlocked', 'challenge_completed',
 *                              'points_earned', 'usage_days'
 * @param {object} eventData - Data about the event (e.g., { isFirstAchievement: true, totalPoints: 150, daysUsed: 3 })
 * @returns {Promise<{shouldShowPrompt: boolean, milestoneType: string|null, milestoneData: object}>}
 */
async function detectMilestone(userId, eventType, eventData = {}) {
  try {
    // First, check if user is anonymous
    const { data: user, error: userError } = await queryOne('SELECT is_anonymous FROM users WHERE id = ?', [userId]);

    if (userError || !user) {
      return { shouldShowPrompt: false, milestoneType: null, milestoneData: {} };
    }

    // Only show prompts to anonymous users
    if (!user.is_anonymous) {
      return { shouldShowPrompt: false, milestoneType: null, milestoneData: {} };
    }

    let milestoneType = null;
    let milestoneData = {};

    // Determine milestone type based on event
    switch (eventType) {
      case 'achievement_unlocked':
        if (eventData.isFirstAchievement) {
          milestoneType = 'first_achievement';
          milestoneData = {
            achievementName: eventData.achievementName || 'Your First Achievement',
            pointsEarned: eventData.pointsEarned || 0,
          };
        }
        break;

      case 'challenge_completed':
        if (eventData.isFirstChallenge) {
          milestoneType = 'first_challenge';
          milestoneData = {
            challengeName: eventData.challengeName || 'Your First Challenge',
            pointsEarned: eventData.pointsEarned || 0,
          };
        }
        break;

      case 'points_earned':
        if (eventData.totalPoints >= 150) {
          milestoneType = 'points_150';
          milestoneData = {
            totalPoints: eventData.totalPoints,
          };
        }
        break;

      case 'usage_days':
        if (eventData.daysUsed === 3) {
          milestoneType = 'usage_3_days';
          milestoneData = {
            daysUsed: 3,
          };
        } else if (eventData.daysUsed === 7) {
          milestoneType = 'usage_7_days';
          milestoneData = {
            daysUsed: 7,
          };
        }
        break;

      default:
        return { shouldShowPrompt: false, milestoneType: null, milestoneData: {} };
    }

    // If no milestone was reached, return early
    if (!milestoneType) {
      return { shouldShowPrompt: false, milestoneType: null, milestoneData: {} };
    }

    // Check if this prompt has already been shown
    const { data: existingPrompt, error: promptError } = await queryOne(
      'SELECT id FROM conversion_prompts WHERE user_id = ? AND milestone_type = ?',
      [userId, milestoneType]
    );

    if (promptError) {
      console.error('Error checking conversion prompts:', promptError);
      return { shouldShowPrompt: false, milestoneType: null, milestoneData: {} };
    }

    // If prompt was already shown, don't show it again
    if (existingPrompt) {
      return { shouldShowPrompt: false, milestoneType: null, milestoneData: {} };
    }

    // Milestone reached and prompt not yet shown
    return {
      shouldShowPrompt: true,
      milestoneType,
      milestoneData,
    };
  } catch (error) {
    console.error('Error in detectMilestone:', error);
    return { shouldShowPrompt: false, milestoneType: null, milestoneData: {} };
  }
}

/**
 * Record that a conversion prompt was shown to a user
 * @param {string} userId - The user's ID
 * @param {string} milestoneType - The type of milestone
 * @param {boolean} dismissed - Whether the user dismissed the prompt
 * @returns {Promise<{success: boolean, error: any}>}
 */
async function recordPromptShown(userId, milestoneType, dismissed = false) {
  try {
    const { error } = await query(
      `INSERT INTO conversion_prompts (user_id, milestone_type, dismissed, shown_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE shown_at = NOW(), dismissed = ?`,
      [userId, milestoneType, dismissed, dismissed]
    );

    if (error) {
      console.error('Error recording prompt shown:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in recordPromptShown:', error);
    return { success: false, error };
  }
}

/**
 * Clear all conversion prompt tracking for a user (called after successful conversion)
 * @param {string} userId - The user's ID
 * @returns {Promise<{success: boolean, error: any}>}
 */
async function clearPromptTracking(userId) {
  try {
    const { error } = await query('DELETE FROM conversion_prompts WHERE user_id = ?', [userId]);

    if (error) {
      console.error('Error clearing prompt tracking:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in clearPromptTracking:', error);
    return { success: false, error };
  }
}

module.exports = {
  detectMilestone,
  recordPromptShown,
  clearPromptTracking,
};
