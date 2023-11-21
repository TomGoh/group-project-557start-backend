const redis = require('redis');

const redisFactory = (() => {
  let redisClient;

  async function createInstance() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = process.env.REDIS_PORT || 9999;
    process.stdout.write(`Connecting to Redis on ${host}:${port}\n`);
    const client = redis.createClient({
      host,
      port,
    });
    await client.connect();
    client.on('connect', () => {
      process.stdout.write(`Redis client connected on ${host}:${port}\n`);
    });
    client.on('error', (error) => {
      process.stdout.write('Redis Error:', error);
    });
    return client;
  }

  return {
    getClient: async () => {
      if (!redisClient) {
        redisClient = await createInstance();
      }
      return redisClient;
    },
  };
})();

module.exports = redisFactory;
