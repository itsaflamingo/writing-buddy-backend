const mongoose = require("mongoose");
// Prepare for Mongoose 7
mongoose.set("strictQuery", false);
// Define databse URL to connect to
const mongoDB = process.env.URI;
// Wait for database to connect, logging an error if there is a problem
main().catch((err) => console.log(err));

// Set options to use the new connection string parser and the new unified topology engine when connecting to the MongoDB server.
async function main() {
  await mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
mongoose.Promise = global.Promise;
