var User = require('../models/User');

//list of all users.
exports.listUsers = function(req, res, next) {
    User.find(function(err, users) {
        if (err) {
            res.sendStatus(500);
            return console.error(err);
        }
        if (!users) {
            res.sendStatus(404)}
        else {
            res.status(200);
            res.json(users);
        }
    })
};

exports.changeUserRole = function(req, res, next)  {
    var role=req.body.role;

    console.log("ADMIN REQUEST PARAMS: "+req.params.id);

    //for update validation
    var opts = { runValidators: true };
    User.updateOne({_id : req.params.id}, { role: role }, opts, function (err, user) {
        if (err) {
            res.status(400).json(err);
            return console.error(err);
        }
        if (!user) {
            res.sendStatus(404)
        } else {
            res.status(200);
            res.json(user);
        }
    })
};

exports.getUser = function(req, res, next) {
    User.findById({'_id':req.params.id}, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        res.status(200);
        res.json(user);
    })
};

exports.deleteUser = function(req, res, next) {
    console.log("PARAMS: "+req.params);

    User.findByIdAndDelete(req.params.id,function (err, user) {
        if (err) {
            res.sendStatus(404);
            return console.error(err);
        }
        if (!user) {
            res.sendStatus(404);
        } else {
            res.status(200);
            res.json(user);
        }
    })
};