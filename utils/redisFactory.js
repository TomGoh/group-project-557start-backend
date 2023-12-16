const redis = require('redis');
const { redisLite } = require('./RedisLite');

const redisFactory = (() => {
  let redisClient;

  async function createInstance() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = process.env.REDIS_PORT || 6379;
    process.stdout.write(`Connecting to Redis on ${host}:${port}\n`);
    let client;
    if (host !== 'localhost') {
      client = redis.createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
          host,
          port,
        },
      });
    } else {
      client = redis.createClient({
        host,
        port,
      });
    }

    await client.connect();
    client.on('connect', () => {
      process.stdout.write(`Redis client connected on ${host}:${port}\n`);
    });
    return client;
  }

  return {
    getClient: async () => {
      if (!redisClient) {
        try {
          redisClient = await createInstance();
        } catch (err) {
          process.stdout.write('Cannot connect to Redis. Using RedisLite instead.\n');
          redisClient = redisLite;
        }
      }
      return redisClient;
    },
  };
})();

module.exports = redisFactory;
