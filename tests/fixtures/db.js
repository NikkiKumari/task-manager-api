const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const userOneId = new mongoose.Types.ObjectId();
const User = require('../../src/models/user');
const userOne={
    _id:userOneId,
    name:'Mike',
    email:'mike@example.com',
    password:'56what!!',
    tokens:[{
        token: jwt.sign({_id:userOneId}, process.env.JSON_WEB_TOKEN_KEY)
    }]
};
const setupDatabase = async ()=>{
    await User.deleteMany();
    await new User(userOne).save();
};

module.exports = {
    userOneId,
    userOne,
    setupDatabase
};