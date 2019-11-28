const request = require('supertest');
const  app = require('../src/app');
const User = require('../src/models/user');
const {userOneId, userOne, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase);
test('Should signup a new user', async () => {
    const response = await request(app).post('/users').set('Content-Type', 'application/json')
        .send({
            name: 'Matthew',
            email: 'sadsad@example.com',
            password: 'MyPass777!'
        }).expect(201)

    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();
    expect(response.body).toMatchObject({
        user:{
            name: 'Matthew'
        }
    });
    expect(user.password).not.toBe('MyPass777!');
});

test('should login existing user', async ()=>{
 const response = await request(app).post('/users/login').send({
       email:userOne.email,
       password:userOne.password
   }).expect(200);
    const user = await User.findById(response.body.user._id);
    expect(response.body.token).toBe(user.tokens[0].token);
});

test('should not login existing user', async ()=>{
   await request(app).post('/users/login').send({
       email:'noexist@gmail.com',
       password:userOne.password
   }).expect(404);
});

test('should get profile for user', async ()=>{
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
});

test('should delete account for user', async ()=>{
    const response =   await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    expect(response.body.user).not.toBeNull();
});

/*
test('should upload avatat image', async ()=>{
    console.log();
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200);
    const user= await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
});*/
