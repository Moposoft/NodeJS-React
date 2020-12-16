const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const hbs = require('express-hbs');
const bodyParser = require('body-parser');
const expressSanitizer = require('express-sanitizer');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const session = require('express-session');
const csrf = require('csurf');
const router  = require('./config/router');
const config = require('./config/config');
const PORT =  3000;

//mongoose config
mongoose.connect('mongodb://localhost/WWWProgramming');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
global.mongoose = mongoose;

// set up the Express App
const app = express();

//header prot
app.use(helmet());

//REACT version
app.use('/static', express.static(path.join(__dirname, '../public')));

//set up body-parser for app
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//cookie parser
app.use(cookieParser());

//Session
app.use(session({
  secret: 'youruniquesecret',
  name: 'youruniquename',
  cookie: {
    httpOnly: true, // minimize risk of XSS attacks by restricting the client from reading the cookie
    maxAge: 60*1000*60*24 // set cookie expiry length in ms
  }
}));

//Csrf
app.use(csrf({ cookie: true }));
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  res.status(403);
  res.send('CSRF token error')
});

//set up expressSanitizer for app
app.use(express.json());
app.use(expressSanitizer());

// set up handlebars
app.engine('hbs', hbs.express4({
  layoutsDir: __dirname + '/views/layout'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// caching disabled for every route
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

app.use('/', router);

app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
});
