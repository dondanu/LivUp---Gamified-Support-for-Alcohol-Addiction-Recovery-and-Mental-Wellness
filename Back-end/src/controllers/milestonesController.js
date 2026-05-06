const { query, queryOne } = require('../config/database');

// Get all milestones for a user
const getMilestones = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: milestones } = await query(
      'SELECT * FROM user_milestones WHERE user_id = ? ORDER BY milestone_date ASC',
      [userId]
    );

    res.status(200).json({ milestones: milestones || [] });
  } catch (error) {
    console.error('[getMilestones] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Add a new milestone
const addMilestone = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, date, type } = req.body;

    // Validation
    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }

    const validTypes = ['sobriety', 'custom'];
    const milestoneType = type || 'custom';
    if (!validTypes.includes(milestoneType)) {
      return res.status(400).json({ error: 'Invalid milestone type' });
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const { data: insertResult } = await query(
      'INSERT INTO user_milestones (user_id, title, milestone_date, type, created_at) VALUES (?, ?, ?, ?, ?)',
      [userId, title, date, milestoneType, now]
    );

    if (!insertResult || !insertResult.insertId) {
      return res.status(500).json({ error: 'Failed to create milestone' });
    }

    const { data: newMilestone } = await queryOne(
      'SELECT * FROM user_milestones WHERE id = ?',
      [insertResult.insertId]
    );

    res.status(201).json({ 
      message: 'Milestone added successfully', 
      milestone: newMilestone 
    });
  } catch (error) {
    console.error('[addMilestone] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Update a milestone
const updateMilestone = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { title, date } = req.body;

    // Check if milestone exists and belongs to user
    const { data: existing } = await queryOne(
      'SELECT * FROM user_milestones WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // Validation
    if (title && title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }

    const updateFields = [];
    const updateValues = [];

    if (title) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (date) {
      updateFields.push('milestone_date = ?');
      updateValues.push(date);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(id, userId);
    await query(
      `UPDATE user_milestones SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );

    const { data: updated } = await queryOne(
      'SELECT * FROM user_milestones WHERE id = ?',
      [id]
    );

    res.status(200).json({ 
      message: 'Milestone updated successfully', 
      milestone: updated 
    });
  } catch (error) {
    console.error('[updateMilestone] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Delete a milestone
const deleteMilestone = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Check if milestone exists and belongs to user
    const { data: existing } = await queryOne(
      'SELECT * FROM user_milestones WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // Don't allow deleting sobriety start date
    if (existing.type === 'sobriety') {
      return res.status(400).json({ error: 'Cannot delete sobriety start date' });
    }

    await query('DELETE FROM user_milestones WHERE id = ? AND user_id = ?', [id, userId]);

    res.status(200).json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('[deleteMilestone] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = {
  getMilestones,
  addMilestone,
  updateMilestone,
  deleteMilestone,
};
