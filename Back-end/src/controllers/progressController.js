const { query, queryOne } = require('../config/database');
const { getDateRange } = require('../utils/helpers');

const getWeeklyProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = getDateRange('week');

    // Get user registration date to ensure tracking starts from registration
    const { data: user } = await queryOne('SELECT created_at FROM users WHERE id = ?', [userId]);
    const registrationDate = user?.created_at ? new Date(user.created_at).toISOString().split('T')[0] : startDate;
    const actualStartDate = registrationDate > startDate ? registrationDate : startDate;

    const { data: drinkLogs } = await query('SELECT * FROM drink_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ? ORDER BY log_date ASC', [userId, actualStartDate, endDate]);
    const { data: completedTasks } = await query('SELECT udt.*, dt.points_reward FROM user_daily_tasks udt JOIN daily_tasks dt ON udt.task_id = dt.id WHERE udt.user_id = ? AND udt.completion_date >= ? AND udt.completion_date <= ?', [userId, actualStartDate, endDate]);
    const { data: moodLogs } = await query('SELECT * FROM mood_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ? ORDER BY log_date ASC', [userId, actualStartDate, endDate]);
    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    const { data: achievementsThisWeek } = await query('SELECT ua.*, a.* FROM user_achievements ua JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id = ? AND DATE(ua.earned_at) >= ? AND DATE(ua.earned_at) <= ?', [userId, actualStartDate, endDate]);

    const drinkLogsArray = drinkLogs || [];
    const completedTasksArray = completedTasks || [];
    const moodLogsArray = moodLogs || [];

    const soberDays = drinkLogsArray.filter(log => log.drink_count === 0).length;
    const totalDrinks = drinkLogsArray.reduce((sum, log) => sum + log.drink_count, 0);
    const tasksCompleted = completedTasksArray.length;
    const pointsEarned = completedTasksArray.reduce((sum, task) => sum + (task.points_reward || 0), 0);

    const averageMood = moodLogsArray.length > 0 ? moodLogsArray.reduce((sum, log) => sum + log.mood_score, 0) / moodLogsArray.length : 0;

    res.status(200).json({
      weeklyReport: { period: { startDate: actualStartDate, endDate }, soberDays, totalDrinks, currentStreak: profile.current_streak, tasksCompleted, pointsEarned, newAchievements: (achievementsThisWeek || []).length, averageMood: parseFloat(averageMood.toFixed(2)), drinkLogs: drinkLogsArray, moodLogs: moodLogsArray, achievements: achievementsThisWeek || [] }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getMonthlyProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = getDateRange('month');

    // Get user registration date to ensure tracking starts from registration
    const { data: user } = await queryOne('SELECT created_at FROM users WHERE id = ?', [userId]);
    const registrationDate = user?.created_at ? new Date(user.created_at).toISOString().split('T')[0] : startDate;
    const actualStartDate = registrationDate > startDate ? registrationDate : startDate;

    const { data: drinkLogs } = await query('SELECT * FROM drink_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ? ORDER BY log_date ASC', [userId, actualStartDate, endDate]);
    const { data: completedTasks } = await query('SELECT udt.*, dt.points_reward, dt.category FROM user_daily_tasks udt JOIN daily_tasks dt ON udt.task_id = dt.id WHERE udt.user_id = ? AND udt.completion_date >= ? AND udt.completion_date <= ?', [userId, actualStartDate, endDate]);
    const { data: moodLogs } = await query('SELECT * FROM mood_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ?', [userId, actualStartDate, endDate]);
    const { data: triggerLogs } = await query('SELECT * FROM trigger_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ?', [userId, actualStartDate, endDate]);
    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);

    const drinkLogsArray = drinkLogs || [];
    const completedTasksArray = completedTasks || [];
    const moodLogsArray = moodLogs || [];
    const triggerLogsArray = triggerLogs || [];

    const soberDays = drinkLogsArray.filter(log => log.drink_count === 0).length;
    const totalDrinks = drinkLogsArray.reduce((sum, log) => sum + log.drink_count, 0);

    const tasksCompleted = completedTasksArray.length;
    const pointsEarned = completedTasksArray.reduce((sum, task) => sum + (task.points_reward || 0), 0);

    const tasksByCategory = completedTasksArray.reduce((acc, task) => {
      const category = task.category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const averageMood = moodLogsArray.length > 0 ? moodLogsArray.reduce((sum, log) => sum + log.mood_score, 0) / moodLogsArray.length : 0;

    const triggerCounts = triggerLogsArray.reduce((acc, log) => {
      acc[log.trigger_type] = (acc[log.trigger_type] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      monthlyReport: {
        period: { startDate: actualStartDate, endDate },
        soberDays,
        totalDrinks,
        currentStreak: profile.current_streak,
        longestStreak: profile.longest_streak,
        totalDaysSober: profile.days_sober,
        tasksCompleted,
        tasksByCategory,
        pointsEarned,
        totalPoints: profile.total_points,
        currentLevel: profile.level_id,
        averageMood: parseFloat(averageMood.toFixed(2)),
        triggerCounts,
        moodLogsCount: moodLogsArray.length,
        triggerLogsCount: triggerLogsArray.length,
        drinkLogs: drinkLogsArray, // expose logs so frontend can build chart
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getOverallProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    const { data: user } = await queryOne('SELECT created_at FROM users WHERE id = ?', [userId]);
    const { data: allDrinkLogs } = await query('SELECT * FROM drink_logs WHERE user_id = ?', [userId]);
    const { data: allCompletedTasks } = await query('SELECT * FROM user_daily_tasks WHERE user_id = ?', [userId]);
    const { data: earnedAchievements } = await query('SELECT ua.*, a.* FROM user_achievements ua JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id = ?', [userId]);
    const { data: allAchievements } = await query('SELECT * FROM achievements', []);
    const { data: currentLevel } = await queryOne('SELECT * FROM levels WHERE id = ?', [profile.level_id]);

    const drinkLogsArray = allDrinkLogs || [];
    const totalDrinks = drinkLogsArray.reduce((sum, log) => sum + log.drink_count, 0);
    const soberDays = drinkLogsArray.filter(log => log.drink_count === 0).length;

    const daysInApp = user ? Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) : 0;

    res.status(200).json({
        overallProgress: {
        profile: { totalPoints: profile.total_points, currentStreak: profile.current_streak, longestStreak: profile.longest_streak, daysSober: profile.days_sober, level: currentLevel, avatar: profile.avatar_type },
        statistics: { daysInApp, totalDrinks, soberDays, tasksCompleted: (allCompletedTasks || []).length, achievementsEarned: (earnedAchievements || []).length, totalAchievements: (allAchievements || []).length, achievementProgress: ((earnedAchievements || []).length / (allAchievements || []).length * 100).toFixed(2) },
        recentAchievements: (earnedAchievements || []).slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    const { data: currentLevel } = await queryOne('SELECT * FROM levels WHERE id = ?', [profile.level_id]);
    const { data: todayDrinkLog } = await queryOne('SELECT * FROM drink_logs WHERE user_id = ? AND log_date = ?', [userId, today]);
    const { data: todayMoodLog } = await queryOne('SELECT * FROM mood_logs WHERE user_id = ? AND log_date = ?', [userId, today]);
    const { data: todayTasks } = await query('SELECT udt.*, dt.* FROM user_daily_tasks udt JOIN daily_tasks dt ON udt.task_id = dt.id WHERE udt.user_id = ? AND udt.completion_date = ?', [userId, today]);
    const { data: recentAchievements } = await query('SELECT ua.*, a.* FROM user_achievements ua JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id = ? ORDER BY ua.earned_at DESC LIMIT 3', [userId]);
    const { data: quotes } = await query('SELECT * FROM motivational_quotes WHERE is_active = 1', []);

    const quotesArray = quotes || [];
    const randomQuote = quotesArray[Math.floor(Math.random() * quotesArray.length)];

    res.status(200).json({
      dashboard: {
        profile: { totalPoints: profile.total_points, currentStreak: profile.current_streak, daysSober: profile.days_sober, level: currentLevel, avatar: profile.avatar_type },
        today: { drinkLog: todayDrinkLog || null, moodLog: todayMoodLog || null, tasksCompleted: (todayTasks || []).length },
        recentAchievements: recentAchievements || [],
        motivationalQuote: randomQuote || null
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { getWeeklyProgress, getMonthlyProgress, getOverallProgress, getDashboardData };
