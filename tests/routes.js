const hub = require('../routes/hub');
const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use('/hub', hub);