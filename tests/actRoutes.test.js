const request = require("supertest");
const express = require("express");
const initializeMongoServer = require('../mongoConfigTesting');
const login = require('../routes/login');
const hub = require('../routes/hub');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/user');
const Project = require('../models/project');
const Act = require('../models/act');

dotenv.config();
require('../auth/auth');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/login', login);
app.use('/hub', hub);

describe('hub acts', () => {
  
let server;
  let userId;
  let userObjectId;
  let projectId;
  let projObjectId;
  let actId;
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
        userId = res._id.toString().slice(0, 24);
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
    await project.save();
  }

  async function addActToTestDatabase() {
    const project = await Project.findOne({ title: 'title1' });

    const act = new Act({
      title: 'act title',
      isComplete: false,
      project: project._id
    })
    projObjectId = project._id;
    projectId = project._id.toString().slice(0, 24);
    await act.save();
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
    await addActToTestDatabase();
  })
  beforeEach(() => {
    loginUser();
  })
  afterAll(async () => {
    await server.stopConnection();
  });

  it('login', loginUser());
  it('Test get acts list', done => {
    agent1
      .get(`/hub/project/${projectId}/acts`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        expect(res.body[0].title).toBe('act title');
        expect(res.body.length).toBe(1);
        done();
      })
      .catch(err => {
        console.error(err)
        done(err)
      })
  })
  it('Test create act', done => {
    agent1
      .post(`/hub/project/${projectId}/act/create`)
      .set('Authorization', 'Bearer ' + token)
      .send({ title: 'act title 2', isComplete: false, project: projObjectId })
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        // Expect results
        expect(res.body.title).toBe('act title 2');
        expect(res.body.isComplete).toBe(false);

        // Set act id to var to be able to access update & delete routes 
        actId = res.body.id;

        done();
      })
      .catch(err => {
        console.error(err)
        done(err)
      })
  })
  it('Test get act to be updated', done => {
    agent1
      .get(`/hub/act/${actId}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        expect(res.body.title).toBe('act title 2');
        expect(res.body.isComplete).toBe(false);

        done();
      })
      .catch(err => {
        console.error(err)
        done(err)
      })
  })
  it('Test update act', done => {
    agent1
      .patch(`/hub/act/${actId}/update`)
      .set('Authorization', 'Bearer ' + token)
      .send({ title: 'updated act', isComplete: false, project: projObjectId })
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => {
        expect(res.body.title).toBe('updated act');
        expect(res.body.isComplete).toBe(false);

        done();
      })
      .catch(err => {
        console.error(err)
        done(err)
      })
  })
  it('Test delete act', done => {
    agent1
      .delete(`/hub/act/${actId}/delete`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toBe('Act deleted successfully');
        done();
      })
      .catch(err => {
        console.error(err)
        done(err)
      })
  })
})

