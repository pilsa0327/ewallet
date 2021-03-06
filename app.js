const createError = require('http-errors');
const express = require('express');
const path = require('path');
const indexRouter = require('./routes/index');
const mainRouter = require('./routes/main');
const createRouter = require('./routes/create');
const privateRouter = require('./routes/privatekey');
const sendRouter = require('./routes/send');
const db = require('./databases/db')
const logger = require('morgan');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session)
const app = express();

app.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore(db.info)
}))

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));

app.use('/', indexRouter);
app.use('/main', mainRouter);
app.use('/create', createRouter);
app.use('/privatekey', privateRouter);
app.use('/send', sendRouter);

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
