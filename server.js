require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing + static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sessions (simple in-memory store - fine for a student project / local testing)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 4 } // 4 hours
}));

// Make the logged-in student's name available to every view (for the nav bar)
app.use((req, res, next) => {
  res.locals.studentName = req.session.studentName || null;
  next();
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/dashboard'));
app.use('/', require('./routes/profile'));
app.use('/', require('./routes/courses'));
app.use('/', require('./routes/attendance'));
app.use('/', require('./routes/results'));
app.use('/', require('./routes/materials'));
app.use('/', require('./routes/assignments'));
app.use('/', require('./routes/payments'));
app.use('/', require('./routes/notices'));
app.use('/', require('./routes/feedback'));

// 404
app.use((req, res) => {
  res.status(404).send('Page not found.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`UNIONE Student Portal running at http://localhost:${PORT}`);
});
