// load the things we need
let mongoose = require('mongoose');
let bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
let userSchema = mongoose.Schema({
        role: {type:String,enum:['volunteer', 'organization'],default:'volunteer'},
    local            : {
        email        : String,
        password     : String
    },
    //both
    name:String,
    zip:String,

    //volunteers
    skills: [String],
    interest:[String],
    description:[String],

    //organization
    phone: String,
    website:String,



}, {timestamps:true});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
