const createError = require("http-errors");
const express = require("express");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotenv = require("dotenv");
const passport = require("passport");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.options("*", cors());

require("./auth/auth");
require("./mongoConfig");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const indexRouter = require("./routes/index");
const signUpRouter = require("./routes/sign-up");
const logInRouter = require("./routes/login");
const logoutRouter = require("./routes/logout");
const userRouter = require("./routes/user");
const projectRouter = require("./routes/project");
const actRouter = require("./routes/act");
const chapterRouter = require("./routes/chapter");

// used to authenticate protected routes
const authenticate = passport.authenticate("jwt", { session: false });

app.use("/", indexRouter);
app.use("/sign-up", signUpRouter);
app.use("/login", logInRouter);
app.use("/logout", logoutRouter);
// Protected routes
app.use("/user", authenticate, userRouter);
app.use("/project", authenticate, projectRouter);
app.use("/act", authenticate, actRouter);
app.use("/chapter", authenticate, chapterRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
