var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');
var indexController = require('../controllers/indexController');

router.post('/login', authController.login);

//these routes use session verification

router.get('/', indexController.renderHome);

router.post('/users', indexController.createUser);

router.post('/modify', indexController.updateUser );

router.get('/unregister', indexController.deleteUser);

router.get('/payment', indexController.payMembership);

router.get('/user', indexController.renderUser);

router.get('/admin', indexController.renderAdmin);

//too simple for controllers

router.get('/login',(req, res) => res.render('home', {
  title: 'Login to Hell!',
  layout: 'main',
  login: true,
  csrfToken: req.csrfToken()
}));

router.get('/register', (req, res) => res.render('home', {
  title: 'Register to Hell!',
  layout: 'main',
  register: true,
  csrfToken: req.csrfToken()
}));

router.get('/logout', function(req, res) {
  req.session.token = null;
  req.session.user = null;
  req.session.destroy(function(err) {
  });
  res.redirect('/');
});


module.exports = router;
