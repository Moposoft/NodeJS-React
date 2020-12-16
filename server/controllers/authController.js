const user = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

//The View login authentication
exports.login = function(req, res, next)  {
    console.log("LOGIN: email: " +req.body.email +" password: "+req.body.password);

    if (req.body.email && req.body.password) {

        //sanitize user input
        var email= req.sanitize(req.body.email);
        var password= req.sanitize(req.body.password);

        user.findOne({
            email: email
        }, function(err, user) {
            if (err) {
                console.error(err);
                res.sendStatus(500);// database error
            }
            if (user) {
                bcrypt.compare(password, user.password, function(err, result) {
                    if (result) {
                        console.log("USER FOUND: "+user);

                        //for api routes jwt token. has the users role
                        var token = jwt.sign({role: user.role}, config.jwtSecret, {
                            expiresIn: '1h' // expires in 1 hour
                        });
                        //session is used for normal page views for access to api save token to session.
                        req.session.user = user;
                        req.session.token = token;
                        res.status(200).redirect('/');
                    } else {
                        res.sendStatus(401);//passwords dont match
                    }
                });
            }
            else res.sendStatus(404); //user not found
        });
    } else {
        res.sendStatus(400);//invalid request
    }
};

//The React login authentication
exports.reactLogin = function(req, res, next)  {
    console.log("LOGIN: email: " +req.body.email +" password: "+req.body.password);

    if (req.body.email && req.body.password) {

        //sanitize user input against injections
        var email= req.sanitize(req.body.email);
        var password= req.sanitize(req.body.password);

        user.findOne({
            email: email
        }, function(err, user) {
            if (err) {
                console.error(err);
                res.sendStatus(401);// database error
            }
            if (user) {
                bcrypt.compare(password, user.password, function(err, result) {
                    if (result) {
                        console.log("USER FOUND: "+user);

                        //for api access jwt token is given. it has the users role
                        var token = jwt.sign({role: user.role}, config.jwtSecret, {
                            expiresIn: '1h' // expires in 1 hour
                        });
                        res.cookie('JWT-TOKEN', token,{ expires: new Date(Date.now() + 60*60*1000)});
                        res.status(200).json({
                            userID: user._id,
                            token
                        });
                    } else {
                        res.status(401).json({
                            success: false,
                            token: null,
                            err: 'Username or password is incorrect'
                        });
                    }
                });
            }
            else res.sendStatus(404); //user not found
        });
    } else {
        res.sendStatus(401);//invalid request
    }
};

//check token for user api routes
module.exports.ensureToken = function(req, res, next) {
    console.log("HEADERS: "+req.headers["authorization"]);
    var token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);//no token

    jwt.verify(token, config.jwtSecret, function (err, decoded) {
        if (err) {
            res.sendStatus(403);// token expired or invalid
        } else {
            return next();//All clear!
        }
    });
};

//check token for admin api routes
module.exports.isAdmin = function(req, res, next) {

    //if session
    if (req.session.token){
        const token = req.session.token;
        jwt.verify(token, config.jwtSecret, function (err, decoded) {
            if (err) {
                console.log(err);
                return res.status(403).send(err);// token expired or invalid
            } else {
                if (decoded.role===2)//ADMIN
                    next();//All clear!
            }
        });

        //try to get token from header
    } else {
        console.log("HEADERS: "+req.headers["authorization"]);
        var token = req.headers['authorization'];
        if (!token) return res.sendStatus(401);//no token

        jwt.verify(token, config.jwtSecret, function (err, decoded) {
            if (err) {
                res.sendStatus(403);// token expired or invalid
            } else {
                if (decoded.role===2)//ADMIN
                    next();//All clear!
            }
        });
    }
};