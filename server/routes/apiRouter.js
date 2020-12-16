var express = require('express');
var router = express.Router();
var adminController = require('../controllers/adminController');
var userController = require('../controllers/userController');
var authController = require('../controllers/authController');

router.get('/', function (req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken(),{ expires: new Date(Date.now() + 60*60*1000)});
    res.sendStatus(200);
});


router.post('/login', authController.reactLogin);

router.post('/users', userController.createUser);

//for users jwt token

router.get('/users/:id', authController.ensureToken, userController.getSelf);

router.patch('/users/:id/membership', authController.ensureToken, userController.extendMembership);

router.put ('/users/:id/email', authController.ensureToken, userController.modifyEmail);

router.put ('/users/:id/name', authController.ensureToken, userController.modifyUsername);

router.put ('/users/:id/password', authController.ensureToken,  userController.modifyPassword);

router.put ('/users/:id/fcc', authController.ensureToken,  userController.modifyCreditCard);

router.delete('/users/:id', authController.ensureToken,  userController.deleteSelf);

//These routes are only for admins with jwt token

router.get('/admin/users/:id',  authController.isAdmin, adminController.getUser);

router.put('/admin/users/:id/role', authController.isAdmin, adminController.changeUserRole);

router.get('/admin/users', authController.isAdmin, adminController.listUsers);

router.delete('/admin/users/:id',  authController.isAdmin, adminController.deleteUser);


module.exports = router;