var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const passport = require('passport');
dotenv.config();

var app = express();

// Prepare for Mongoose 7
mongoose.set('strictQuery', false)
// Define databse URL to connect to 
const mongoDB = process.env.URI;
// Wait for database to connect, logging an error if there is a problem 
main().catch(err => console.log(err));

// Set options to use the new connection string parser and the new unified topology engine when connecting to the MongoDB server.
async function main() {
  await mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}
mongoose.Promise = global.Promise;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const indexRouter = require('./routes/index'  );
const usersRouter = require('./routes/users'  );
const signUp      = require('./routes/sign-up');

app.use('/',        indexRouter);
app.use('/users',   usersRouter);
app.use('/sign-up', signUp     );

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
