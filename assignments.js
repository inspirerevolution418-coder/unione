const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pool = require('../config/db');
const { requireLogin } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'assignments');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB cap
});

// GET /assignments - submission form + list of the student's past submissions
router.get('/assignments', requireLogin, async (req, res) => {
  try {
    const [courses] = await pool.execute('SELECT * FROM courses ORDER BY code');
    const [submissions] = await pool.execute(
      `SELECT a.*, c.code AS course_code, c.name AS course_name
       FROM assignments a JOIN courses c ON a.course_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.submission_date DESC`,
      [req.session.studentId]
    );
    res.render('assignments', { courses, submissions, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading assignments page.');
  }
});

// POST /assignments - handle submission
router.post('/assignments', requireLogin, upload.single('file'), async (req, res) => {
  try {
    const { assignment_name, course_id } = req.body;

    if (!assignment_name || !course_id || !req.file) {
      const [courses] = await pool.execute('SELECT * FROM courses ORDER BY code');
      const [submissions] = await pool.execute(
        `SELECT a.*, c.code AS course_code, c.name AS course_name
         FROM assignments a JOIN courses c ON a.course_id = c.id
         WHERE a.student_id = ? ORDER BY a.submission_date DESC`,
        [req.session.studentId]
      );
      return res.render('assignments', {
        courses,
        submissions,
        error: 'Please fill in the assignment name, choose a course, and select a file.'
      });
    }

    await pool.execute(
      `INSERT INTO assignments (student_id, course_id, assignment_name, filename, original_name)
       VALUES (?, ?, ?, ?, ?)`,
      [req.session.studentId, course_id, assignment_name, req.file.filename, req.file.originalname]
    );

    res.redirect('/assignments');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error submitting assignment.');
  }
});

module.exports = router;
