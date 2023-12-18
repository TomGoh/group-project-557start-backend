const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

const port = process.env.PORT || 8888;
app.listen(port, () => {
  process.stdout.write(`Server is listening on port ${port}\n`);
});
