var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express3-handlebars');
     passport= require('passport');
var mongo = require('mongoskin');
var dbUrl = "mongodb://localhost:27017/uberlikedb";
db = mongo.db(dbUrl);
var routes = require('./routes/index');
// var users = require('./routes/users');
var passengers = require('./routes/passengers');
var drivers = require('./routes/drivers');
var login = require('./Services/login');

//mail = require("./routes/mail");
//message = require('./routes/message');

email = require("./Services/email");
sms = require("./Services/sms");

app = express();



// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');
app.engine('hbs', exphbs({
  defaultLayout : 'main'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(allowCrossDomain);
app.use(passport.initialize());
app.use(passport.session());

//app.engine('hbs',exphbs({defaultLayout: 'main'}));
/*var hbs = exphbs.create({
    defaultLayout: 'main'
});*/

//console.log(Math.random().toString(36).substr(2,4));
	
app.use('/', routes);
app.use('/',login);
// app.use('/users', users);
app.use('/drivers',drivers);
app.use('/passengers',passengers);

function renderApp(templName,templObj,callback){
  app.render(templName,templObj,callback);
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log(err.message);
    console.log(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
