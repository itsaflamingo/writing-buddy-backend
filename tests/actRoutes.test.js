const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");
const initializeMongoServer = require("../mongoConfigTesting");
const login = require("../routes/login");
const User = require("../models/user");
const Project = require("../models/project");
const Act = require("../models/act");

dotenv.config();
require("../auth/auth");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/login", login);

describe("hub acts", () => {
  // Set up variables to be used throughout application
  let server;
  let projectId;
  let projObjectId;
  let actId;
  // User login credentials
  const user = { username: "test", password: process.env.TEST_PASSWORD };
  // Sign jsonwebtoken with user login and secret key imported from dotenv
  const token = jwt.sign({ user }, process.env.SECRET_KEY);
  // Create instance of supertest agent bound to express app instance, used to maintain cookie
  const agent1 = request.agent(app);

  // Add user to test database
  async function addToTestDatabase() {
    await User.create({
      username: "test",
      password: "password",
      admin: false,
    }).catch((err) => console.error(err));
  }

  // Add project to test database
  async function addProjectToTestDatabase() {
    // Find previously created user to attach to project
    const user = await User.findOne({ username: "test" });
    // Create new project
    const project = new Project({
      title: "title1",
      genre: "genre1",
      isComplete: false,
      isPublished: true,
      user: user._id,
    });
    // Save project to mongoose
    await project.save();
  }

  async function addActToTestDatabase() {
    const project = await Project.findOne({ title: "title1" });

    const act = new Act({
      title: "act title",
      isComplete: false,
      isPublished: true,
      project: project._id,
    });
    projObjectId = project._id;
    projectId = project._id.toString().slice(0, 24);
    await act.save();
  }

  function loginUser() {
    return function (done) {
      request(app)
        .post("/login")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .set("Cookie", [process.env.COOKIE])
        .send(user)
        .expect(200)
        .then(() => {
          // Set token signed by jwt to Authorization header
          agent1.set("Authorization", `Bearer ${token}`);
          done();
        })
        .catch((err) => {
          console.error(err);
          done(err);
        });
    };
  }

  beforeAll(async () => {
    // Sets up MongoDB server and returns server instance
    initializeMongoServer()
      // After promise has returned, set server variable to returned server instance
      .then((mongo) => {
        server = mongo;
        mongo.startConnection();
      })
      .catch((err) => console.log(err));
    // Add user, project, act and test to test database
    await addToTestDatabase();
    await addProjectToTestDatabase();
    await addActToTestDatabase();
  });
  // Login user before making request
  beforeEach(() => {
    loginUser();
  });
  afterAll(async () => {
    await server.stopConnection();
  });

  it("login", loginUser());
  it("Test get acts list", (done) => {
    agent1
      .get(`/project/${projectId}/acts`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.body[0].title).toBe("act title");
        expect(res.body.length).toBe(1);
        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
  it("Test create act", (done) => {
    agent1
      .post(`/project/${projectId}/act/create`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "act title 2", isComplete: false, project: projObjectId })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        // Expect results
        expect(res.body.title).toBe("act title 2");
        expect(res.body.isComplete).toBe(false);

        // Set act id to var to be able to access update & delete routes
        actId = res.body.id;

        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
  it("Test get act to be updated", (done) => {
    agent1
      .get(`/act/${actId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.body.title).toBe("act title 2");
        expect(res.body.isComplete).toBe(false);

        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
  it("Test update act", (done) => {
    agent1
      .patch(`/act/${actId}/update`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "updated act", isComplete: false, project: projObjectId })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.body.title).toBe("updated act");
        expect(res.body.isComplete).toBe(false);

        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
  it("Test delete act", (done) => {
    agent1
      .delete(`/act/${actId}/delete`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toBe("Act deleted successfully");
        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
});
