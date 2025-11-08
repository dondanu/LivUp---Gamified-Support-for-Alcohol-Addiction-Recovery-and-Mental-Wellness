const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, queryOne } = require('../config/database');

const register = async (req, res) => {
  try {
    const { email, password, username, isAnonymous = false } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (!isAnonymous && !email) {
      return res.status(400).json({ error: 'Email is required for non-anonymous accounts' });
    }

    // Check if username exists
    const { data: existingUser } = await queryOne('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Check if email exists
    if (email) {
      const { data: existingEmail } = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data: insertResult, error: userError } = await query(
      'INSERT INTO users (email, password_hash, username, is_anonymous) VALUES (?, ?, ?, ?)',
      [email || null, hashedPassword, username, isAnonymous]
    );

    if (userError) {
      return res.status(500).json({ error: 'Failed to create user', details: userError.message });
    }

    const userId = insertResult.insertId;

    // Create user profile
    const { error: profileError } = await query(
      'INSERT INTO user_profiles (user_id, total_points, current_streak, longest_streak, level_id, avatar_type, days_sober) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, 0, 0, 0, 1, 'basic', 0]
    );

    if (profileError) {
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    // Create user settings
    const { error: settingsError } = await query(
      'INSERT INTO user_settings (user_id, notifications_enabled, reminder_frequency, theme) VALUES (?, ?, ?, ?)',
      [userId, true, 'daily', 'light']
    );

    if (settingsError) {
      return res.status(500).json({ error: 'Failed to create user settings' });
    }

    // Get the new user
    const { data: newUser } = await queryOne('SELECT * FROM users WHERE id = ?', [userId]);

    const token = jwt.sign({ userId: newUser.id, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, username: newUser.username, email: newUser.email, isAnonymous: newUser.is_anonymous }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Try to find user by username first, then by email
    let user, error;
    const { data: userByUsername, error: errorUsername } = await queryOne('SELECT * FROM users WHERE username = ?', [username]);
    
    if (userByUsername) {
      user = userByUsername;
    } else {
      // If not found by username, try email
      const { data: userByEmail, error: errorEmail } = await queryOne('SELECT * FROM users WHERE email = ?', [username]);
      if (userByEmail) {
        user = userByEmail;
      } else {
        error = errorEmail || errorUsername;
      }
    }

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, isAnonymous: user.is_anonymous }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: user } = await queryOne('SELECT id, username, email, is_anonymous, created_at FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { data: profile } = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({ user, profile });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { register, login, getProfile };
