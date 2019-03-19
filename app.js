var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var index = require('./routes/index');
var users = require('./routes/users');
var config = require(path.resolve('.', 'config.js'))


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
//log all the requests
app.use(morgan('combined'))


if(config.ADAPTER.FACEBOOK.ENABLED&&(config.ADAPTER.FACEBOOK.ENABLED==true||config.ADAPTER.FACEBOOK.ENABLED==1||config.ADAPTER.FACEBOOK.ENABLED=='true')){
  //facebook is enabled, setup and listen to the bot
  var fb_apiLayer=require(path.resolve('.','modules/facebook/apiLayer.js'));
  //setup routers
  app.use(fb_apiLayer);
  }
  
  if(config.ADAPTER.TELEGRAM.ENABLED&&(config.ADAPTER.TELEGRAM.ENABLED==true||config.ADAPTER.TELEGRAM.ENABLED==1||config.ADAPTER.TELEGRAM.ENABLED=='true')){
    //telegram is enabled,setup and listen to the bot
    var telegramController=require(path.resolve('.','modules/telegram/controller.js'));
  }

  if(config.ADAPTER.ALEXA.ENABLED&&(config.ADAPTER.ALEXA.ENABLED==true||config.ADAPTER.ALEXA.ENABLED==1||config.ADAPTER.ALEXA.ENABLED=='true')){
    //alexa is enabled,setup and listen to the bot
    var alexa_apiLayer=require(path.resolve('.','modules/alexa/apiLayer.js'));
    //setup routers
    app.use(alexa_apiLayer);
  }

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
