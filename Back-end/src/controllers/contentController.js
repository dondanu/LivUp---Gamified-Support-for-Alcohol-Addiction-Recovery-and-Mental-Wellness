const { query } = require('../config/database');

const getMotivationalQuote = async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM motivational_quotes WHERE is_active = 1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    const { data } = await query(sql, params);

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No quotes found' });
    }

    const randomQuote = data[Math.floor(Math.random() * data.length)];
    res.status(200).json({ quote: randomQuote });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getHealthyAlternatives = async (req, res) => {
  try {
    const { category, limit = 25 } = req.query;
    let sql = 'SELECT * FROM healthy_alternatives';
    const params = [];

    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }

    // Use template literal for LIMIT to avoid parameter binding issues
    const limitValue = parseInt(limit) || 25;
    sql += ` LIMIT ${limitValue}`;

    console.log(`[Content] Fetching alternatives: ${sql}`);
    const { data, error } = await query(sql, params);
    
    if (error) {
      console.error('[Content] Error fetching alternatives:', error);
      return res.status(500).json({ error: 'Server error', details: error.message });
    }
    
    console.log(`[Content] Found ${(data || []).length} alternatives`);
    res.status(200).json({ alternatives: data || [], count: (data || []).length });
  } catch (error) {
    console.error('[Content] Exception:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

const getRandomAlternative = async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM healthy_alternatives';
    const params = [];

    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }

    const { data } = await query(sql, params);

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No alternatives found' });
    }

    const randomAlternative = data[Math.floor(Math.random() * data.length)];
    res.status(200).json({ alternative: randomAlternative });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

module.exports = { getMotivationalQuote, getHealthyAlternatives, getRandomAlternative };
