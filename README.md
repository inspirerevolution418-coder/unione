# UNIONE Student Portal

A combined Student Portal + BLC (course materials / assignments) + OneCard
(simulated payments) web app, built with **Node.js, Express, EJS, and MySQL**.

## What's included

- **Student Portal:** Dashboard, Profile, Courses, Attendance, Results
- **BLC:** Course Materials (browse/download), Assignment Submission (file upload)
- **OneCard:** Simulated tuition due + "Pay Now" + payment history (no real gateway)
- **Notices** and **Feedback**
- Session-based login (bcrypt-hashed passwords)
- 9 MySQL tables: `students`, `courses`, `attendance`, `results`, `materials`,
  `assignments`, `payments`, `notices`, `feedback`

## Setup (in VS Code)

1. **Install MySQL** locally if you don't have it (or use XAMPP's MySQL, or MySQL Workbench).
2. **Open this folder in VS Code**, then open the integrated terminal.
3. **Install dependencies:**
   ```
   npm install
   ```
4. **Create the database tables:**
   ```
   mysql -u root -p < db/schema.sql
   ```
   (enter your MySQL root password when prompted)
5. **Configure environment variables:**
   ```
   cp .env.example .env
   ```
   Then open `.env` and set `DB_PASSWORD` to your MySQL password (and `DB_USER` if not `root`).
6. **Seed sample data** (creates the demo student, courses, attendance, results,
   materials, payment history, notices, and feedback):
   ```
   npm run seed
   ```
7. **Run the app:**
   ```
   npm run dev
   ```
   (uses nodemon, so it restarts on save — or use `npm start` for a plain run)
8. Open **http://localhost:3000** in your browser.

### Demo login
- **Student ID:** `221-15-4567`
- **Password:** `password123`

## Project structure

```
student-portal/
├── server.js              # app entry point
├── config/db.js           # MySQL connection pool
├── db/
│   ├── schema.sql         # table definitions (run this first)
│   └── seed.js            # sample data + bcrypt-hashed demo password
├── middleware/auth.js      # requireLogin guard
├── routes/                # one file per section (auth, dashboard, courses, ...)
├── views/                 # EJS templates
│   └── partials/          # shared header/footer/nav
└── public/
    ├── css/style.css
    └── uploads/
        ├── materials/     # course material files (3 placeholder PDFs included)
        └── assignments/   # student-submitted files land here
```

## Notes

- The **OneCard payment section is a simulation only** — clicking "Pay Now" writes
  a row directly to the `payments` table. No payment gateway is contacted.
- The 3 seeded materials are **placeholder PDFs** (`public/uploads/materials/`).
  Replace them with your real lecture files and update the `filename` /
  `original_name` columns in the `materials` table (or re-run a modified seed).
- Sessions are stored in memory, which is fine for local testing/coursework but
  will reset if the server restarts (everyone gets logged out).
- There's no teacher-side review flow for assignments, per the requirements —
  submissions are just stored with filename + submission date.

## Suggested one-day build order (matches the original plan)

| Block | Tasks |
|---|---|
| Morning | `db/schema.sql`, `routes/auth.js`, `middleware/auth.js`, `views/login.ejs` |
| Afternoon | Dashboard, Courses, Attendance, Results routes + views |
| Evening | Materials, Assignments (multer upload) |
| Night | Payments (simulated), Notices, Feedback, final CSS pass |
