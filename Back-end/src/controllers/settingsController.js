const { query, queryOne } = require('../config/database');
const bcrypt = require('bcrypt');

// Get user settings
const getSettings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: settings } = await queryOne(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [userId]
    );

    if (!settings) {
      // Create default settings if not exists
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await query(
        'INSERT INTO user_settings (user_id, notifications_enabled, theme, reminder_frequency, created_at) VALUES (?, ?, ?, ?, ?)',
        [userId, true, 'light', 'daily', now]
      );
      const { data: newSettings } = await queryOne('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
      return res.status(200).json({ settings: newSettings });
    }

    res.status(200).json({ settings });
  } catch (error) {
    console.error('[getSettings] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Update notifications
const updateNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notificationsEnabled } = req.body;

    if (notificationsEnabled === undefined) {
      return res.status(400).json({ error: 'notificationsEnabled is required' });
    }

    await query(
      'UPDATE user_settings SET notifications_enabled = ? WHERE user_id = ?',
      [notificationsEnabled, userId]
    );

    const { data: updated } = await queryOne(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [userId]
    );

    res.status(200).json({
      message: 'Notifications updated successfully',
      settings: updated,
    });
  } catch (error) {
    console.error('[updateNotifications] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Update theme
const updateTheme = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({ error: 'theme is required' });
    }

    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).json({ error: 'Invalid theme. Must be light or dark' });
    }

    await query(
      'UPDATE user_settings SET theme = ? WHERE user_id = ?',
      [theme, userId]
    );

    const { data: updated } = await queryOne(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [userId]
    );

    res.status(200).json({
      message: 'Theme updated successfully',
      settings: updated,
    });
  } catch (error) {
    console.error('[updateTheme] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Change email
const changeEmail = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { newEmail } = req.body;

    console.log('[changeEmail] userId:', userId);
    console.log('[changeEmail] newEmail:', newEmail);

    if (!newEmail) {
      return res.status(400).json({ error: 'New email is required' });
    }

    // Check if email already exists
    const { data: existing } = await queryOne(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [newEmail, userId]
    );

    console.log('[changeEmail] Existing email check:', existing);

    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    console.log('[changeEmail] Updating email in database...');
    const result = await query('UPDATE users SET email = ? WHERE id = ?', [newEmail, userId]);
    console.log('[changeEmail] Update result:', result);

    // Verify the update
    const { data: updatedUser } = await queryOne('SELECT id, email FROM users WHERE id = ?', [userId]);
    console.log('[changeEmail] Updated user:', updatedUser);

    res.status(200).json({ 
      message: 'Email updated successfully',
      newEmail: updatedUser.email 
    });
  } catch (error) {
    console.error('[changeEmail] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get current password hash
    const { data: user } = await queryOne(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, userId]);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('[changePassword] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Export user data
const exportData = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all user data
    const { data: user } = await queryOne(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    const { data: profile } = await queryOne(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    const { data: settings } = await queryOne(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [userId]
    );

    const { data: drinkLogs } = await query(
      'SELECT * FROM drink_logs WHERE user_id = ? ORDER BY log_date DESC',
      [userId]
    );

    const { data: moodLogs } = await query(
      'SELECT * FROM mood_logs WHERE user_id = ? ORDER BY log_date DESC',
      [userId]
    );

    const { data: journalEntries } = await query(
      'SELECT * FROM journal_entries WHERE user_id = ? ORDER BY entry_date DESC',
      [userId]
    );

    const { data: milestones } = await query(
      'SELECT * FROM user_milestones WHERE user_id = ? ORDER BY milestone_date ASC',
      [userId]
    );

    const exportData = {
      user,
      profile,
      settings,
      drinkLogs: drinkLogs || [],
      moodLogs: moodLogs || [],
      journalEntries: journalEntries || [],
      milestones: milestones || [],
      exportedAt: new Date().toISOString(),
    };

    res.status(200).json({
      message: 'Data exported successfully',
      data: exportData,
    });
  } catch (error) {
    console.error('[exportData] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    // Get current password hash
    const { data: user } = await queryOne(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Delete user (CASCADE will delete all related data)
    await query('DELETE FROM users WHERE id = ?', [userId]);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('[deleteAccount] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = {
  getSettings,
  updateNotifications,
  updateTheme,
  changeEmail,
  changePassword,
  exportData,
  deleteAccount,
};
