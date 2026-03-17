const { query } = require('../config/database');

// Get smart insights based on user's tracking data
const getSmartInsights = async (req, res) => {
  try {
    const userId = req.user.userId;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get recent data
    const { data: drinkLogs } = await query(
      'SELECT * FROM drink_logs WHERE user_id = ? AND log_date >= ? ORDER BY log_date DESC',
      [userId, sevenDaysAgo]
    );

    const { data: moodLogs } = await query(
      'SELECT * FROM mood_logs WHERE user_id = ? AND log_date >= ? ORDER BY log_date DESC',
      [userId, sevenDaysAgo]
    );

    const { data: triggerLogs } = await query(
      'SELECT * FROM trigger_logs WHERE user_id = ? AND log_date >= ? ORDER BY log_date DESC',
      [userId, sevenDaysAgo]
    );

    // Analyze patterns and generate insights
    const insights = analyzeUserData(drinkLogs || [], moodLogs || [], triggerLogs || []);

    res.status(200).json({
      insights,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      error: 'Failed to generate insights',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Smart analysis function
function analyzeUserData(drinkLogs, moodLogs, triggerLogs) {
  const insights = {
    type: 'neutral',
    title: '📊 Weekly Summary',
    message: 'Keep tracking your progress!',
    tips: [],
    stats: {
      alcoholFreeDays: 0,
      totalDrinks: 0,
      commonMood: null,
      topTrigger: null,
    },
  };

  // Calculate basic stats
  const alcoholFreeDays = drinkLogs.filter((log) => log.drink_count === 0).length;
  const totalDrinks = drinkLogs.reduce((sum, log) => sum + log.drink_count, 0);

  insights.stats.alcoholFreeDays = alcoholFreeDays;
  insights.stats.totalDrinks = totalDrinks;

  // Find most common mood
  if (moodLogs.length > 0) {
    const moodCounts = {};
    moodLogs.forEach((log) => {
      moodCounts[log.mood_type] = (moodCounts[log.mood_type] || 0) + 1;
    });
    insights.stats.commonMood = Object.keys(moodCounts).reduce((a, b) => (moodCounts[a] > moodCounts[b] ? a : b));
  }

  // Find most common trigger
  if (triggerLogs.length > 0) {
    const triggerCounts = {};
    triggerLogs.forEach((log) => {
      triggerCounts[log.trigger_type] = (triggerCounts[log.trigger_type] || 0) + 1;
    });
    insights.stats.topTrigger = Object.keys(triggerCounts).reduce((a, b) =>
      triggerCounts[a] > triggerCounts[b] ? a : b
    );
  }

  // Generate insights based on patterns
  if (drinkLogs.length === 0) {
    // No data yet
    insights.type = 'welcome';
    insights.title = '👋 Welcome to Mind Fusion!';
    insights.message = 'Start tracking your daily progress to get personalized insights.';
    insights.tips = ['Log your daily drink count', 'Track your mood', 'Note any triggers'];
    return insights;
  }

  // Excellent progress - all alcohol-free days
  if (alcoholFreeDays === drinkLogs.length && drinkLogs.length >= 3) {
    insights.type = 'excellent';
    insights.title = '🎉 Outstanding Progress!';
    insights.message = `${alcoholFreeDays} alcohol-free days this week! You're doing amazing.`;
    insights.tips = ['Keep up this fantastic momentum!', 'Your healthy choices are paying off'];
    return insights;
  }

  // Good progress - mostly alcohol-free days
  if (alcoholFreeDays >= Math.ceil(drinkLogs.length * 0.7)) {
    insights.type = 'good';
    insights.title = '👍 Great Progress!';
    insights.message = `${alcoholFreeDays} out of ${drinkLogs.length} alcohol-free days. You're building great habits!`;
    insights.tips = ["You're on the right track", 'Small consistent steps lead to big changes'];
    return insights;
  }

  // Warning patterns
  if (totalDrinks > drinkLogs.length * 2) {
    insights.type = 'warning';
    insights.title = "⚠️ Let's Refocus";
    insights.message = `${totalDrinks} drinks over ${drinkLogs.length} days. Let's work on reducing this.`;

    // Add specific tips based on patterns
    if (insights.stats.commonMood === 'stressed') {
      insights.tips.push('Try deep breathing when stressed');
    }
    if (insights.stats.commonMood === 'anxious') {
      insights.tips.push('Consider meditation for anxiety');
    }
    if (insights.stats.topTrigger === 'social') {
      insights.tips.push('Plan alcohol-free activities for social events');
    }
    if (insights.stats.topTrigger === 'stress') {
      insights.tips.push('Find healthy stress outlets like exercise');
    }

    return insights;
  }

  // Moderate progress
  insights.type = 'moderate';
  insights.title = '📈 Making Progress';
  insights.message = `${alcoholFreeDays} alcohol-free days out of ${drinkLogs.length}. Every step counts!`;
  insights.tips = ['Focus on one day at a time', 'Celebrate small victories'];

  // Add mood-based tips
  if (insights.stats.commonMood === 'happy') {
    insights.tips.push('Your positive mood is helping your progress!');
  } else if (insights.stats.commonMood === 'sad') {
    insights.tips.push('Consider talking to someone when feeling down');
  }

  return insights;
}

module.exports = {
  getSmartInsights,
};
