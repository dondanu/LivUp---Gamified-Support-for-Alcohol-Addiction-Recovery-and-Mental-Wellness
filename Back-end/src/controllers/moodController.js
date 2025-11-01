const { query, queryOne } = require('../config/database');

const logMood = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { moodType, moodScore, logDate, notes } = req.body;

    if (!moodType || !moodScore) {
      return res.status(400).json({ error: 'Mood type and score are required' });
    }

    if (moodScore < 1 || moodScore > 10) {
      return res.status(400).json({ error: 'Mood score must be between 1 and 10' });
    }

    const validMoodTypes = ['happy', 'sad', 'stressed', 'anxious', 'calm', 'angry'];
    if (!validMoodTypes.includes(moodType)) {
      return res.status(400).json({ error: 'Invalid mood type' });
    }

    const date = logDate || new Date().toISOString().split('T')[0];

    const { data: existingLog } = await queryOne('SELECT * FROM mood_logs WHERE user_id = ? AND log_date = ?', [userId, date]);

    let moodLog;
    if (existingLog) {
      await query('UPDATE mood_logs SET mood_type = ?, mood_score = ?, notes = ? WHERE id = ?', [moodType, moodScore, notes || existingLog.notes, existingLog.id]);
      const { data: updatedLog } = await queryOne('SELECT * FROM mood_logs WHERE id = ?', [existingLog.id]);
      moodLog = updatedLog;
    } else {
      const { data: insertResult, error: insertError } = await query('INSERT INTO mood_logs (user_id, mood_type, mood_score, log_date, notes) VALUES (?, ?, ?, ?, ?)', [userId, moodType, moodScore, date, notes || null]);
      
      if (insertError || !insertResult) {
        return res.status(500).json({ error: 'Failed to log mood', details: insertError?.message });
      }
      
      const { data: newLog } = await queryOne('SELECT * FROM mood_logs WHERE id = ?', [insertResult.insertId]);
      moodLog = newLog;
    }

    res.status(200).json({ message: 'Mood logged successfully', moodLog });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getMoodLogs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, limit = 30 } = req.query;

    let sql = 'SELECT * FROM mood_logs WHERE user_id = ?';
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

const getMoodStatistics = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: logs } = await query('SELECT * FROM mood_logs WHERE user_id = ? ORDER BY log_date DESC', [userId]);

    const logsArray = logs || [];
    if (logsArray.length === 0) {
      return res.status(200).json({ statistics: { averageMoodScore: 0, mostCommonMood: null, moodDistribution: {}, totalLogs: 0 } });
    }

    const averageMoodScore = logsArray.reduce((sum, log) => sum + log.mood_score, 0) / logsArray.length;

    const moodCounts = logsArray.reduce((acc, log) => {
      acc[log.mood_type] = (acc[log.mood_type] || 0) + 1;
      return acc;
    }, {});

    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);

    res.status(200).json({ statistics: { averageMoodScore: parseFloat(averageMoodScore.toFixed(2)), mostCommonMood, moodDistribution: moodCounts, totalLogs: logsArray.length } });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const deleteMoodLog = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { logId } = req.params;

    const { data: log } = await queryOne('SELECT * FROM mood_logs WHERE id = ? AND user_id = ?', [logId, userId]);

    if (!log) {
      return res.status(404).json({ error: 'Mood log not found' });
    }

    await query('DELETE FROM mood_logs WHERE id = ?', [logId]);
    res.status(200).json({ message: 'Mood log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { logMood, getMoodLogs, getMoodStatistics, deleteMoodLog };
