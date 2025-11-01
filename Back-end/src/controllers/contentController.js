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
    const { category, limit = 10 } = req.query;
    let sql = 'SELECT * FROM healthy_alternatives';
    const params = [];

    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }

    sql += ' LIMIT ?';
    params.push(parseInt(limit));

    const { data } = await query(sql, params);
    res.status(200).json({ alternatives: data || [], count: (data || []).length });
  } catch (error) {
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
