require('dotenv/config');
const mongoose = require('mongoose');

const connectURI = process.env.MONGODB_GEN_TESTDB;
mongoose.connect(connectURI)
  .then(() => {
    process.stdout.write('Connected to MongoDB...\n');
    process.stdout.write(`URI: ${connectURI}\n`);
  })
  .catch((err) => process.stdout.write('Could not connect to MongoDB...\n', err));

module.exports = mongoose;
