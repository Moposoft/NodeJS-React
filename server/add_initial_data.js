const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/WWWProgramming');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var bcrypt = require('bcryptjs');
const saltRounds = 12;
var User = require('./models/User');

// Create some test users and admin
var array=[];
var password='1';//every test users password
var hash = bcrypt.hashSync(password, saltRounds);
const test1 = new User({ name: 'Admin', email: 'admin@x.x', password:hash, role:'2', fakeCreditCard:'1234'});
const test2 = new User({ name: 'User1', email: 'user1@x.x', password:hash, role:'1', fakeCreditCard:'4312'});
const test3 = new User({ name: 'User2', email: 'user2@x.x', password:hash, role:'1', fakeCreditCard:'1231'});
const test4 = new User({ name: 'User3', email: 'user3@x.x', password:hash, role:'1', fakeCreditCard:'1342'});
const test5 = new User({ name: 'User4', email: 'user4@x.x', password:hash, role:'1', fakeCreditCard:'1242'});
const test6 = new User({ name: 'User5', email: 'user5@x.x', password:hash, role:'1', fakeCreditCard:'1231'});

array.push(test1,test2,test3,test4,test5,test6);

db.once('connected', function (err) {
    if (err) { return console.error(err) }
    User.create(array, function (err, doc) {
        if (err) { return console.error(err) }
        console.log("CREATED: "+doc);
        return db.close()
    })
});