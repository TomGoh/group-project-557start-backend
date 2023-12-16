const dotenv = require('dotenv');
const { insertOneObject, getOneObjectByQuery } = require('./dbFunctions');
const redisFactory = require('../utils/redisFactory');

dotenv.config();

/**
 * Get user information after login by email
 * @param email email of the user
 * @returns {Promise<*>} user information
 */
async function userLogin(email) {
  return getOneObjectByQuery('login', { email });
}

/**
 * Insert user information after sign up
 * @param email email of the user
 * @param password password of the user
 * @returns {Promise<*>} inserted user information
 */
async function userSignUp(email, password) {
  return insertOneObject('login', { email, password });
}

/**
 * Check if the user is locked when login failed
 * @param email email of the user
 * @returns {Promise<boolean>} true if the user is locked, false otherwise
 */
async function loginLock(email) {
  const redisClient = await redisFactory.getClient();
  const badAttempt = await redisClient.get(`attempd:${email}`);
  const threshold = process.env.LOGIN_ATTEMPT_THRESHOLD || 5;
  if (badAttempt === null) {
    await redisClient.set(`attempd:${email}`, 1);
    await redisClient.expire(`attempd:${email}`, 300);
    return false;
  }
  if (badAttempt >= threshold) {
    const locked = await redisClient.get(`locked:${email}`);
    if (locked === 'true') {
      return true;
    }
    await redisClient.set(`locked:${email}`, 'true');
    await redisClient.expire(`locked:${email}`, 300);
    return true;
  }
  await redisClient.incr(`attempd:${email}`);
  await redisClient.expire(`attempd:${email}`, 300);
  return false;
}

module.exports = {
  userLogin,
  userSignUp,
  loginLock,
};
