const request = require("supertest");
const express = require("express");
const initializeMongoServer = require('../mongoConfigTesting');
const login = require('../routes/login');
const hub = require('../routes/hub');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user');
const Project = require('../models/project');

dotenv.config();
require('../auth/auth');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/login', login);
app.use('/hub', hub);

describe('hub', () => {
  
  let userId;
  let userObjectId;
  let server;
  const user = { username: 'test', password: process.env.TEST_PASSWORD };
  const token = jwt.sign({ user }, process.env.SECRET_KEY);
  const agent1 = request.agent(app);

  async function addUserToTestDatabase() {
    await User.create({
      username: 'test',
      password: 'password',
      admin: false
    })
    .then(res => res)
    .catch(err => console.error(err))
  }

  async function addProjectToTestDatabase() {
    const user = await User.findOne({ username: 'test' });
    const project = new Project({
      title: 'title1',
      genre: 'genre1',
      isComplete: false,
      user: user._id
    })
    userId = user._id.toString().slice(0, 24);
    userObjectId = user._id;
    await project.save();
  }

  function loginUser() {
    return function(done) {
        request(app)
            .post('/login')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Cookie', ['connect.sid=s:QPDULEgCnknt_iyMr9zqHfdCem0-5-mt.4RU4RxLjJ1VGKhlDQkn2WpExWG9uLub1ZXRnlv7pb7I; connect.sid=s:6Nbg6YcSKTfFWli70uXWwGmTfRbOpcMM.LIsbmWflnX9mKeUbdGd/HKqEz37jhdc2HrWDZW0b5M8; connect.sid=s:7zW3efdhST-etiDVYsGGcnZ55nVZMhlm.o8/dmXbkzocyOCLR0VoJxfEpntNVAK0tXbIv8YT08tY; connect.sid=s:7Sns82db5UZGF3v-0W082lHEVzonrXTq.0sPpw3umze1bJ+NyLB9h0boW4LLrqUKhGT4giwWmHoU; connect.sid=s:aexhXYGJRLYBrkvYVOR0KikHzcuOyVEF.xGfTtaAljXlYguYIbRrZA9IDjlTRgxo3cBLJrgqpYdk; connect.sid=s:YWnljcc28I92Uu7qGr083BWemuHUhPkr.5gClWzJXA3uOCQ0Om+qww9mLdlRO8EApEyAeqCE7HxY; connect.sid=s:a-xzU7fklo0gnuKvqQ-K8e_y9XWOjXpQ.Yk7WQ0GQMQir17oFsY0qatOP2XilHGjMkXfNYVv/J20; connect.sid=s:hq0XfkqKlSn038Yf6O0isUGTGLwayiH-.aobjTmsuH2jv9qsH4fS/wPzho73Tl7DbBkJ2Y9WWDNw; connect.sid=s:GRREpKTYOK86h_qiqS1q6dXFQ-IdwzYo.zsXEacq9GE/nZOdIWtdMNDBfYOs3dDTeMVRBuLVkBeE; connect.sid=s:Q_4DJ-P88ywo9MizTg-A3mwAmiYBhTn0.zRZ98I1d8gm0qgFAVcs2So0eSArn+L2uGhkfkljAJ98; connect.sid=s:RCTsoLn3uxkFAHnLx15q4XSFBqAkMIUE.C6NM+2TnA031BTO2mSsp3Qkinup97HXduMRZ808y7s4; connect.sid=s:v3pBfsNluwTm4215XLycE6nKeUiMIu9N.LQQL7GpGARaApClZB1LWrKAESAQ+/romYAx5DnAJGgk'])
            .send(user)
            .expect(200)
            .then(res => {
              agent1.set('Authorization', 'Bearer ' + token)
              done();
            })
            .catch(err => {
              console.error(err);
              done(err);
            })
    };
  };

  beforeAll(async () => {
    initializeMongoServer()
      .then(mongo => {
        server = mongo;
        mongo.startConnection();
      })
      .catch(err => console.log(err));
    await addUserToTestDatabase();
    await addProjectToTestDatabase();
  })
  beforeEach(() => {
    loginUser();
  })
  afterAll(async () => {
    await server.stopConnection();
  });

  it('login', loginUser());
  it('Test get project list', done => {
    loginUser();
    agent1
      .get(`/hub/user/${userId}/projects`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        expect(res.body[0].user.username).toBe(user.username);
        done();
      })
      .catch(err => {
        console.error(err)
        done(err)
      })
  })
  it('Test create project', done => {
    agent1
      .post(`/hub/user/${userId}/project/create`)
      .set('Authorization', 'Bearer ' + token)
      .send({ title: 'title', genre: 'genre', isComplete: false, user: userObjectId })
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        expect(res.body.title).toBe('title');
        expect(res.body.genre).toBe('genre');
        expect(res.body.isComplete).toBe(false);

        done();
      })
      .catch(err => {
        console.error(err)
        done(err)
      })
  })
})
