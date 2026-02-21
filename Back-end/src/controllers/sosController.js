const { query, queryOne } = require('../config/database');

const addSOSContact = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contactName, contactPhone, relationship } = req.body;

    // Input validation
    if (!contactName || typeof contactName !== 'string') {
      return res.status(400).json({ error: 'Contact name is required and must be a string' });
    }
    
    if (!contactPhone || typeof contactPhone !== 'string') {
      return res.status(400).json({ error: 'Contact phone is required and must be a string' });
    }
    
    if (contactName.length > 100) {
      return res.status(400).json({ error: 'Contact name must be 100 characters or less' });
    }
    
    // Validate phone number format (basic validation)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(contactPhone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    if (contactPhone.length > 20) {
      return res.status(400).json({ error: 'Phone number must be 20 characters or less' });
    }
    
    if (relationship !== undefined && relationship !== null) {
      if (typeof relationship !== 'string') {
        return res.status(400).json({ error: 'Relationship must be a string' });
      }
      if (relationship.length > 50) {
        return res.status(400).json({ error: 'Relationship must be 50 characters or less' });
      }
    }

    const { data: insertResult, error: insertError } = await query('INSERT INTO sos_contacts (user_id, contact_name, contact_phone, relationship, is_active) VALUES (?, ?, ?, ?, ?)', [userId, contactName, contactPhone, relationship || null, true]);
    
    if (insertError || !insertResult) {
      return res.status(500).json({ error: 'Failed to add SOS contact', details: insertError?.message });
    }
    
    const { data: contact } = await queryOne('SELECT * FROM sos_contacts WHERE id = ?', [insertResult.insertId]);

    res.status(201).json({ message: 'SOS contact added successfully', contact });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getSOSContacts = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data } = await query('SELECT * FROM sos_contacts WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC', [userId]);

    res.status(200).json({ contacts: data || [], count: (data || []).length });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const updateSOSContact = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contactId } = req.params;
    const { contactName, contactPhone, relationship, isActive } = req.body;

    // Input validation
    if (contactName !== undefined) {
      if (typeof contactName !== 'string') {
        return res.status(400).json({ error: 'Contact name must be a string' });
      }
      if (contactName.length > 100) {
        return res.status(400).json({ error: 'Contact name must be 100 characters or less' });
      }
    }
    
    if (contactPhone !== undefined) {
      if (typeof contactPhone !== 'string') {
        return res.status(400).json({ error: 'Contact phone must be a string' });
      }
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(contactPhone)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }
      if (contactPhone.length > 20) {
        return res.status(400).json({ error: 'Phone number must be 20 characters or less' });
      }
    }
    
    if (relationship !== undefined && relationship !== null) {
      if (typeof relationship !== 'string') {
        return res.status(400).json({ error: 'Relationship must be a string' });
      }
      if (relationship.length > 50) {
        return res.status(400).json({ error: 'Relationship must be 50 characters or less' });
      }
    }
    
    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }

    const { data: contact } = await queryOne('SELECT * FROM sos_contacts WHERE id = ? AND user_id = ?', [contactId, userId]);

    if (!contact) {
      return res.status(404).json({ error: 'SOS contact not found' });
    }

    const updateFields = [];
    const updateValues = [];

    if (contactName !== undefined) {
      updateFields.push('contact_name = ?');
      updateValues.push(contactName);
    }
    if (contactPhone !== undefined) {
      updateFields.push('contact_phone = ?');
      updateValues.push(contactPhone);
    }
    if (relationship !== undefined) {
      updateFields.push('relationship = ?');
      updateValues.push(relationship);
    }
    if (isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(isActive);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(contactId);
    const sql = `UPDATE sos_contacts SET ${updateFields.join(', ')} WHERE id = ?`;
    await query(sql, updateValues);

    const { data: updatedContact } = await queryOne('SELECT * FROM sos_contacts WHERE id = ?', [contactId]);

    res.status(200).json({ message: 'SOS contact updated successfully', contact: updatedContact });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const deleteSOSContact = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { contactId } = req.params;

    const { data: contact } = await queryOne('SELECT * FROM sos_contacts WHERE id = ? AND user_id = ?', [contactId, userId]);

    if (!contact) {
      return res.status(404).json({ error: 'SOS contact not found' });
    }

    await query('DELETE FROM sos_contacts WHERE id = ?', [contactId]);

    res.status(200).json({ message: 'SOS contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { addSOSContact, getSOSContacts, updateSOSContact, deleteSOSContact };
