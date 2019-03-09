const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const passport = require('passport');

const app = express();

// Load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Passport Config
require('./config/passport')(passport);
// DB Config
const db = require('./config/database');
// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose.connect(db.mongoURI, {
        // useNewUrlParser: true        
        useMongoClient: true
    })
    .then(() => {
        console.log('MongoDB connected...');
    })
    .catch((err) => {
        console.log('MongoDB connection failure: ' + err);
    });

// Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// parse application/json
app.use(bodyParser.json());

// Method-Override Middleware
// override with the X-HTTP-Method-Override header in the request
//app.use(methodOverride('X-HTTP-Method-Override'));
app.use(methodOverride('_method'));

// Flash Middleware
app.use(flash());

// Session Middleware
app.use(session({
    secret: 'mysecret',
    resave: true,
    saveUninitialized: true
}));

// Passport Sessions AFTER Session middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// How middleware works
// app.use(function (req, res, next) {    
//     req.name = 'Christian Kost';
//     next();
// });

// caching disabled for every route
app.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

// Index Route
app.get('/', (req, res) => {
    //console.log(req.name);
    const title = 'Welcome';
    res.render('index', {
        title: title
    });
});

// About page
app.get('/about', (req, res) => {
    res.render('about');
});


const {
    ensureAuthenticated
} = require('./helpers/auth');


// Use routes
app.use('/ideas', ensureAuthenticated, ideas);
app.use('/users', users);

const port = process.env.port || 5000;

app.listen(port, () => {
    console.log(`Server startet on ${port}`);
});