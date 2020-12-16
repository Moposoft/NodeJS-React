//userModel

var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const path = 'http://localhost:3000/';
var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'A Name is required'
  },
  email: {
    type: String,
    trim: true,
    unique: 'The Email already exists',
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    required: 'An Email is required'
  },
  password: {
    type: String,
    required: "A Password is required"
  },
  role: {
    type: Number,
    default: 1,
    min:1, //user
    max:2, //admin
    required: "User role is required"
  },
  fakeCreditCard:{
    type: Number,
    required: "A Fake credit card is required"
  },
  membership_valid:{
    type: Date,
    default: Date.now() + 30 * 24 * 3600 * 1000, //30 days when created
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

//links as virtuals
userSchema.virtual('link_self').get(function() {
  return path + 'api/users/' + this._id;
});

userSchema.set('toObject', { virtuals: true });

//don't return hashed password it is only compared
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
  }
});

//email is unique
userSchema.plugin(uniqueValidator);

//export as mongoose model
module.exports =  mongoose.model('User', userSchema);