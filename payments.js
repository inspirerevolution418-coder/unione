const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireLogin } = require('../middleware/auth');

const CURRENT_DUE_BASELINE = 20000; // fixed baseline, per requirements

// GET /payments - due amount + payment history
router.get('/payments', requireLogin, async (req, res) => {
  try {
    const studentId = req.session.studentId;

    const [history] = await pool.execute(
      'SELECT * FROM payments WHERE student_id = ? ORDER BY payment_date DESC',
      [studentId]
    );

    const totalPaid = history.reduce((sum, p) => sum + Number(p.amount), 0);
    const amountDue = Math.max(CURRENT_DUE_BASELINE - totalPaid, 0);

    res.render('payments', {
      amountDue,
      history,
      justPaid: req.query.success === '1'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading payment page.');
  }
});

// POST /payments/pay - "Pay Now" button. This is a SIMULATION only:
// no real payment gateway is contacted, it just writes a row to MySQL.
router.post('/payments/pay', requireLogin, async (req, res) => {
  try {
    const studentId = req.session.studentId;

    const [history] = await pool.execute(
      'SELECT * FROM payments WHERE student_id = ?',
      [studentId]
    );
    const totalPaid = history.reduce((sum, p) => sum + Number(p.amount), 0);
    const amountDue = Math.max(CURRENT_DUE_BASELINE - totalPaid, 0);

    if (amountDue <= 0) {
      return res.redirect('/payments');
    }

    await pool.execute(
      `INSERT INTO payments (student_id, amount, method, status) VALUES (?, ?, ?, ?)`,
      [studentId, amountDue, 'Simulated Payment', 'Success']
    );

    res.redirect('/payments?success=1');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing simulated payment.');
  }
});

module.exports = router;
