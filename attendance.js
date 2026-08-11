const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireLogin } = require('../middleware/auth');

// GET /attendance - Course / Attendance table, as shown in the example
router.get('/attendance', requireLogin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.code, c.name, a.present_days, a.total_days, a.percentage
       FROM attendance a JOIN courses c ON a.course_id = c.id
       WHERE a.student_id = ?
       ORDER BY c.code`,
      [req.session.studentId]
    );
    res.render('attendance', { rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading attendance.');
  }
});

module.exports = router;
