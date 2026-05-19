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

    const { data: drinkLogs } = await query(
      'SELECT * FROM drink_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ? ORDER BY log_date ASC',
      [userId, actualStartDate, endDate]
    );
    const { data: completedTasks } = await query(
      'SELECT udt.*, dt.points_reward FROM user_daily_tasks udt JOIN daily_tasks dt ON udt.task_id = dt.id WHERE udt.user_id = ? AND udt.completion_date >= ? AND udt.completion_date <= ?',
      [userId, actualStartDate, endDate]
    );
    const { data: moodLogs } = await query(
      'SELECT * FROM mood_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ? ORDER BY log_date ASC',
      [userId, actualStartDate, endDate]
    );
    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    const { data: achievementsThisWeek } = await query(
      'SELECT ua.*, a.* FROM user_achievements ua JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id = ? AND DATE(ua.earned_at) >= ? AND DATE(ua.earned_at) <= ?',
      [userId, actualStartDate, endDate]
    );

    const drinkLogsArray = drinkLogs || [];
    const completedTasksArray = completedTasks || [];
    const moodLogsArray = moodLogs || [];

    const soberDays = drinkLogsArray.filter((log) => log.drink_count === 0).length;
    const totalDrinks = drinkLogsArray.reduce((sum, log) => sum + log.drink_count, 0);
    const tasksCompleted = completedTasksArray.length;
    const pointsEarned = completedTasksArray.reduce((sum, task) => sum + (task.points_reward || 0), 0);

    const averageMood =
      moodLogsArray.length > 0 ? moodLogsArray.reduce((sum, log) => sum + log.mood_score, 0) / moodLogsArray.length : 0;

    res.status(200).json({
      weeklyReport: {
        period: { startDate: actualStartDate, endDate },
        soberDays,
        totalDrinks,
        currentStreak: profile.current_streak,
        tasksCompleted,
        pointsEarned,
        newAchievements: (achievementsThisWeek || []).length,
        averageMood: parseFloat(averageMood.toFixed(2)),
        drinkLogs: drinkLogsArray,
        moodLogs: moodLogsArray,
        achievements: achievementsThisWeek || [],
      },
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

    const { data: drinkLogs } = await query(
      'SELECT * FROM drink_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ? ORDER BY log_date ASC',
      [userId, actualStartDate, endDate]
    );
    const { data: completedTasks } = await query(
      'SELECT udt.*, dt.points_reward, dt.category FROM user_daily_tasks udt JOIN daily_tasks dt ON udt.task_id = dt.id WHERE udt.user_id = ? AND udt.completion_date >= ? AND udt.completion_date <= ?',
      [userId, actualStartDate, endDate]
    );
    const { data: moodLogs } = await query(
      'SELECT * FROM mood_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ?',
      [userId, actualStartDate, endDate]
    );
    const { data: triggerLogs } = await query(
      'SELECT * FROM trigger_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ?',
      [userId, actualStartDate, endDate]
    );
    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);

    const drinkLogsArray = drinkLogs || [];
    const completedTasksArray = completedTasks || [];
    const moodLogsArray = moodLogs || [];
    const triggerLogsArray = triggerLogs || [];

    const soberDays = drinkLogsArray.filter((log) => log.drink_count === 0).length;
    const totalDrinks = drinkLogsArray.reduce((sum, log) => sum + log.drink_count, 0);

    const tasksCompleted = completedTasksArray.length;
    const pointsEarned = completedTasksArray.reduce((sum, task) => sum + (task.points_reward || 0), 0);

    const tasksByCategory = completedTasksArray.reduce((acc, task) => {
      const category = task.category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const averageMood =
      moodLogsArray.length > 0 ? moodLogsArray.reduce((sum, log) => sum + log.mood_score, 0) / moodLogsArray.length : 0;

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
      },
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
    const { data: earnedAchievements } = await query(
      'SELECT ua.*, a.* FROM user_achievements ua JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id = ?',
      [userId]
    );
    const { data: allAchievements } = await query('SELECT * FROM achievements', []);
    const { data: currentLevel } = await queryOne('SELECT * FROM levels WHERE id = ?', [profile.level_id]);

    const drinkLogsArray = allDrinkLogs || [];
    const totalDrinks = drinkLogsArray.reduce((sum, log) => sum + log.drink_count, 0);
    const soberDays = drinkLogsArray.filter((log) => log.drink_count === 0).length;

    const daysInApp = user ? Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) : 0;

    res.status(200).json({
      overallProgress: {
        profile: {
          totalPoints: profile.total_points,
          currentStreak: profile.current_streak,
          longestStreak: profile.longest_streak,
          daysSober: profile.days_sober,
          level: currentLevel,
          avatar: profile.avatar_type,
        },
        statistics: {
          daysInApp,
          totalDrinks,
          soberDays,
          tasksCompleted: (allCompletedTasks || []).length,
          achievementsEarned: (earnedAchievements || []).length,
          totalAchievements: (allAchievements || []).length,
          achievementProgress: (((earnedAchievements || []).length / (allAchievements || []).length) * 100).toFixed(2),
        },
        recentAchievements: (earnedAchievements || []).slice(0, 5),
      },
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
    const { data: todayDrinkLog } = await queryOne('SELECT * FROM drink_logs WHERE user_id = ? AND log_date = ?', [
      userId,
      today,
    ]);
    const { data: todayMoodLog } = await queryOne('SELECT * FROM mood_logs WHERE user_id = ? AND log_date = ?', [
      userId,
      today,
    ]);
    const { data: todayTasks } = await query(
      'SELECT udt.*, dt.* FROM user_daily_tasks udt JOIN daily_tasks dt ON udt.task_id = dt.id WHERE udt.user_id = ? AND udt.completion_date = ?',
      [userId, today]
    );
    const { data: recentAchievements } = await query(
      'SELECT ua.*, a.* FROM user_achievements ua JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id = ? ORDER BY ua.earned_at DESC LIMIT 3',
      [userId]
    );
    const { data: quotes } = await query('SELECT * FROM motivational_quotes WHERE is_active = 1', []);

    const quotesArray = quotes || [];
    const randomQuote = quotesArray[Math.floor(Math.random() * quotesArray.length)];

    res.status(200).json({
      dashboard: {
        profile: {
          totalPoints: profile.total_points,
          currentStreak: profile.current_streak,
          daysSober: profile.days_sober,
          level: currentLevel,
          avatar: profile.avatar_type,
        },
        today: {
          drinkLog: todayDrinkLog || null,
          moodLog: todayMoodLog || null,
          tasksCompleted: (todayTasks || []).length,
        },
        recentAchievements: recentAchievements || [],
        motivationalQuote: randomQuote || null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Calendar data endpoint - returns all logs for a specific month
const getCalendarData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month } = req.query; // Format: YYYY-MM

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }

    // Calculate start and end dates for the month
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
    const endDate = `${year}-${monthNum}-${lastDay}`;

    // Fetch all logs for the month
    const { data: drinkLogs } = await query(
      'SELECT * FROM drink_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ? ORDER BY log_date ASC',
      [userId, startDate, endDate]
    );

    const { data: moodLogs } = await query(
      'SELECT * FROM mood_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ? ORDER BY log_date ASC',
      [userId, startDate, endDate]
    );

    const { data: triggerLogs } = await query(
      'SELECT * FROM trigger_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ? ORDER BY log_date ASC',
      [userId, startDate, endDate]
    );

    // Get achievements earned in this month
    const { data: achievements } = await query(
      `SELECT ua.earned_at, a.name, a.description, a.icon 
       FROM user_achievements ua 
       JOIN achievements a ON ua.achievement_id = a.id 
       WHERE ua.user_id = ? AND DATE(ua.earned_at) >= ? AND DATE(ua.earned_at) <= ?
       ORDER BY ua.earned_at ASC`,
      [userId, startDate, endDate]
    );

    // Get user profile for streak calculation and registration date
    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    const { data: user } = await queryOne('SELECT created_at FROM users WHERE id = ?', [userId]);
    
    // Get user registration date
    const registrationDate = user?.created_at ? new Date(user.created_at) : null;
    let registrationMonth = null;
    if (registrationDate) {
      const year = registrationDate.getFullYear();
      const monthNum = registrationDate.getMonth() + 1;
      registrationMonth = `${year}-${String(monthNum).padStart(2, '0')}`;
    }

    // Helper function to normalize date to YYYY-MM-DD format
    const normalizeDate = (dateValue) => {
      if (!dateValue) return null;
      
      // If it's already a string in YYYY-MM-DD format, return it
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
      }
      
      // Convert to Date object and extract YYYY-MM-DD
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return null;
      
      // Get local date components
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    };

    // Organize data by date
    const calendarData = {};

    // Process drink logs
    (drinkLogs || []).forEach((log) => {
      const dateKey = normalizeDate(log.log_date);
      if (!dateKey) return;
      
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = {
          date: dateKey,
          drinkCount: 0,
          mood: null,
          moodNotes: null,
          triggers: [],
          notes: null,
          achievements: [],
          isSober: true,
        };
      }
      calendarData[dateKey].drinkCount = log.drink_count || 0;
      calendarData[dateKey].notes = log.notes || null;
      calendarData[dateKey].isSober = log.drink_count === 0;
    });

    // Process mood logs
    (moodLogs || []).forEach((log) => {
      const dateKey = normalizeDate(log.log_date);
      if (!dateKey) return;
      
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = {
          date: dateKey,
          drinkCount: null,
          mood: null,
          moodNotes: null,
          triggers: [],
          notes: null,
          achievements: [],
          isSober: null,
        };
      }
      calendarData[dateKey].mood = log.mood_type || log.mood;
      calendarData[dateKey].moodNotes = log.notes || null;
    });

    // Process trigger logs
    (triggerLogs || []).forEach((log) => {
      const dateKey = normalizeDate(log.log_date);
      if (!dateKey) return;
      
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = {
          date: dateKey,
          drinkCount: null,
          mood: null,
          moodNotes: null,
          triggers: [],
          notes: null,
          achievements: [],
          isSober: null,
        };
      }
      calendarData[dateKey].triggers.push({
        type: log.trigger_type,
        description: log.description || log.notes || null,
      });
    });

    // Process achievements
    (achievements || []).forEach((achievement) => {
      const dateKey = normalizeDate(achievement.earned_at);
      if (!dateKey) return;
      
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = {
          date: dateKey,
          drinkCount: null,
          mood: null,
          moodNotes: null,
          triggers: [],
          notes: null,
          achievements: [],
          isSober: null,
        };
      }
      calendarData[dateKey].achievements.push({
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
      });
    });

    // Convert to array and sort by date
    const calendarArray = Object.values(calendarData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    res.status(200).json({
      success: true,
      month,
      currentStreak: profile?.current_streak || 0,
      registrationMonth,
      registrationDate: registrationDate ? registrationDate.toISOString().split('T')[0] : null,
      calendar: calendarArray,
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// NEW: Weekly comparison endpoint
const getWeeklyComparison = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Current week
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    currentWeekStart.setHours(0, 0, 0, 0);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);
    
    // Previous week
    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(currentWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(currentWeekStart);
    lastWeekEnd.setDate(currentWeekStart.getDate() - 1);
    lastWeekEnd.setHours(23, 59, 59, 999);
    
    // Format dates
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    // Fetch current week data
    const { data: currentDrinkLogs } = await query(
      'SELECT * FROM drink_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ?',
      [userId, formatDate(currentWeekStart), formatDate(currentWeekEnd)]
    );
    
    const { data: currentMoodLogs } = await query(
      'SELECT * FROM mood_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ?',
      [userId, formatDate(currentWeekStart), formatDate(currentWeekEnd)]
    );
    
    // Fetch previous week data
    const { data: lastDrinkLogs } = await query(
      'SELECT * FROM drink_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ?',
      [userId, formatDate(lastWeekStart), formatDate(lastWeekEnd)]
    );
    
    const { data: lastMoodLogs } = await query(
      'SELECT * FROM mood_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ?',
      [userId, formatDate(lastWeekStart), formatDate(lastWeekEnd)]
    );
    
    // Calculate current week stats
    const currentWeek = {
      totalDrinks: (currentDrinkLogs || []).reduce((sum, log) => sum + (log.drink_count || 0), 0),
      soberDays: (currentDrinkLogs || []).filter(log => log.drink_count === 0).length,
      daysLogged: (currentDrinkLogs || []).length,
      averageMood: (currentMoodLogs || []).length > 0 
        ? (currentMoodLogs || []).reduce((sum, log) => sum + (log.mood_score || 5), 0) / (currentMoodLogs || []).length 
        : null,
      mostCommonMood: getMostCommonMood(currentMoodLogs || []),
    };
    
    // Calculate previous week stats
    const lastWeek = {
      totalDrinks: (lastDrinkLogs || []).reduce((sum, log) => sum + (log.drink_count || 0), 0),
      soberDays: (lastDrinkLogs || []).filter(log => log.drink_count === 0).length,
      daysLogged: (lastDrinkLogs || []).length,
      averageMood: (lastMoodLogs || []).length > 0 
        ? (lastMoodLogs || []).reduce((sum, log) => sum + (log.mood_score || 5), 0) / (lastMoodLogs || []).length 
        : null,
      mostCommonMood: getMostCommonMood(lastMoodLogs || []),
    };
    
    // Calculate comparison
    const comparison = {
      drinks: calculatePercentageChange(lastWeek.totalDrinks, currentWeek.totalDrinks),
      soberDays: calculatePercentageChange(lastWeek.soberDays, currentWeek.soberDays),
      mood: currentWeek.averageMood && lastWeek.averageMood 
        ? calculatePercentageChange(lastWeek.averageMood, currentWeek.averageMood) 
        : null,
    };
    
    res.status(200).json({
      success: true,
      currentWeek,
      lastWeek,
      comparison,
    });
  } catch (error) {
    console.error('Error fetching weekly comparison:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Helper: Get most common mood
const getMostCommonMood = (moodLogs) => {
  if (!moodLogs || moodLogs.length === 0) return null;
  
  const moodCounts = {};
  moodLogs.forEach(log => {
    const mood = log.mood_type || log.mood;
    if (mood) {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    }
  });
  
  let maxCount = 0;
  let mostCommon = null;
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = mood;
    }
  });
  
  return mostCommon;
};

// Helper: Calculate percentage change
const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0 && newValue === 0) return 0;
  if (oldValue === 0) return 100;
  return Math.round(((newValue - oldValue) / oldValue) * 100);
};

