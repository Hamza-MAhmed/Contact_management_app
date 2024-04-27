var createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const popup = require('node-popup');
require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter  = require('./routes/user');
const contactRouter = require('./routes/contact');
const {connectDB , userModel} = require('./db/users');
const contact_model = require('./db/contacts');
connectDB();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(userModel.serializeUser()); //encrypt
passport.deserializeUser(userModel.deserializeUser()); //decrypt
// passport.serializeUser(contact_model.serializeUser()); //encrypt
// passport.deserializeUser(contact_model.deserializeUser()); //decrypt

// other middleware setup...

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
app.use('/user', usersRouter.router); // Make sure to prefix with '/user' for usersRouter
app.use('/contact' , contactRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).send('Not Found');
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
