const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireLogin } = require('../middleware/auth');

// GET /results
router.get('/results', requireLogin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.code, c.name, r.semester, r.grade, r.gpa
       FROM results r JOIN courses c ON r.course_id = c.id
       WHERE r.student_id = ?
       ORDER BY c.code`,
      [req.session.studentId]
    );

    const totalGpa = rows.reduce((sum, r) => sum + Number(r.gpa || 0), 0);
    const avgGpa = rows.length ? (totalGpa / rows.length).toFixed(2) : '0.00';

    res.render('results', { rows, avgGpa });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading results.');
  }
});

module.exports = router;
