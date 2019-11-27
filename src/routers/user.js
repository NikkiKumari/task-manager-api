const express = require('express');
const auth = require('../middleware/auth');
const router = new express.Router();
const User = require('../models/user');
const multer = require('multer');
const sharp = require('sharp');

router.post('/users', async (req , res)=>{
    const user = new User(req.body);
    try{
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    }catch (e) {
        res.send(404).send(e);
    }
});

router.get('/users/me', auth , async  (req, res)=>{
    res.send(req.user);
});

router.patch('/users/me', auth, async (req, res)=>{
    const updates = Object.keys(req.body);
    const  allowedUpdate = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every( update => allowedUpdate.includes(update));
    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid Updated!'});
    }
    try{
        const user = await User.findById(req.user._id);
        updates.forEach(update=>{
           user[update] = req.body[update]
        });
        await user.save();
        res.send(user);
    }catch (e) {
        console.log(e)
        res.status(400).send();
    }
});

router.delete('/users/me',auth,  async (req, res)=>{
    try{
        await req.user.remove();
        res.send(req.user)
    } catch (e) {
        res.status(505).send();
    }
});

router.post('/users/login', async (req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    }catch (e) {
        res.status(404).send();
    }
});

router.post('/users/logout', auth, async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token =>{
            return token.token !== req.token;
        });
        await  req.user.save();
        res.send()
    }catch (e) {
        res.status(500).send();
    }
});

router.post('/user/logoutAll', async (req, res)=>{
    try{
        req.user.tokens = [];
        await req.user.save();
    }catch (e) {
        res.status(500).send();
    }
});
const upload = multer({
    limit:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('File must be a jpg|jpeg|png'))
        }
        cb(undefined, true)
    }
});

router.post('/user/me/avatar',auth, upload.single('avatar'),async (req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({
        width: 250,
        height:250
    }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next)=>{
    res.status(404).send({
        erorr: error.message
    });
});

router.delete('/user/me/avatar', auth ,async (req, res)=>{
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
    }catch (e) {
        res.status(404).send();
    }
});

router.get('/user/:id/avatar',async (req,res)=>{
   try{
       const user = await User.findById(req.params.id);
       if(!user || !user.avatar){
           throw new Error()
       }
       res.set('Content-Type', 'image/png');
       res.send(user.avatar);
   } catch (e) {
       res.status(404).send();
   }
});

module.exports = router;