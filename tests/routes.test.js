const request = require("supertest");
const express = require("express");
const initializeMongoServer = require('../mongoConfigTesting');
const hub = require('../routes/hub');
const login = require('../routes/login');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const server = request(app);

app.use(express.urlencoded({ extended: false }));
// app.use('/hub', hub);
app.use('/login', login);

describe('hub', () => {
  
  const userId = process.env.TEST_ID;
  const user = { username: 'test', password: process.env.TEST_PASSWORD };
  const token = jwt.sign({ user }, process.env.SECRET_KEY);

  function loginUser() {
    return function(done) {
        server
            .post('/login')
            .send(user)
            .set('Authorization', 'Bearer ' + token)
            .expect(500)
            .then(res => {
              console.log(res.headers)
              console.log('body:', res.body)
              // Get the cookie from the response headers
              res.headers['set-cookie'].map(cookie.parse);
              // Set the cookie in the agent
              server.jar.setCookie(cookie.serialize('token', token), 'http://localhost:3000');
              expect(res.body.user.username).toBe('test');
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
