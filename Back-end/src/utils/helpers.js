const calculateStreak = (drinkLogs) => {
  if (!drinkLogs || drinkLogs.length === 0) return 0;

  const sortedLogs = drinkLogs.sort((a, b) => new Date(b.log_date) - new Date(a.log_date));

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const log of sortedLogs) {
    const logDate = new Date(log.log_date);
    logDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === streak && log.drink_count === 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (log.drink_count > 0) {
      break;
    }
  }

  return streak;
};

const calculateTotalSoberDays = (drinkLogs) => {
  if (!drinkLogs || drinkLogs.length === 0) return 0;
  return drinkLogs.filter(log => log.drink_count === 0).length;
};

const determineLevel = (points, levels) => {
  let currentLevel = levels[0];

  for (const level of levels) {
    if (points >= level.points_required) {
      currentLevel = level;
    } else {
      break;
    }
  }

  return currentLevel;
};

const checkAchievementEligibility = (userStats, achievement) => {
  switch (achievement.requirement_type) {
    case 'days_sober':
      return userStats.days_sober >= achievement.requirement_value;
    case 'streak':
      return userStats.current_streak >= achievement.requirement_value;
    case 'tasks_completed':
      return userStats.tasks_completed >= achievement.requirement_value;
    case 'drinks_avoided':
      return userStats.drinks_avoided >= achievement.requirement_value;
    default:
      return false;
  }
};

const getDateRange = (period) => {
  // Base on “current week Monday to Sunday” where Sunday can be in the future.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate = new Date(today);
  let endDate = new Date(today);

  switch (period) {
    case 'week': {
      const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
      const diffToMonday = (dayOfWeek + 6) % 7; // Sun -> 6, Mon -> 0, Tue ->1, ...

      // Start: Monday of current week
      startDate.setDate(today.getDate() - diffToMonday);
      startDate.setHours(0, 0, 0, 0);

      // End: Sunday of the same week (may be in the future)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    case 'month': {
      // Calendar month: from the 1st of the current month to the last day of the same month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      // Last day of current month: month+1, day 0 trick
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    case 'year': {
      startDate.setFullYear(today.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    }
    default: {
      const dayOfWeek = today.getDay();
      const diffToMonday = (dayOfWeek + 6) % 7;
      startDate.setDate(today.getDate() - diffToMonday);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

module.exports = {
  calculateStreak,
  calculateTotalSoberDays,
  determineLevel,
  checkAchievementEligibility,
  getDateRange
};
