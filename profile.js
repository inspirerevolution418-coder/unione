const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireLogin } = require('../middleware/auth');

// GET /profile
router.get('/profile', requireLogin, async (req, res) => {
  try {
    const [[student]] = await pool.execute(
      'SELECT * FROM students WHERE id = ?',
      [req.session.studentId]
    );
    res.render('profile', { student, saved: req.query.saved === '1' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading profile.');
  }
});

// POST /profile - update editable fields (phone, department, semester)
router.post('/profile', requireLogin, async (req, res) => {
  const { department, semester, phone } = req.body;
  try {
    await pool.execute(
      'UPDATE students SET department = ?, semester = ?, phone = ? WHERE id = ?',
      [department, semester, phone, req.session.studentId]
    );
    res.redirect('/profile?saved=1');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating profile.');
  }
});

module.exports = router;
