const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayout = require('express-ejs-layouts')
const fileUpload = require('express-fileupload');
const userRouter = require('./routes/user');
const admin2Router = require('./routes/admin2');
const session = require('express-session')
const mongodbStore = require('connect-mongodb-session')(session)
const auth = require('./Controller/auth');
require('dotenv').config


const app = express();

const admin = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayout)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public-admin')));
app.use(express.static(path.join(__dirname, 'public/adminFiles')));

const store = new mongodbStore({
  uri: process.env.MONGODBURL,
  databaseName: 'Ecommerce',
  collection: 'mySession'
})

app.use(fileUpload())

app.use(function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

app.use((session({
  secret:'KeyProject1',
  store:store,
  saveUninitialized:true,
  resave:true
})))

//Header Cache remover


app.use(auth.authInit);

app.use('/', userRouter);
// app.use('/admin_panel', adminRouter);


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
  res.render('error',{layout:'error-layout'});
});



//AdminPORT


admin.set('views', path.join(__dirname, 'views'));
admin.set('view engine', 'ejs');
admin.use(expressLayout)

// admin.use(logger('dev'));
admin.use(express.json({ limit: '10mb' }));
admin.use(express.urlencoded({limit: '10mb',
extended: true}));
admin.use(cookieParser());
admin.use(express.static(path.join(__dirname, 'public-admin')));
admin.use(express.static(path.join(__dirname, 'public')));
admin.use(fileUpload())

admin.use(function (req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

admin.use((session({
  secret:'KeyProject1',
  store:store,
  saveUninitialized:true,
  resave:true
})))

//Header Cache remover


admin.use(auth.authInit2);

admin.use('/admin', admin2Router);


// catch 404 and forward to error handler
admin.use(function(req, res, next) {
  next(createError(404));
});

// error handler
admin.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{layout:'error-layout'});
});

admin.listen(8080)

module.exports = app;

