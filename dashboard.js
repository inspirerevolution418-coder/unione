const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireLogin } = require('../middleware/auth');

// GET / -> redirect to dashboard or login
router.get('/', (req, res) => {
  res.redirect(req.session.studentId ? '/dashboard' : '/login');
});

// GET /dashboard - the combined UNIONE Dashboard
router.get('/dashboard', requireLogin, async (req, res) => {
  try {
    const studentId = req.session.studentId;

    const [[student]] = await pool.execute(
      'SELECT * FROM students WHERE id = ?',
      [studentId]
    );

    const [attendanceRows] = await pool.execute(
      `SELECT c.code, a.percentage
       FROM attendance a JOIN courses c ON a.course_id = c.id
       WHERE a.student_id = ?`,
      [studentId]
    );

    const [[dueRow]] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE student_id = ?`,
      [studentId]
    );
    const CURRENT_DUE_BASELINE = 20000; // fixed baseline due amount, as specified in requirements
    const amountDue = Math.max(CURRENT_DUE_BASELINE - Number(dueRow.total_paid), 0);

    const [notices] = await pool.execute(
      'SELECT * FROM notices ORDER BY posted_date DESC LIMIT 3'
    );

    res.render('dashboard', {
      student,
      attendanceRows,
      amountDue,
      notices
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard.');
  }
});

module.exports = router;
