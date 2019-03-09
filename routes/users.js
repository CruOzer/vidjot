const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');

// Load User model
require('../models/User');
const User = mongoose.model('users');

// User Login Route
router.get('/login', (req, res) => {
    res.render('users/login');
});

// User register Route
router.get('/register', (req, res) => {
    res.render('users/register');
});

// Login Form POST
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Register form POST
router.post('/register', (req, res) => {
    let errors = [];
    if (!req.body.name) {
        errors.push({
            text: 'Please add a name'
        });
    }
    if (!req.body.email) {
        errors.push({
            text: 'Please add an email'
        });
    }
    if (!req.body.password) {
        errors.push({
            text: 'Please add a password'
        });
    }
    if (!req.body.password2) {
        errors.push({
            text: 'Please confirm password'
        });
    }

    if (req.body.password != req.body.password2) {
        errors.push({
            text: 'Passwords do not match'
        });
    }

    if (req.body.password.length < 4) {
        errors.push({
            text: 'Password must be at least 4 characters'
        });
    }

    if (errors.length > 0) {
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            password2: req.body.password2
        });
    } else {
        User.findOne({
            email: req.body.email
        }).then(user => {
            if (user) {
                req.flash('error_msg', 'Email already registered');
                res.render('users/register', {
                    errors: errors,
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    password2: req.body.password2
                });
            } else {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });
                bcrypt.genSalt(10).then(salt => {
                    bcrypt.hash(newUser.password, salt).then(hash => {
                        newUser.password = hash;
                        newUser.save().then(user => {
                            req.flash('success_msg', 'You are now registered and can log in');
                            res.redirect('/users/login');
                        }).catch(err => {
                            console.log('Error Save: ' + err);
                            return;
                        });
                    }).catch(err => {
                        console.log('Error hash: ' + err);
                        return;
                    });
                }).catch(err => {
                    console.log('Error genSalt: ' + err);
                    return;
                });
            }

        });
    }
});

// Logout user
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;