const express = require('express');
const router = express.Router();
const path = require('path');
const pool = require('../config/db');
const { requireLogin } = require('../middleware/auth');

// GET /materials - grouped by course, e.g.
//   Desktop & Web Programming -> Lecture 1.pdf, Lecture 2.pdf
//   Operating System -> Chapter 1.pdf
router.get('/materials', requireLogin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT m.*, c.name AS course_name, c.code AS course_code
       FROM materials m JOIN courses c ON m.course_id = c.id
       ORDER BY c.name, m.uploaded_at`
    );

    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.course_name]) grouped[row.course_name] = [];
      grouped[row.course_name].push(row);
    }

    res.render('materials', { grouped });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading materials.');
  }
});

// GET /materials/download/:id - serve the file for download
router.get('/materials/download/:id', requireLogin, async (req, res) => {
  try {
    const [[material]] = await pool.execute(
      'SELECT * FROM materials WHERE id = ?',
      [req.params.id]
    );
    if (!material) return res.status(404).send('File not found.');

    const filePath = path.join(__dirname, '..', 'public', 'uploads', 'materials', material.filename);
    res.download(filePath, material.original_name, (err) => {
      if (err) {
        console.error(err);
        if (!res.headersSent) res.status(404).send('File not found on server.');
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error downloading file.');
  }
});

module.exports = router;
