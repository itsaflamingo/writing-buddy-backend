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

describe('hub projects', () => {
  
  let userId;
  let userObjectId;
  let server;
  let projectId;
  const user = { username: 'test', password: process.env.TEST_PASSWORD };
  const token = jwt.sign({ user }, process.env.SECRET_KEY);
  const agent1 = request.agent(app);

  async function addToTestDatabase() {
    await User.create({
      username: 'test',
      password: 'password',
      admin: false
    })
    .then(res => {
      userObjectId = res._id;
    })
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
            .set('Cookie', [process.env.COOKIE])
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
    await addToTestDatabase();
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
    agent1
      .get(`/hub/user/${userId}/projects`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        expect(res.body[0].user.username).toBe(user.username);
        expect(res.body.length).toBe(1);
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

        projectId = res.body.id;

        done();
      })
      .catch(err => {
        console.error(err)
        done(err)
      })
  })
  it('Test get project to be updated', done => {
    agent1
      .get(`/hub/project/${projectId}`)
      .set('Authorization', 'Bearer ' + token)
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
  it('Test update project', done => {
    agent1
      .patch(`/hub/project/${projectId}/update`)
      .set('Authorization', 'Bearer ' + token)
      .send({ title: 'updated title', genre: 'updated genre', isComplete: false, user: userObjectId })
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        expect(res.body.title).toBe('updated title');
        expect(res.body.genre).toBe('updated genre');
        expect(res.body.isComplete).toBe(false);

        done();
      })
      .catch(err => {
        console.error(err)
        done(err)
      })
  })
})

