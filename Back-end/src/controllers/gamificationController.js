const { query, queryOne, transaction } = require('../config/database');
const { determineLevel, checkAchievementEligibility } = require('../utils/helpers');

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { data: level } = await queryOne('SELECT * FROM levels WHERE id = ?', [profile.level_id]);
    const { data: nextLevel } = await queryOne('SELECT * FROM levels WHERE id > ? ORDER BY id ASC LIMIT 1', [profile.level_id]);

    const { data: userAchievements } = await query('SELECT ua.*, a.* FROM user_achievements ua JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id = ?', [userId]);

    res.status(200).json({
      profile,
      currentLevel: level,
      nextLevel: nextLevel || null,
      achievements: userAchievements || [],
      progressToNextLevel: nextLevel ? ((profile.total_points - level.points_required) / (nextLevel.points_required - level.points_required) * 100).toFixed(2) : 100
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const updateUserPoints = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { points, reason } = req.body;

    // Input validation
    if (!points || typeof points !== 'number') {
      return res.status(400).json({ error: 'Valid points amount required (must be a number)' });
    }
    
    if (points <= 0) {
      return res.status(400).json({ error: 'Points must be greater than 0' });
    }
    
    if (points > 10000) {
      return res.status(400).json({ error: 'Points cannot exceed 10000 per update' });
    }
    
    if (reason !== undefined && typeof reason !== 'string') {
      return res.status(400).json({ error: 'Reason must be a string' });
    }

    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);

    const newTotalPoints = profile.total_points + points;

    const { data: levels } = await query('SELECT * FROM levels ORDER BY points_required ASC', []);

    const newLevel = determineLevel(newTotalPoints, levels || []);

    await query('UPDATE user_profiles SET total_points = ?, level_id = ?, avatar_type = ?, updated_at = ? WHERE user_id = ?', [newTotalPoints, newLevel.id, newLevel.avatar_unlock, new Date().toISOString(), userId]);

    const { data: updatedProfile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);

    const leveledUp = newLevel.id > profile.level_id;

    res.status(200).json({ message: 'Points updated successfully', profile: updatedProfile, pointsAdded: points, reason: reason || 'Manual update', leveledUp, newLevel: leveledUp ? newLevel : null });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getLevels = async (req, res) => {
  try {
    const { data: levels } = await query('SELECT * FROM levels ORDER BY id ASC', []);

    res.status(200).json({ levels: levels || [] });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getAchievements = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: allAchievements } = await query('SELECT * FROM achievements ORDER BY points_reward ASC', []);
    const { data: userAchievements } = await query('SELECT achievement_id FROM user_achievements WHERE user_id = ?', [userId]);

    const earnedIds = new Set((userAchievements || []).map(ua => ua.achievement_id));

    const categorizedAchievements = (allAchievements || []).map(achievement => ({ ...achievement, earned: earnedIds.has(achievement.id) }));

    res.status(200).json({ achievements: categorizedAchievements, totalAchievements: (allAchievements || []).length, earnedCount: earnedIds.size });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const checkAndAwardAchievements = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    const { data: userAchievements } = await query('SELECT achievement_id FROM user_achievements WHERE user_id = ?', [userId]);
    const earnedIds = new Set((userAchievements || []).map(ua => ua.achievement_id));
    const { data: allAchievements } = await query('SELECT * FROM achievements', []);
    const { data: completedTasks } = await query('SELECT id FROM user_daily_tasks WHERE user_id = ?', [userId]);
    const { data: drinkLogs } = await query('SELECT drink_count FROM drink_logs WHERE user_id = ?', [userId]);

    const drinksAvoided = (drinkLogs || []).filter(log => log.drink_count === 0).length;

    const userStats = { days_sober: profile.days_sober, current_streak: profile.current_streak, tasks_completed: (completedTasks || []).length, drinks_avoided: drinksAvoided };

    const newAchievements = [];
    let totalPointsAwarded = 0;

    // Check which achievements are eligible
    for (const achievement of (allAchievements || [])) {
      if (!earnedIds.has(achievement.id) && checkAchievementEligibility(userStats, achievement)) {
        newAchievements.push(achievement);
        totalPointsAwarded += achievement.points_reward;
      }
    }

    // Use transaction to award all achievements and update points atomically
    if (newAchievements.length > 0) {
      const { error: txError } = await transaction(async (tx) => {
        // Insert all new achievements
        for (const achievement of newAchievements) {
          const { error } = await tx.query('INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)', [userId, achievement.id]);
          if (error) {
            throw new Error('Failed to award achievement: ' + error.message);
          }
        }

        // Update user points
        const { error: pointsError } = await tx.query('UPDATE user_profiles SET total_points = ?, updated_at = ? WHERE user_id = ?', [profile.total_points + totalPointsAwarded, new Date().toISOString(), userId]);
        if (pointsError) {
          throw new Error('Failed to update points: ' + pointsError.message);
        }
      });

      if (txError) {
        return res.status(500).json({ error: 'Failed to award achievements', details: txError.message });
      }
    }

    res.status(200).json({ message: newAchievements.length > 0 ? 'New achievements unlocked!' : 'No new achievements', newAchievements, pointsAwarded: totalPointsAwarded });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { avatarType } = req.body;

    // Input validation
    if (!avatarType || typeof avatarType !== 'string') {
      return res.status(400).json({ error: 'Avatar type is required and must be a string' });
    }
    
    if (avatarType.length > 50) {
      return res.status(400).json({ error: 'Avatar type must be 50 characters or less' });
    }

    await query('UPDATE user_profiles SET avatar_type = ?, updated_at = ? WHERE user_id = ?', [avatarType, new Date().toISOString(), userId]);
    const { data: updatedProfile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);

    res.status(200).json({ message: 'Avatar updated successfully', profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { getUserProfile, updateUserPoints, getLevels, getAchievements, checkAndAwardAchievements, updateAvatar };
