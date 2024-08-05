const express = require('express');
const router = express.Router();
const db = require('../db');
const isAuthenticated = require('../routes/auth');

router.get('/', isAuthenticated, (req, res) => {
    db.query('SELECT * FROM employees', (err, results) => {
        if (err) throw err;
        res.render('employees/index', { employees: results , user: req.session.user});
    });
});

router.get('/add', isAuthenticated, (req, res) => {
    res.render('employees/add' , { user: req.session.user });
});

router.post('/add', isAuthenticated, (req, res) => {
    const { name, position, department, email, salary } = req.body;
    db.query('INSERT INTO employees (name, position, department, email, salary) VALUES (?, ?, ?, ?, ?)', [name, position, department, email, salary], (err, results) => {
        if (err) throw err;
        res.redirect('/employees');
    });
});

router.get('/edit/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM employees WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        res.render('employees/edit', { employee: results[0] , user: req.session.user });
    });
});

router.post('/edit/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { name, position, department, email, salary } = req.body;
    db.query('UPDATE employees SET name = ?, position = ?, department = ?, email = ?, salary = ? WHERE id = ?', [name, position, department, email, salary, id], (err, results) => {
        if (err) throw err;
        res.redirect('/employees');
    });
});

router.get('/delete/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM employees WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        res.redirect('/employees');
    });
});

module.exports = router;