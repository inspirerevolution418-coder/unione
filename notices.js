const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireLogin } = require('../middleware/auth');

// GET /notices - university notices, newest first
router.get('/notices', requireLogin, async (req, res) => {
  try {
    const [notices] = await pool.execute(
      'SELECT * FROM notices ORDER BY posted_date DESC'
    );
    res.render('notices', { notices });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading notices.');
  }
});

module.exports = router;
