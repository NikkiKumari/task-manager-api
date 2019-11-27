const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');
const userSchema = new mongoose.Schema({
    name :{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type: String,
        index: true,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
        trim: true, validate(value) {
            if(value<0){
                throw new Error('Age must be possitive Number')
            }
        }
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }],
    avatar: {
        type:Buffer
    }
}, {
    timestamps:true
});

userSchema.virtual('tasks', {
   ref: "Task",
    localField:"_id",
    foreignField:"Owner"
});

userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email});
    if(!user) throw new Error('User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Unable to login');
    }
    return user;
};

userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = await jwt.sign({_id:user._id.toString()}, process.env.JSON_WEB_TOKEN_KEY);
    user.tokens = user.tokens.concat({token})
    await user.save();
    return token;
};

userSchema.methods.toJSON = function(){
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;

};

//Hash the plain text password before saving
userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next();
});

//Delete user task when user is removed
userSchema.pre('remove', async function(next){
    const user = this;
    await Task.deleteMany({
       Owner: user._id
    });
    next();
});
const User = mongoose.model('User', userSchema);
module.exports = User;