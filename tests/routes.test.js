const request = require("supertest");
const express = require("express");
const initializeMongoServer = require('../mongoConfigTesting');
const login = require('../routes/login');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user');
const passport = require('passport');

dotenv.config();
require('../auth/auth');
const app = express();

app.use(express.urlencoded({ extended: false }));
// app.use('/hub', hub);
app.use('/login', login);

describe('hub', () => {
  
  const userId = process.env.TEST_ID;
  const user = { username: 'test', password: process.env.TEST_PASSWORD };
  const token = jwt.sign({ user }, process.env.SECRET_KEY);
  const agent1 = request.agent(app);

  async function addUserToTestDatabase() {
    await User.create({
      username: 'test',
      password: 'password',
      admin: false
    })
    .then(res => console.log(res))
    .catch(err => console.log(err))
  }

  function loginUser() {
    return function(done) {
        agent1
            .post('/login')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(user)
            .expect(200)
            .then(res => {
              const cookies = res.headers["set-cookie"];

              agent1.set('Authorization', 'Bearer ' + token)
              agent1.set("Cookie", cookies);

              done();
            })
            .catch(err => {
              console.error(err);
              done(err);
            })
    };
  };

  beforeAll(async () => {
    await initializeMongoServer();
    await addUserToTestDatabase();
  })

  it('login', loginUser());
//   it('Test get project list', done => {
//     loginUser()();
//     server
//       .get(`/hub/user/${userId}/projects`)
//       .set('Authorization', 'Bearer ' + token)
//       .expect(200)
//       .expect('Content-Type', /json/)
//       .then((res) => {
//         console.log(res.body);
//         expect(res.body[0].user.username).toBe(user.username);
//         done();
//       })
//       .catch(err => {
//         console.error(err)
//         done(err)
//       })
//   })
//   it('Test create project', done => {
//     loginUser()();
//     server
//       .post(`/hub/user/${userId}/project/create`)
//       .set('Authorization', 'Bearer ' + token)
//       .send({ title: 'title', genre: 'genre', isComplete: false })
//       .expect(200)
//       .expect('Content-Type', /json/)
//       .then((res) => {
//         console.log(res.body)
//         // expect(res.body[0].user.username).toBe(user.username);
//         done();
//       })
//       .catch(err => {
//         console.error(err)
//         done(err)
//       })
//   })
})
