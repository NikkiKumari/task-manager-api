const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

router.post('/tasks',auth, async (req, res)=>{
    const task = new Task({
       ...req.body,
       Owner: req.user._id
    });
    try{
        task.save();
        res.status(201).send(task)
    }catch (e) {
        res.status(400).send(e)
    }
});

// GET /task?completed=true
// GET /task?limit=10&skip=20
//GET /task/sortBy=createdAt:desc
router.get('/tasks',auth, async (req, res)=>{
    const match = {};
    const sort={};
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1]==='desc'? -1 : 1
    }
    try {
        /*const task = await Task.find({
            Owner: req.user._id
        });*/
        await req.user.populate({
            path:"tasks",
            match,
            options: {
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.status(201).send(req.user.tasks);
    }catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.get('/tasks/:id',auth, async (req, res)=>{
    const _id = req.params.id;
    console.log('_id', _id);
    console.log('req.user', req.user._id);
    try{
        const task = await Task.findOne({
           _id,
            Owner: req.user._id
        });
        console.log('task', task);
        if(!task){
            return  res.status(404).send();
        }
        res.status(201).send(task);
    }catch (e) {
        console.log(e);

        res.status(500).send();
    }
});

router.patch('/tasks/:id', auth, async (req, res)=>{
    const updates = Object.keys(req.body);
    const  allowedUpdate = ['description', 'completed'];
    const isValidOperation = updates.every( update => allowedUpdate.includes(update));
    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid Updated!'});
    }
    try{
        const task = await Task.findOne({
            _id: req.params.id,
            Owner: req.user._id
        });
        //const task = await Task.findById(req.params.id);
        if(!task){ return res.status(404).send('Task not found');}
        updates.forEach(update => {
            task[update] = req.body[update];
        });
        await  task.save();
        res.send(task);
    }catch (e) {
        console.log('e', e);
        res.status(500).send(e)
    }
});

router.delete('/tasks/:id', auth,async (req, res)=>{
    try {
        const task = await Task.findByIdAndDelete({
           _id: req.params.id,
            Owner: req.user._id
        });
        if(!task){
            return res.status(404).send('no data')
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
});

module.exports = router;
