var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
require('./authenticate')(passport);
var config = require('./config');

var index = require('./routes/index');
var users = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var leaderRouter = require('./routes/leaderRouter');
var promotionRouter = require('./routes/promotionRouter');
var uploadRouter = require('./routes/uploadRouter');

//init routers, pass initialized authentication objects 
//to them so that they can verify authentication tokens
//prior to allowing the user to access particular routes
users.init(passport);
dishRouter.init(passport);
leaderRouter.init(passport);
promotionRouter.init(passport);
uploadRouter.init(passport);

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const Dishes = require('./models/dishes');

// Connection URL
const url = config.mongoUrl;
const connect = mongoose.connect(url, { });

connect.then(
  ()    => {console.log("Connected correctly to mongo server");}, 
  (err) => { console.log(err); }
);

var app = express();

// Secure traffic only
app.all('*', (req, res, next) => {
  if (req.secure) {
    console.log('req is secure!');
    console.log('https://' + req.hostname + ':' + req.protocol + ' '+ req.url);
    return next();
  }
  else {
    console.log('redirecting request to https...');
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890-09876-54321'));

//not used any more with token based authentication
/*app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));*/

app.use(passport.initialize());
//not used any more with token based authentication
//app.use(passport.session());



app.use('/', index);
app.use('/users', users.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/dishes', dishRouter.router);
app.use('/leaders', leaderRouter.router);
app.use('/promotions', promotionRouter.router);
app.use('/imageUpload', uploadRouter.router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
