const { query, queryOne } = require('../config/database');

const logTrigger = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { triggerType, intensity, logDate, notes } = req.body;

    if (!triggerType || !intensity) {
      return res.status(400).json({ error: 'Trigger type and intensity are required' });
    }

    if (intensity < 1 || intensity > 10) {
      return res.status(400).json({ error: 'Intensity must be between 1 and 10' });
    }

    const validTriggerTypes = ['stress', 'party', 'social', 'boredom', 'anxiety', 'other'];
    if (!validTriggerTypes.includes(triggerType)) {
      return res.status(400).json({ error: 'Invalid trigger type' });
    }

    const date = logDate || new Date().toISOString().split('T')[0];

    const { data: insertResult, error: insertError } = await query('INSERT INTO trigger_logs (user_id, trigger_type, intensity, log_date, notes) VALUES (?, ?, ?, ?, ?)', [userId, triggerType, intensity, date, notes || null]);
    
    if (insertError || !insertResult) {
      return res.status(500).json({ error: 'Failed to log trigger', details: insertError?.message });
    }
    
    const { data: triggerLog } = await queryOne('SELECT * FROM trigger_logs WHERE id = ?', [insertResult.insertId]);

    res.status(201).json({ message: 'Trigger logged successfully', triggerLog });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getTriggerLogs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, limit = 50 } = req.query;

    let sql = 'SELECT * FROM trigger_logs WHERE user_id = ?';
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

const getTriggerAnalysis = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: logs } = await query('SELECT * FROM trigger_logs WHERE user_id = ? ORDER BY log_date DESC', [userId]);

    const logsArray = logs || [];
    if (logsArray.length === 0) {
      return res.status(200).json({ analysis: { mostCommonTrigger: null, averageIntensity: 0, triggerDistribution: {}, totalTriggers: 0 } });
    }

    const averageIntensity = logsArray.reduce((sum, log) => sum + log.intensity, 0) / logsArray.length;

    const triggerCounts = logsArray.reduce((acc, log) => {
      acc[log.trigger_type] = (acc[log.trigger_type] || 0) + 1;
      return acc;
    }, {});

    const mostCommonTrigger = Object.keys(triggerCounts).reduce((a, b) => triggerCounts[a] > triggerCounts[b] ? a : b);

    const triggerIntensities = logsArray.reduce((acc, log) => {
      if (!acc[log.trigger_type]) {
        acc[log.trigger_type] = { total: 0, count: 0 };
      }
      acc[log.trigger_type].total += log.intensity;
      acc[log.trigger_type].count += 1;
      return acc;
    }, {});

    const triggerAverages = {};
    Object.keys(triggerIntensities).forEach(trigger => {
      triggerAverages[trigger] = parseFloat((triggerIntensities[trigger].total / triggerIntensities[trigger].count).toFixed(2));
    });

    res.status(200).json({ analysis: { mostCommonTrigger, averageIntensity: parseFloat(averageIntensity.toFixed(2)), triggerDistribution: triggerCounts, triggerAverageIntensities: triggerAverages, totalTriggers: logsArray.length } });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const deleteTriggerLog = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { logId } = req.params;

    const { data: log } = await queryOne('SELECT * FROM trigger_logs WHERE id = ? AND user_id = ?', [logId, userId]);

    if (!log) {
      return res.status(404).json({ error: 'Trigger log not found' });
    }

    await query('DELETE FROM trigger_logs WHERE id = ?', [logId]);
    res.status(200).json({ message: 'Trigger log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { logTrigger, getTriggerLogs, getTriggerAnalysis, deleteTriggerLog };
