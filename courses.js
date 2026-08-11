const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireLogin } = require('../middleware/auth');

// GET /courses - list courses the student has attendance/result records for
router.get('/courses', requireLogin, async (req, res) => {
  try {
    const [courses] = await pool.execute(
      `SELECT DISTINCT c.* FROM courses c
       JOIN attendance a ON a.course_id = c.id
       WHERE a.student_id = ?
       ORDER BY c.code`,
      [req.session.studentId]
    );
    res.render('courses', { courses });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading courses.');
  }
});

module.exports = router;
