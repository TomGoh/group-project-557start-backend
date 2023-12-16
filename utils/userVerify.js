const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Verifies the password when login. It compares the password with the hash.
 * @param password user password
 * @param hash user password hash
 * @returns {Promise<void|*>} true if password is correct, false otherwise
 */
const verifyPassword = async (password, hash) => bcrypt.compare(password, hash);

/**
 * Encrypts the password when user is created to create a hash.
 * @param password user password
 * @returns {Promise<void|*>} hash of the password
 */
const encryptPassword = async (password) => {
  const saltRounds = parseInt(process.env.ENCRYPT_SALT_LENGTH, 10);
  return bcrypt.hash(password, saltRounds);
};

module.exports = { verifyPassword, encryptPassword };
