const dotenv = require('dotenv');
const { insertOneObject, getOneObjectByQuery } = require('./dbFunctions');
const redisFactory = require('../utils/redisFactory');

dotenv.config();

async function userLogin(email) {
  return getOneObjectByQuery('login', { email });
}

async function userSignUp(email, password) {
  return insertOneObject('login', { email, password });
}

async function loginLock(email) {
  const redisClient = await redisFactory.getClient();
  const badAttempt = await redisClient.get(`attempd:${email}`);
  const threshold = process.env.LOGIN_ATTEMPT_THRESHOLD || 5;
  if (badAttempt === null) {
    await redisClient.set(`attempd:${email}`, 1);
    await redisClient.expire(`attempd:${email}`, 600);
    return false;
  }
  if (badAttempt >= threshold) {
    const locked = await redisClient.get(`locked:${email}`);
    if (locked === 'true') {
      return true;
    }
    await redisClient.set(`locked:${email}`, 'true');
    await redisClient.expire(`locked:${email}`, 600);
    return true;
  }
  await redisClient.incr(`attempd:${email}`);
  await redisClient.expire(`attempd:${email}`, 600);
  return false;
}

module.exports = {
  userLogin,
  userSignUp,
  loginLock,
};
