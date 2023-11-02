require('dotenv/config');
const mongoose = require('mongoose');

const connectURI = process.env.MONGODB_URI;

mongoose.connect(connectURI)
  .then(() => process.stdout.write('Connected to MongoDB...\n'))
  .catch((err) => process.stdout.write('Could not connect to MongoDB...\n', err));

module.exports = mongoose;
