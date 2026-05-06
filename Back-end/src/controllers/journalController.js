const { query, queryOne } = require('../config/database');

// Get all journal entries for a user
const getJournalEntries = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, startDate, endDate, limit = 100 } = req.query;

    let sql = 'SELECT * FROM journal_entries WHERE user_id = ?';
    const params = [userId];

    // Filter by type if provided
    if (type && ['note', 'gratitude', 'reason', 'mantra'].includes(type)) {
      sql += ' AND type = ?';
      params.push(type);
    }

    // Filter by date range if provided
    if (startDate) {
      sql += ' AND entry_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND entry_date <= ?';
      params.push(endDate);
    }

    sql += ` ORDER BY entry_date DESC, created_at DESC LIMIT ${parseInt(limit)}`;

    const { data: entries, error } = await query(sql, params);

    if (error) {
      console.error('[getJournalEntries] Query error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    res.status(200).json({ entries: entries || [] });
  } catch (error) {
    console.error('[getJournalEntries] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Get entries grouped by type
const getEntriesByType = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: entries } = await query(
      'SELECT * FROM journal_entries WHERE user_id = ? ORDER BY entry_date DESC, created_at DESC',
      [userId]
    );

    // Group entries by type
    const grouped = {
      note: [],
      gratitude: [],
      reason: [],
      mantra: [],
    };

    if (entries) {
      entries.forEach((entry) => {
        if (grouped[entry.type]) {
          grouped[entry.type].push(entry);
        }
      });
    }

    res.status(200).json({ grouped });
  } catch (error) {
    console.error('[getEntriesByType] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Add a new journal entry
const addJournalEntry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, content, entryDate } = req.body;

    // Validation
    if (!type || !content) {
      return res.status(400).json({ error: 'Type and content are required' });
    }

    const validTypes = ['note', 'gratitude', 'reason', 'mantra'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid entry type' });
    }

    if (content.length > 5000) {
      return res.status(400).json({ error: 'Content must be 5000 characters or less' });
    }

    // Use provided date or today's date
    const date = entryDate || new Date().toISOString().split('T')[0];

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const { data: insertResult } = await query(
      'INSERT INTO journal_entries (user_id, type, content, entry_date, created_at) VALUES (?, ?, ?, ?, ?)',
      [userId, type, content, date, now]
    );

    if (!insertResult || !insertResult.insertId) {
      return res.status(500).json({ error: 'Failed to create journal entry' });
    }

    const { data: newEntry } = await queryOne(
      'SELECT * FROM journal_entries WHERE id = ?',
      [insertResult.insertId]
    );

    res.status(201).json({
      message: 'Journal entry added successfully',
      entry: newEntry,
    });
  } catch (error) {
    console.error('[addJournalEntry] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Update a journal entry
const updateJournalEntry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { content, entryDate } = req.body;

    // Check if entry exists and belongs to user
    const { data: existing } = await queryOne(
      'SELECT * FROM journal_entries WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    // Validation
    if (content && content.length > 5000) {
      return res.status(400).json({ error: 'Content must be 5000 characters or less' });
    }

    const updateFields = [];
    const updateValues = [];

    if (content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(content);
    }
    if (entryDate) {
      updateFields.push('entry_date = ?');
      updateValues.push(entryDate);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(id, userId);
    await query(
      `UPDATE journal_entries SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );

    const { data: updated } = await queryOne(
      'SELECT * FROM journal_entries WHERE id = ?',
      [id]
    );

    res.status(200).json({
      message: 'Journal entry updated successfully',
      entry: updated,
    });
  } catch (error) {
    console.error('[updateJournalEntry] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Delete a journal entry
const deleteJournalEntry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Check if entry exists and belongs to user
    const { data: existing } = await queryOne(
      'SELECT * FROM journal_entries WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    await query('DELETE FROM journal_entries WHERE id = ? AND user_id = ?', [id, userId]);

    res.status(200).json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('[deleteJournalEntry] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Get journal statistics
const getJournalStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get total count by type
    const { data: stats } = await query(
      'SELECT type, COUNT(*) as count FROM journal_entries WHERE user_id = ? GROUP BY type',
      [userId]
    );

    // Get total entries
    const { data: totalResult } = await queryOne(
      'SELECT COUNT(*) as total FROM journal_entries WHERE user_id = ?',
      [userId]
    );

    const statsByType = {
      note: 0,
      gratitude: 0,
      reason: 0,
      mantra: 0,
    };

    if (stats) {
      stats.forEach((stat) => {
        statsByType[stat.type] = stat.count;
      });
    }

    res.status(200).json({
      total: totalResult?.total || 0,
      byType: statsByType,
    });
  } catch (error) {
    console.error('[getJournalStats] Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = {
  getJournalEntries,
  getEntriesByType,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalStats,
};
