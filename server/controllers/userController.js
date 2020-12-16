var user = require('../models/User');
var bcrypt = require('bcryptjs');
const saltRounds = 12;

//
exports.getSelf = function(req, res, next) {
    console.log("GET SELF PARAMS ID: "+req.params.id);

    user.findById({'_id':req.params.id}, function (err, user) {
        if (err) return res.status(500).json({err});
        if (!user) return res.status(404).json({message:'User not found!'});
        res.status(200).json(user);
    });
};

//Store user credentials and use bcrypt to hash the password.
exports.createUser = function(req, res, next) {
    console.log(req.body);

    if (req.body.fakeCreditCard && req.body.name && req.body.password && req.body.email ) {

        var password = req.body.password;

        bcrypt.hash(password, saltRounds, function(err, hash) {
            if (err) {
                console.log(err);
                return res.status(500).json(err);//Internal Error
            }

            var newUser = new user({
                name: req.body.name,
                fakeCreditCard: req.body.fakeCreditCard,
                email: req.body.email,
                password: hash
            });

            newUser.save(function(err, result) {
                if (err) {
                    console.log(err);
                    return res.status(400).json(err); //Validation Error
                }
                console.log("Inserted 1 document into the collection");
                res.status(201).json({
                    success: true,
                    message: 'Registration Successful!'
                });//Success
            });
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'Please fill all the fields!'
        });
    }
};

exports.modifyEmail = function(req, res, next)  {
    var email=req.body.email;
    console.log("USER EMAIL CHANGE REQUEST: "+req.body.email);

    //for update validation
    var opts = { runValidators: true, context: 'query'};
    user.updateOne({_id : req.params.id}, { email: email}, opts, function (err, user) {
        if (err) {
            res.status(400).json(err);
            return console.error(err);
        }
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        } else {
            res.status(200).json({
                email: email,
                success: true,
                message: 'Email was successfully changed!'
            });
        }
    });
};

exports.modifyUsername = function(req, res, next)  {
    var name=req.body.name;
    console.log("USER NAME CHANGE REQUEST: "+req.body.name);

    //for update validation
    var opts = { runValidators: true };
    user.updateOne({_id : req.params.id}, { name: name}, opts, function (err, user) {
        if (err) {
            res.status(400).json(err);
            return console.error(err);
        }
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        } else {
            res.status(200).json({
                name: name,
                success: true,
                message: 'Username was successfully changed!'
            });
        }
    });
};

exports.modifyCreditCard = function(req, res, next)  {
    var fcc=req.body.fakeCreditCard;
    console.log("USER CREDIT CARD CHANGE REQUEST: "+fcc);

    //for update validation
    var opts = { runValidators: true };
    user.updateOne({_id : req.params.id}, { fakeCreditCard: fcc}, opts, function (err, user) {
        if (err) {
            res.status(400).json(err);
            return console.error(err);
        }
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        } else {
            res.status(200).json({
                fakeCreditCard: fcc,
                success: true,
                message: 'Credit Card was successfully changed!'
            });
        }
    });
};

exports.modifyPassword = function(req, res, next)  {
    console.log(req.body);

    var password = req.body.password;

    bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) {
            res.status(500).json(err);
            return console.error(err);
        }

        //for update validation
        var opts = {runValidators: true};
        user.updateOne({_id: req.params.id}, {password: hash}, opts, function (err, user) {
            if (err) {
                res.status(400).json(err);
                return console.error(err);
            }
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found!'
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: 'Password was successfully changed!'
                });
            }
        });
    });
};

exports.deleteSelf = function(req, res, next)  {
    user.findByIdAndDelete(req.params.id,function (err, user) {
        if (err) {
            res.sendStatus(400);
            return console.error(err);
        }
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        } else {
            res.status(200).json({
                success: false,
                message: 'Delete was successful!'
            });
        }
    })
};

//helper function to add days into date object
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

exports.extendMembership = function(req, res, next)  {
    console.log("EXTEND MEMBERSHIP REQ PARAMS ID: "+req.params.id);
    var updateObj={};
    user.findById(req.params.id, 'membership_valid', function (err, result) {
        if (err) {
            res.json(err.message).status(404);//database error / not found
        }
        console.log("Result: "+result);
        var expireDate = new Date(result.membership_valid);
        updateObj={membership_valid: expireDate.addDays(30)};

        console.log("NEW EXPIRE DATE: "+expireDate);
        //update with validate
        user.findOneAndUpdate({_id: req.params.id}, updateObj, { runValidators: true , new:true}, function (err, result) {
            if (err) {
                res.json(err.message).status(404);//database error / not found
            }
            else {
                return res.json(result).status(200);//Success
            }
        });
    });
};