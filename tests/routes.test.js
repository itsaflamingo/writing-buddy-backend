const request = require("supertest");
const server = request.agent('http://localhost:3000');
const express = require("express");
const initializeMongoServer = require('../mongoConfigTesting');
const hub = require('../routes/hub');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use('/hub', hub);

describe('hub', () => {

  const user = { username: 'test', password: process.env.TEST_PASSWORD };
  const token = jwt.sign({ user }, process.env.SECRET_KEY);

  function loginUser() {
    return function(done) {
        server
            .post('/login')
            .send(user)
            .set('Authorization', 'Bearer' + token)
            .expect(200)
            .then(res => {
              // Get the cookie from the response headers
              const cookies = res.headers['set-cookie'].map(cookie.parse);
              // Set the cookie in the agent
              server.jar.setCookie(cookie.serialize('token', token), 'http://localhost:3000');
              done()
            })
            .catch(err => console.log(err))
    };
  };

  beforeAll(async () => {
    await initializeMongoServer();
  })

  it('login', loginUser());
  it('Test project list', (done) => {
    loginUser()();
    const userId = process.env.TEST_ID;
    server
      .get(`/hub/user/${userId}/projects`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .end(done)
  })
})
