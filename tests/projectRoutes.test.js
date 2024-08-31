const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const initializeMongoServer = require("../mongoConfigTesting");
const login = require("../routes/login");
const User = require("../models/user");
const Project = require("../models/project");

dotenv.config();
require("../auth/auth");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/login", login);

describe("hub projects", () => {
  // Set in-scope variables
  let userId;
  let userObjectId;
  let server;
  let projectId;
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
    })
      .then((res) => {
        // Splice user id string
        userId = res._id.toString().slice(0, 24);
        // Get full user id
        userObjectId = res._id;
      })
      .catch((err) => console.error(err));
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

  // Login user
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
  });
  // Login user before making request
  beforeEach(() => {
    loginUser();
  });
  afterAll(async () => {
    await server.stopConnection();
  });

  it("login", loginUser());
  it("Test get project list", (done) => {
    agent1
      .get(`/user/${userId}/projects`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.body[0].user.username).toBe(user.username);
        expect(res.body.length).toBe(1);
        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
  it("Test create project", (done) => {
    agent1
      .post(`/user/${userId}/project/create`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "title",
        genre: "genre",
        isComplete: false,
        user: userObjectId,
      })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.body.title).toBe("title");
        expect(res.body.genre).toBe("genre");
        expect(res.body.isComplete).toBe(false);

        projectId = res.body.id;

        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
  it("Test get project to be updated", (done) => {
    agent1
      .get(`/project/${projectId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.body.title).toBe("title");
        expect(res.body.genre).toBe("genre");
        expect(res.body.isComplete).toBe(false);

        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
  it("Test update project", (done) => {
    agent1
      .patch(`/project/${projectId}/update`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "updated title",
        genre: "updated genre",
        isComplete: false,
        user: userObjectId,
      })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.body.title).toBe("updated title");
        expect(res.body.genre).toBe("updated genre");
        expect(res.body.isComplete).toBe(false);

        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
  it("Test delete project", (done) => {
    agent1
      .delete(`/project/${projectId}/delete`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toBe("Project deleted successfully");
        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
});
