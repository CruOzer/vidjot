const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Load idea Model
require('../models/Idea');
const Idea = mongoose.model('ideas');

// Idea index page
router.get('/', (req, res) => {
    Idea.find({
        user: req.user.id
    }).sort({
        date: 'desc'
    }).then(ideas => {
        res.render('ideas/index', {
            ideas: ideas
        });
    });
});

// Add Idea form
router.get('/add', (req, res) => {
    res.render('ideas/add');
});

// Edit Idea form
router.get('/edit/:id', (req, res) => {
    Idea.findOne({
        _id: req.params.id,
        user: req.user.id
    }).then(idea => {
        if (idea) {
            res.render('ideas/edit', {
                idea: idea
            });
        } else {
            req.flash('error_msg', 'Idea could not be loaded')
            res.redirect('/ideas');
        }
    });
});

// Add Process form
router.post('/', (req, res) => {
    let errors = [];
    if (!req.body.title) {
        errors.push({
            text: 'Please add a title'
        });
    }
    if (!req.body.details) {
        errors.push({
            text: 'Please add some details'
        });
    }
    if (errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        const newUser = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        }
        new Idea(newUser).save()
            .then(idea => {
                req.flash('success_msg', 'Video idea added');
                res.redirect('/ideas');
            })
            .catch(error => {
                console.log(error);
                res.send('error');
            })

    }
});

// Edit Process form
router.put('/:id', (req, res) => {
    let errors = [];
    if (!req.body.title) {
        errors.push({
            text: 'Please add a title'
        });
    }
    if (!req.body.details) {
        errors.push({
            text: 'Please add some details'
        });
    }

    Idea.findOne({
        _id: req.params.id,
        user: req.user.id
    }).then(idea => {
        // new values
        idea.title = req.body.title;
        idea.details = req.body.details;
        if (errors.length > 0) {
            res.render('ideas/edit', {
                errors: errors,
                idea: idea
            });
        } else {
            idea.save().then(idea => {
                req.flash('success_msg', 'Video idea updated');
                res.redirect('/ideas');
            });
        }
    });
});

// Delete idea
router.delete('/:id', (req, res) => {
    Idea.deleteOne({
        _id: req.params.id,
        user: req.user.id
    }).then(() => {
        req.flash('success_msg', 'Video idea removed');
        res.redirect('/ideas');
    });
});

module.exports = router;