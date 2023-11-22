const express = require('express');
const redisFactory = require('../utils/redisFactory');

const hideRouter = express.Router();
const dbLib = require('../dbUtils/crud');
const { methodLogging } = require('../utils/logger');

hideRouter.get('/', async (req, res) => {
  methodLogging('GET', req);
  const userId = req.query.userID;
  const postId = req.query.postID;
  const redisClient = await redisFactory.getClient();
  if (!userId && !postId) {
    const response = await dbLib.getAllHides();
    return res.json(response);
  }
  if (userId && !postId) {
    const cachedHide = await redisClient.get(`hide:${userId}`);
    if (cachedHide) {
      return res.json(JSON.parse(cachedHide));
    }
    const response = await dbLib.getHidesByUserId(userId);
    await redisClient.set(`hide:${userId}`, JSON.stringify(response));
    await redisClient.expire(`hide:${userId}`, 1800);
    return res.json(response);
  }
    return res.json({ error: 'Missing userID parameter' });
});

hideRouter.post('/', async (req, res) => {
  methodLogging('POST', req);
  const redisClient = await redisFactory.getClient();
  const { userID, postID } = req.body;
  if (!userID || !postID) {
    return res.json({ error: 'Missing userID or postID parameter' });
  }
  let userPosts = await redisClient.get(`post:${userID}`);
  if (!userPosts) {
    userPosts = await dbLib.getObjectsByQuery('post', { userID });
    await redisClient.set(`post:${userID}`, JSON.stringify(userPosts));
  }
  const post = userPosts.find((p) => p._id.toString() === postID);
  if (post) {
    return res.json({ error: 'Cannot hide own posts' });
  }
  const hide = {
    userID,
    postID,
  };
  const response = await dbLib.createOneHide(hide);
  await redisClient.del(`hide:${userID}`);
  return res.json(response);
});

module.exports = { hideRouter };
