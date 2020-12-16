var user = require('../models/User');
var bcrypt = require('bcryptjs');
const saltRounds = 12;

//helper function to add days into date object
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

//home page
exports.renderHome = function(req, res, next) {
    console.log("SESSION USER: "+req.session.user);

    if (req.session.user){
        //tells users how long their membership is valid
        var date = new Date(req.session.user.membership_valid);
        var time=(date-Date.now())/(1000*60*60*24);
        res.render('home', {
            title: 'Welcome to Hell!',
            layout: 'main',
            user: req.session.user.name,
            time: time
        })
    } else {
        res.render('home', {
            title: 'Welcome to Hell!',
            layout: 'main',
            name: req.session.newUser
        });
        req.session.newUser=null;
    }
};

//actual payment is not implemented because credit cards are fake
//this only adds 30 days of membership
exports.payMembership = function(req, res, next) {
    console.log(req.session.user);


    if (req.session.user){
        var updateObj={};
        user.findById(req.session.user._id, 'membership_valid', function (err, result) {
            if (err) {
                res.send(err.message);
            }

            var expireDate = new Date(result.membership_valid);
            updateObj={membership_valid: expireDate.addDays(30)};

            console.log(expireDate);
            user.updateOne({ _id: req.session.user.id }, updateObj, { runValidators: true }, function (err) {
                if (err) {
                    res.send(err.message);
                }
                else {
                    req.session.user.membership_valid=updateObj.membership_valid;
                    return res.send("30 days of membership added!");
                }
            });
        });
    }
    else res.send("Not logged in!");
};

exports.createUser = function(req, res, next) {
    console.log(req.body);

    if (req.body.fakeCreditCard && req.body.name && req.body.password && req.body.email ) {

        var password = req.body.password;

        bcrypt.hash(password, saltRounds, function(err, hash) {
            if (err) {
                console.log(err);
                return res.status(500);//Internal Error
            }

            var newUser = new user({
                name: req.body.name,
                fakeCreditCard: req.body.fakeCreditCard,
                email: req.body.email,
                password: hash
            });

            newUser.save(function(err) {
                if (err) {
                    console.log(err);
                    return res.status(400).send(err.message); //Validation Error
                }

                console.log("Inserted 1 document into the collection");
                req.session.newUser=req.body.name;
                res.status(201).redirect("/");//Success
            });
        });
    } else {
        res.status(400).send("Please fill in all the fields");
    }
};

//user update
exports.updateUser = function(req, res, next) {
    //sanitize!
    console.log(req.body);

    if (req.session.user){
        var hash;
        var updateObj;

        //what was sent to update
        if (req.body.name) {updateObj = { name: req.body.name};}
        else if (req.body.email) {updateObj = { email: req.body.email};}
        else if (req.body.fakeCreditCard){updateObj = { fakeCreditCard: req.body.fakeCreditCard};}
        else if (req.body.password) {
            hash = bcrypt.hashSync(req.body.password, saltRounds);
            updateObj = { password: hash};
            req.session.user.password=hash
        }
        //if nothing sent
        else return res.send("Empty field");

        console.log(updateObj);//contains the update

        user.updateOne({ _id: req.session.user._id }, updateObj, { runValidators: true , context: 'query'}, function (err) {
            if (err) {
                res.send(err.message);//validators error
            }
            //successful update so have to update session data also
            else{
                if (req.body.name) req.session.user.name=req.body.name;
                else if (req.body.email) req.session.user.email=req.body.email;
                else if (req.body.fakeCreditCard) req.session.user.fakeCreditCard=req.body.fakeCreditCard;
                else if (req.body.password && hash) {req.session.user.password=hash}//ensure the hash was done
                res.send("Success!");
            }
        });
    }
    else res.send("Not logged in!");
};

//user delete
exports.deleteUser = function(req, res, next) {
    console.log(req.session.user);

    if (req.session.user){
        user.deleteOne({ _id: req.session.user._id }, function (req, res, err) {
            if (err) res.send(err);
        });
        req.session.user = null;//destroy the session also
        return res.send("Bye Bye!");
    }
    else res.send("Not logged in!");
};

//user page
exports.renderUser = function(req, res, next) {
    console.log(req.session);
    if (req.session.user) {
        res.render('user', {
            layout: 'main',
            name: req.session.user.name,
            email: req.session.user.email,
            fakeCreditCard: req.session.user.fakeCreditCard,
            csrfToken: req.csrfToken()
        });
    } else {
        res.render('user', {
            layout: 'main',
        });
    }
};

//admin page
exports.renderAdmin = function(req, res, next) {
    console.log(req.session);
    if (req.session.user) {
        if (req.session.user.role===2) {
            user.find(function(err, found_users) {
                if (err) {
                    res.sendStatus(404);
                    return console.error(err);
                }
                res.render('admin', {
                    title: 'Welcome Admin name: '+req.session.user.name+'!',
                    layout: 'main',
                    auth: true,
                    users:found_users,
                    csrfToken: req.csrfToken()
                });
            });
        }else{
            res.render('admin', {
                title: 'For Admins only!',
                layout: 'main'
            });
        }
    }else {
        res.redirect('/');
    }
};