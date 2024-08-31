const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const initializeMongoServer = require("../mongoConfigTesting");
const login = require("../routes/login");
const User = require("../models/user");
const Project = require("../models/project");
const Act = require("../models/act");
const Chapter = require("../models/chapter");

dotenv.config();
require("../auth/auth");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/login", login);

describe("hub chapters", () => {
  // Set global variables
  let server;
  let actId;
  let actObjectId;
  let chapterId;
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

    await act.save();
  }

  async function addChapterToTestDatabase() {
    const act = await Act.findOne({ title: "act title" });

    const chapter = new Chapter({
      title: "chapter title",
      number: 2,
      body: "chapter body",
      isComplete: false,
      isPublished: true,
      act: act._id,
    });

    actObjectId = act._id;
    actId = act._id.toString().slice(0, 24);

    await chapter.save();
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
    //   Add user, project, act and test to test database
    await addToTestDatabase();
    await addProjectToTestDatabase();
    await addActToTestDatabase();
    await addChapterToTestDatabase();
  });
  // Login user before making request
  beforeEach(() => {
    loginUser();
  });
  // Disconnect server after all tests are completed
  afterAll(async () => {
    await server.stopConnection();
  });

  it("login", loginUser());
  it("Test get chapters list", (done) => {
    agent1
      .get(`/act/${actId}/chapters`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        // Check that fields match what has been entered
        expect(res.body[0].title).toBe("chapter title");
        expect(res.body[0].body).toBe("chapter body");
        expect(res.body[0].isComplete).toBe(false);
        expect(res.body[0].number).toBe(2);
        expect(res.body.length).toBe(1);
        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
  it("Test create chapter", (done) => {
    agent1
      .post(`/act/${actId}/chapter/create`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "chapter 3",
        body: "chapter body create",
        number: 3,
        isComplete: false,
        act: actObjectId,
      })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        // Check fields are correct
        expect(res.body.title).toBe("chapter 3");
        expect(res.body.body).toBe("chapter body create");
        expect(res.body.number).toBe(3);
        expect(res.body.isComplete).toBe(false);

        // Set act id to var to be able to access update & delete routes
        chapterId = res.body.id;

        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
  it("Test get chapter to be updated", (done) => {
    agent1
      .get(`/chapter/${chapterId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.body.title).toBe("chapter 3");
        expect(res.body.isComplete).toBe(false);

        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
  it("Test update chapter", (done) => {
    agent1
      .patch(`/chapter/${chapterId}/update`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "updated chapter 3",
        body: "chapter body update",
        number: 3,
        isComplete: false,
        act: actObjectId,
      })
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.body.title).toBe("updated chapter 3");
        expect(res.body.body).toBe("chapter body update");
        expect(res.body.number).toBe(3);
        expect(res.body.isComplete).toBe(false);

        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
  it("Test delete chapter", (done) => {
    agent1
      .delete(`/chapter/${chapterId}/delete`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toBe("Chapter deleted successfully");
        done();
      })
      .catch((err) => {
        console.error(err);
        done(err);
      });
  });
});
