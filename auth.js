const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /login - show login form
router.get('/login', (req, res) => {
  if (req.session && req.session.studentId) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

// POST /login - check credentials
router.post('/login', async (req, res) => {
  const { student_id, password } = req.body;

  if (!student_id || !password) {
    return res.render('login', { error: 'Please enter both Student ID and password.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE student_id = ?',
      [student_id]
    );

    if (rows.length === 0) {
      return res.render('login', { error: 'No account found with that Student ID.' });
    }

    const student = rows[0];
    const match = await bcrypt.compare(password, student.password);

    if (!match) {
      return res.render('login', { error: 'Incorrect password.' });
    }

    req.session.studentId = student.id;
    req.session.studentName = student.name;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Something went wrong. Please try again.' });
  }
});

// GET /register - show sign-up form
router.get('/register', (req, res) => {
  if (req.session && req.session.studentId) {
    return res.redirect('/dashboard');
  }
  res.render('register', { error: null, form: {} });
});

// POST /register - create a new student account
router.post('/register', async (req, res) => {
  const { student_id, name, email, password, confirm_password, department, semester, phone } = req.body;
  const form = { student_id, name, email, department, semester, phone };

  if (!student_id || !name || !email || !password || !confirm_password) {
    return res.render('register', {
      error: 'Please fill in Student ID, Name, Email, and both password fields.',
      form
    });
  }

  if (password !== confirm_password) {
    return res.render('register', {
      error: 'Passwords do not match.',
      form
    });
  }

  if (password.length < 6) {
    return res.render('register', {
      error: 'Password must be at least 6 characters.',
      form
    });
  }

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM students WHERE student_id = ? OR email = ?',
      [student_id, email]
    );

    if (existing.length > 0) {
      return res.render('register', {
        error: 'An account with that Student ID or Email already exists.',
        form
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO students (student_id, name, email, password, department, semester, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, name, email, hashedPassword, department || null, semester || null, phone || null]
    );

    req.session.studentId = result.insertId;
    req.session.studentName = name;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('register', {
      error: 'Something went wrong creating your account. Please try again.',
      form
    });
  }
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
