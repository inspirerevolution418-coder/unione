const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireLogin } = require('../middleware/auth');

// GET /feedback - form + the student's own past feedback
router.get('/feedback', requireLogin, async (req, res) => {
  try {
    const [past] = await pool.execute(
      'SELECT * FROM feedback WHERE student_id = ? ORDER BY submitted_at DESC',
      [req.session.studentId]
    );
    res.render('feedback', { past, sent: req.query.sent === '1' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading feedback page.');
  }
});

// POST /feedback - submit new feedback
router.post('/feedback', requireLogin, async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.redirect('/feedback');
  }
  try {
    await pool.execute(
      'INSERT INTO feedback (student_id, message) VALUES (?, ?)',
      [req.session.studentId, message.trim()]
    );
    res.redirect('/feedback?sent=1');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error submitting feedback.');
  }
});

module.exports = router;
