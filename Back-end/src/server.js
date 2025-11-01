const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/drinks', require('./routes/drinks'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/triggers', require('./routes/triggers'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/content', require('./routes/content'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/progress', require('./routes/progress'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Mind Fusion API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: MySQL`);
});

module.exports = app;
