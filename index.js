const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs'); // Import bcryptjs
const db = require('./db');
const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Set view engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const employeeRoutes = require('./routes/employees');
app.use('/employees', employeeRoutes);

// Login route
app.get('/login', (req, res) => {
    res.render('auth/login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password); // Compare password
            if (isMatch) {
                req.session.user = user;
                res.redirect('/employees');
            } else {
                res.render('auth/login', { error: 'Invalid credentials' });
            }
        } else {
            res.render('auth/login', { error: 'Invalid credentials' });
        }
    });
});

app.get('/register', (req, res) => {
    res.render('auth/register', { error: null });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.render('auth/register', { error: 'Username already taken' });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
            db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
                if (err) throw err;
                res.redirect('/login');
            });
        }
    });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/employees');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Redirect to login if not authenticated
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
