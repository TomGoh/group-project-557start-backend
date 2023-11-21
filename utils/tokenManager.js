const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const redisFactory = require('./redisFactory');

dotenv.config();
const secretKey = process.env.JWT_SECRET;

const tokenManager = {
  generateToken: (user) => {
    const token = jwt.sign(
      { id: user._id },
      secretKey,
      { expiresIn: '6h' },
    );
    return token;
  },
  validateToken: (token) => {
    try {
      const decoded = jwt.verify(token, secretKey);
      return decoded;
    } catch (err) {
      return false;
    }
  },
  disableToken: async (token) => {
    const redisClient = await redisFactory.getClient();
    redisClient.set(token, 'disabled');
    redisClient.expire(token, 21600);
    redisClient.close();
  },
  isTokenDisabled: async (token) => {
    const redisClient = await redisFactory.getClient();
    const result = await redisClient.get(token);
    redisClient.close();
    return result === 'disabled';
  },
};

module.exports = { tokenManager };
