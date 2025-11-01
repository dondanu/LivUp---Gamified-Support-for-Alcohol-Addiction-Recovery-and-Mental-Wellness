const { query, queryOne } = require('../config/database');
const { calculateStreak, calculateTotalSoberDays } = require('../utils/helpers');

const logDrink = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { drinkCount, logDate, notes } = req.body;

    if (drinkCount === undefined || drinkCount < 0) {
      return res.status(400).json({ error: 'Valid drink count is required' });
    }

    const date = logDate || new Date().toISOString().split('T')[0];

    const { data: existingLog } = await queryOne('SELECT * FROM drink_logs WHERE user_id = ? AND log_date = ?', [userId, date]);

    let drinkLog;
    if (existingLog) {
      await query('UPDATE drink_logs SET drink_count = ?, notes = ? WHERE id = ?', [drinkCount, notes || existingLog.notes, existingLog.id]);
      const { data: updatedLog } = await queryOne('SELECT * FROM drink_logs WHERE id = ?', [existingLog.id]);
      drinkLog = updatedLog;
    } else {
      const { data: insertResult, error: insertError } = await query('INSERT INTO drink_logs (user_id, drink_count, log_date, notes) VALUES (?, ?, ?, ?)', [userId, drinkCount, date, notes || null]);
      
      if (insertError || !insertResult) {
        return res.status(500).json({ error: 'Failed to log drink', details: insertError?.message });
      }
      
      const { data: newLog } = await queryOne('SELECT * FROM drink_logs WHERE id = ?', [insertResult.insertId]);
      drinkLog = newLog;
    }

    const { data: allLogs } = await query('SELECT * FROM drink_logs WHERE user_id = ? ORDER BY log_date DESC', [userId]);

    const currentStreak = calculateStreak(allLogs || []);
    const totalSoberDays = calculateTotalSoberDays(allLogs || []);

    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);

    const longestStreak = Math.max(currentStreak, profile?.longest_streak || 0);
    const pointsEarned = drinkCount === 0 ? 10 : 0;
    const newTotalPoints = (profile?.total_points || 0) + pointsEarned;

    await query('UPDATE user_profiles SET current_streak = ?, longest_streak = ?, days_sober = ?, total_points = ?, updated_at = ? WHERE user_id = ?', [currentStreak, longestStreak, totalSoberDays, newTotalPoints, new Date().toISOString(), userId]);

    res.status(200).json({ message: 'Drink log recorded successfully', drinkLog, stats: { currentStreak, totalSoberDays, pointsEarned, totalPoints: newTotalPoints } });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getDrinkLogs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, limit = 30 } = req.query;

    let sql = 'SELECT * FROM drink_logs WHERE user_id = ?';
    const params = [userId];

    if (startDate) {
      sql += ' AND log_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND log_date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY log_date DESC LIMIT ?';
    params.push(parseInt(limit));

    const { data } = await query(sql, params);

    res.status(200).json({ logs: data || [], count: (data || []).length });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const deleteDrinkLog = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { logId } = req.params;

    const { data: log } = await queryOne('SELECT * FROM drink_logs WHERE id = ? AND user_id = ?', [logId, userId]);

    if (!log) {
      return res.status(404).json({ error: 'Drink log not found' });
    }

    await query('DELETE FROM drink_logs WHERE id = ?', [logId]);
    res.status(200).json({ message: 'Drink log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getDrinkStatistics = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: logs } = await query('SELECT * FROM drink_logs WHERE user_id = ? ORDER BY log_date DESC', [userId]);

    const logsArray = logs || [];
    const totalDrinks = logsArray.reduce((sum, log) => sum + log.drink_count, 0);
    const totalSoberDays = calculateTotalSoberDays(logsArray);
    const currentStreak = calculateStreak(logsArray);

    const lastWeekLogs = logsArray.filter(log => {
      const logDate = new Date(log.log_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    });

    const weeklyDrinks = lastWeekLogs.reduce((sum, log) => sum + log.drink_count, 0);

    res.status(200).json({ statistics: { totalDrinks, totalSoberDays, currentStreak, weeklyDrinks, totalLogs: logsArray.length } });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { logDrink, getDrinkLogs, deleteDrinkLog, getDrinkStatistics };
