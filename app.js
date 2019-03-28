const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const mongoose = require('mongoose');
mongoose.connect('mongodb://dbuser:password4db@ds117960.mlab.com:17960/mongo-session', (err) => {
  if (err) throw new Error(err);
  console.log('connected successfully');
});

/**
 mongoose.connect('mongodb://localhost:27017/<database-name>', (err) => {
    if (err) throw new Error(err);
    console.log('connected successfully');
  });
 */

const users = require('./database/schemas/users');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');

const app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

app.post('/save-users', (request, response) => {
  const document = request.body;
  const userInstance = new users(document);
  userInstance.save((err,doc) => {
    if(err) throw new Error(err);
    response.json(doc);
  })
});

app.get('/fetch-users', (request, response, next) => {
  // users.find(match,fetch,options,callback)
  users.find({},null,{lean: true},(err, docs) => {
    if(err) throw new Error(err);
    request.mongoObj = docs;
    next();
  })
}, (req, res) => {
  let allUsers = req.mongoObj;
  allUsers = allUsers.map(adhoc => {
    delete adhoc.__v;
    return adhoc;
  })
  res.json(allUsers);
});

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
