const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load user model
require('../models/User');
const User = mongoose.model('users');

module.exports = function (passport) {
    passport.use(new LocalStrategy({
        usernameField: 'email'
    }, (email, password, done) => {
        // Match user
        User.findOne({
            email: email
        }).then(user => {

            if (!user) {
                return done(null, false, {
                    message: 'No User found.'
                });
            }

            // Match password
            bcrypt.compare(password, user.password).then(isMatch => {
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Password incorrect'
                    });
                }
            }).catch(err => {
                return done(err, false, {
                    message: err
                });
            });
        }).catch(err => {
            return done(err, false, {
                message: err
            });
        });

    }));


    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}