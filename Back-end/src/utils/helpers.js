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
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 7);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

module.exports = {
  calculateStreak,
  calculateTotalSoberDays,
  determineLevel,
  checkAchievementEligibility,
  getDateRange
};
