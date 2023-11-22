const express = require('express');
const redisFactory = require('../utils/redisFactory');

const postRouter = express.Router();
const dbLib = require('../dbUtils/crud');
const { methodLogging, logger } = require('../utils/logger');
const { getObjectsByQuery } = require('../dbUtils/crud');
const { getManyObjectsByQuery, updateOneObjectById } = require('../dbUtils/dbFunctions');

postRouter.get('/', async (req, res) => {
  methodLogging('GET', req);
  try {
    const userid = req.query.userID;
    const username = req.query.userName;
    const redisClient = await redisFactory.getClient();
    if (userid) {
      const user = await getObjectsByQuery('user', { _id: userid });
      if (!user) {
        return res.json({ error: 'User does not exist' });
      }
      const cachedPost = await redisClient.get(`post:${userid}`);
      if (cachedPost) {
        return res.json(JSON.parse(cachedPost));
      }
      const usersPost = await getObjectsByQuery('post', { userID: userid });
      await redisClient.set(`post:${userid}`, JSON.stringify(usersPost));
      await redisClient.expire(`post:${userid}`, 1800);
      return res.json(usersPost);
    }
    if (username) {
      const user = await getObjectsByQuery('user', { userName: username });
      if (!user) {
        return res.json({ error: 'User does not exist' });
      }
      const usersPost = await getObjectsByQuery('post', { userName: username });
      return res.json(usersPost);
    }
    const allPosts = await getObjectsByQuery('post', {});
    return res.json(allPosts);
  } catch (err) {
    logger.error(err.toString());
    return res.json({ error: err.toString() });
  }
});

postRouter.get('/:id', async (req, res) => {
  methodLogging('GET', req);
  if (!req.params.id) {
    return res.json({ error: 'Missing id parameter' });
  }
  const redisClient = await redisFactory.getClient();
  const redisResult = await redisClient.get(`post:${req.params.id}`);
  if (redisResult) {
    return res.json(JSON.parse(redisResult));
  }
  try {
    const responseData = await getManyObjectsByQuery('post', { _id: req.params.id });
    await redisClient.set(`post:${req.params.id}`, JSON.stringify(responseData));
    await redisClient.expire(`post:${req.params.id}`, 1800);
    return res.json(responseData);
  } catch (err) {
    logger.error(err.toString());
    return res.json({ error: err.toString() });
  }
});

postRouter.post('/', async (req, res) => {
  methodLogging('POST', req);
  try {
    const post = req.body;
    if (post.userName === undefined) {
      const user = await getObjectsByQuery('user', { _id: post.userID });
      post.userName = user[0].userName;
    }
    const result = await dbLib.createOnePost(post);
    res.json(result);
  } catch (err) {
    res.json({ error: err.toString() });
  }
});

postRouter.delete('/:id', async (req, res) => {
  methodLogging('DELETE', req);
  try {
    if (await dbLib.checkOneObjectExistById('post', req.params.id) === null) {
      return res.json({ error: 'Post does not exist' });
    }
    const result = await dbLib.deleteOnePostById(req.params.id);
    return res.json(result);
  } catch (err) {
    logger.error(err.toString());
    return res.json({ error: err.toString() });
  }
});

postRouter.patch('/:id', async (req, res) => {
  methodLogging('PATCH', req);
  try {
    const patchData = req.body;
    const post = await dbLib.getObjectsByQuery('post', { _id: req.params.id });
    if (!post) {
      return res.json({ error: 'Post does not exist' });
    }
    const updatedPost = {
      ...post,
      ...patchData,
    };
    const result = await updateOneObjectById('post', req.params.id, updatedPost);
    return res.json(result);
  } catch (err) {
    logger.error(err.toString());
    return res.json({ error: err.toString() });
  }
});

module.exports = { postRouter };
