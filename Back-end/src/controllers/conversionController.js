const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryOne, transaction } = require('../config/database');
const { clearPromptTracking } = require('../utils/milestoneDetection');

/**
 * Convert an anonymous user account to a registered account
 * POST /api/auth/convert
 */
const convertAnonymousToRegistered = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const userId = req.user.userId; // From JWT token

    // Validate required fields
    if (!email || !password || !username) {
      return res.status(400).json({
        error: 'Email, password, and username are required',
      });
    }

    // Validate email format (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
      });
    }

    // Validate username length
    if (username.length < 3) {
      return res.status(400).json({
        error: 'Username must be at least 3 characters',
      });
    }

    // Get current user
    const { data: currentUser, error: userError } = await queryOne(
      'SELECT id, username, email, is_anonymous FROM users WHERE id = ?',
      [userId],
    );

    if (userError || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is anonymous
    if (!currentUser.is_anonymous) {
      return res.status(403).json({
        error: 'User is already registered',
      });
    }

    // Check if email already exists
    const { data: existingEmail } = await queryOne('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);

    if (existingEmail) {
      return res.status(409).json({
        error: 'Email already exists',
      });
    }

    // Check if username already exists
    const { data: existingUsername } = await queryOne('SELECT id FROM users WHERE username = ? AND id != ?', [
      username,
      userId,
    ]);

    if (existingUsername) {
      return res.status(409).json({
        error: 'Username already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use transaction to ensure atomicity
    const { error: txError } = await transaction(async (tx) => {
      // Update user record
      const { error: updateError } = await tx.query(
        `UPDATE users 
         SET email = ?, password_hash = ?, username = ?, is_anonymous = FALSE 
         WHERE id = ?`,
        [email, hashedPassword, username, userId],
      );

      if (updateError) {
        throw new Error('Failed to update user: ' + updateError.message);
      }

      return true;
    });

    if (txError) {
      console.error('Transaction error during conversion:', txError);
      return res.status(500).json({
        error: 'Failed to convert account',
        details: txError.message,
      });
    }

    // Clear conversion prompt tracking
    await clearPromptTracking(userId);

    // Generate new JWT token with updated user info
    const token = jwt.sign({ userId: userId, username: username }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Return success response
    res.status(200).json({
      message: 'Account converted successfully',
      token,
      user: {
        id: userId,
        username: username,
        email: email,
        isAnonymous: false,
      },
    });
  } catch (error) {
    console.error('Error in convertAnonymousToRegistered:', error);
    res.status(500).json({
      error: 'Server error',
      details: error.message,
    });
  }
};

module.exports = {
  convertAnonymousToRegistered,
};