// NEW: Stats summary endpoint
const getStatsSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user profile and registration date
    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    const { data: user } = await queryOne('SELECT created_at FROM users WHERE id = ?', [userId]);
    
    // Calculate days in app
    const daysInApp = user?.created_at 
      ? Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) + 1
      : 0;
    
    // Get all drink logs
    const { data: allDrinkLogs } = await query(
      'SELECT * FROM drink_logs WHERE user_id = ?',
      [userId]
    );
    
    // Calculate all-time stats
    const totalDrinks = (allDrinkLogs || []).reduce((sum, log) => sum + (log.drink_count || 0), 0);
    const totalSoberDays = (allDrinkLogs || []).filter(log => log.drink_count === 0).length;
    
    // Calculate REAL money spent from user input
    const totalMoneySpent = (allDrinkLogs || []).reduce((sum, log) => sum + (log.drink_price || 0), 0);
    
    // Calculate average drink price from user's actual data
    const drinksWithPrice = (allDrinkLogs || []).filter(log => log.drink_count > 0 && log.drink_price > 0);
    const avgDrinkPrice = drinksWithPrice.length > 0
      ? drinksWithPrice.reduce((sum, log) => sum + log.drink_price, 0) / drinksWithPrice.reduce((sum, log) => sum + log.drink_count, 0)
      : 500; // Default RS 500 if no data
    
    // Estimate drinks avoided (assuming average drinks per day before sobriety)
    const estimatedDrinksPerDay = 5; // Assumption
    const potentialDrinks = daysInApp * estimatedDrinksPerDay;
    const drinksAvoided = Math.max(0, potentialDrinks - totalDrinks);
    
    // Calculate money saved using user's average drink price
    const potentialMoneySpent = potentialDrinks * avgDrinkPrice;
    const moneySaved = Math.round(potentialMoneySpent - totalMoneySpent);
    
    // Get this month's data
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const { data: monthDrinkLogs } = await query(
      'SELECT * FROM drink_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ?',
      [userId, monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]]
    );
    
    const { data: monthMoodLogs } = await query(
      'SELECT * FROM mood_logs WHERE user_id = ? AND log_date >= ? AND log_date <= ?',
      [userId, monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]]
    );
    
    // Calculate this month stats
    const monthTotalDrinks = (monthDrinkLogs || []).reduce((sum, log) => sum + (log.drink_count || 0), 0);
    const monthSoberDays = (monthDrinkLogs || []).filter(log => log.drink_count === 0).length;
    const monthDaysLogged = (monthDrinkLogs || []).length;
    const monthAverageDrinks = monthDaysLogged > 0 ? (monthTotalDrinks / monthDaysLogged).toFixed(1) : 0;
    const monthMostCommonMood = getMostCommonMood(monthMoodLogs || []);
    
    res.status(200).json({
      success: true,
      allTime: {
        soberDays: totalSoberDays,
        totalDrinks,
        drinksAvoided,
        moneySaved,
        moneySpent: Math.round(totalMoneySpent),
        avgDrinkPrice: Math.round(avgDrinkPrice),
        daysInApp,
        totalPoints: profile?.total_points || 0,
      },
      thisMonth: {
        soberDays: monthSoberDays,
        totalDrinks: monthTotalDrinks,
        averageDrinks: parseFloat(monthAverageDrinks),
        daysLogged: monthDaysLogged,
        mostCommonMood: monthMostCommonMood,
        moneySpent: Math.round((monthDrinkLogs || []).reduce((sum, log) => sum + (log.drink_price || 0), 0)),
      },
    });
  } catch (error) {
    console.error('Error fetching stats summary:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { 
  getWeeklyProgress, 
  getMonthlyProgress, 
  getOverallProgress, 
  getDashboardData,
  getCalendarData,
  getWeeklyComparison,
  getStatsSummary,
};
