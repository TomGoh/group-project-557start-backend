const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();
const verifyPassword = async (password, hash) => {
  const result = await bcrypt.compare(password, hash);
  return result;
};

const encryptPassword = async (password) => {
  const saltRounds = parseInt(process.env.ENCRYPT_SALT_LENGTH, 10);
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
};
module.exports = { verifyPassword, encryptPassword };
