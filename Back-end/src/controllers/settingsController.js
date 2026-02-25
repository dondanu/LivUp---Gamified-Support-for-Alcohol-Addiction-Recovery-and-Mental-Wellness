const { query, queryOne } = require('../config/database');

const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data } = await queryOne('SELECT * FROM user_settings WHERE user_id = ?', [userId]);

    if (!data) {
      const { data: insertResult } = await query('INSERT INTO user_settings (user_id, notifications_enabled, reminder_frequency, theme) VALUES (?, ?, ?, ?)', [userId, true, 'daily', 'light']);
      const { data: newSettings } = await queryOne('SELECT * FROM user_settings WHERE id = ?', [insertResult.insertId]);
      return res.status(200).json({ settings: newSettings });
    }

    res.status(200).json({ settings: data });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notificationsEnabled, dailyReminderTime, reminderFrequency, theme } = req.body;

    // Input validation
    if (notificationsEnabled !== undefined && typeof notificationsEnabled !== 'boolean') {
      return res.status(400).json({ error: 'notificationsEnabled must be a boolean' });
    }
    
    if (dailyReminderTime !== undefined) {
      // Validate time format (HH:MM)
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(dailyReminderTime)) {
        return res.status(400).json({ error: 'dailyReminderTime must be in HH:MM format' });
      }
    }
    
    if (reminderFrequency !== undefined) {
      const validFrequencies = ['daily', 'weekly', 'never'];
      if (!validFrequencies.includes(reminderFrequency)) {
        return res.status(400).json({ error: 'reminderFrequency must be one of: daily, weekly, never' });
      }
    }
    
    if (theme !== undefined) {
      const validThemes = ['light', 'dark', 'auto'];
      if (!validThemes.includes(theme)) {
        return res.status(400).json({ error: 'theme must be one of: light, dark, auto' });
      }
    }

    const { data: existingSettings } = await queryOne('SELECT * FROM user_settings WHERE user_id = ?', [userId]);

    if (!existingSettings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const updateFields = ['updated_at = ?'];
    const updateValues = [new Date().toISOString()];

    if (notificationsEnabled !== undefined) {
      updateFields.push('notifications_enabled = ?');
      updateValues.push(notificationsEnabled);
    }
    if (dailyReminderTime !== undefined) {
      updateFields.push('daily_reminder_time = ?');
      updateValues.push(dailyReminderTime);
    }
    if (reminderFrequency !== undefined) {
      updateFields.push('reminder_frequency = ?');
      updateValues.push(reminderFrequency);
    }
    if (theme !== undefined) {
      updateFields.push('theme = ?');
      updateValues.push(theme);
    }

    updateValues.push(userId);
    const sql = `UPDATE user_settings SET ${updateFields.join(', ')} WHERE user_id = ?`;
    await query(sql, updateValues);

    const { data: updatedSettings } = await queryOne('SELECT * FROM user_settings WHERE user_id = ?', [userId]);

    res.status(200).json({ message: 'Settings updated successfully', settings: updatedSettings });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { getUserSettings, updateUserSettings };
