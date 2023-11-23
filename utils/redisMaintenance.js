const redisFactory = require('./redisFactory');

async function deleteCache(key) {
  const redisClient = await redisFactory.getClient();
  await redisClient.del(key);
}

async function setCache(key, value, expireTime) {
  const redisClient = await redisFactory.getClient();
  await redisClient.set(key, JSON.stringify(value));
  await redisClient.expire(key, expireTime);
}

async function getCache(key) {
  const redisClient = await redisFactory.getClient();
  const cachedValue = await redisClient.get(key);
  if (!cachedValue) {
    return null;
  }
  return JSON.parse(cachedValue);
}

module.exports = { deleteCache, setCache, getCache };
