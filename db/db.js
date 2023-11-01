require('dotenv/config');
const mongoose = require('mongoose');

const connectURI = process.env.MONGODB_URI;

mongoose.connect(connectURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => process.stdout.write('Connected to MongoDB...'))
  .catch((err) => process.stdout.write('Could not connect to MongoDB...', err));

module.exports = mongoose;
