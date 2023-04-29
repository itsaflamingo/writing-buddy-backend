/// / mongoConfigTesting.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function initializeMongoServer() {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  const startConnection = () => {
    mongoose.connect(mongoUri);

    mongoose.connection.on('error', (e) => {
      if (e.message.code === 'ETIMEDOUT') {
        console.log(e);
        mongoose.connect(mongoUri);
      }
      console.log(e);
    });

    mongoose.connection.once('open', () => {
      console.log(`MongoDB successfully connected to ${mongoUri}`);
    });
  };

  const stopConnection = async () => {
    console.log('MongoDB disconnect');
    await mongoServer.stop();
  };

  return { startConnection, stopConnection };
}

module.exports = initializeMongoServer;
