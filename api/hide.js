const express = require('express');
const { methodLogging } = require('../utils/logger');
const hideOperations = require('../dbUtils/hide/hideOperations');
const postOperations = require('../dbUtils/post/postOperations');
const { getUserByUserId } = require('../dbUtils/user/userOperations');

const hideRouter = express.Router();

hideRouter.get('/', async (req, res) => {
  methodLogging('GET', req);
  const userId = req.query.userID;
  const postId = req.query.postID;
  if (!userId && !postId) {
    const response = await hideOperations.getAllHides();
    return res.json(response);
  }
  if (userId && !postId) {
    const response = await hideOperations.getHidesByUserId(userId);
    return res.json(response);
  }
    return res.json({ error: 'Missing userID parameter' });
});

hideRouter.get('/post', async (req, res) => {
  methodLogging('GET', req);
  const { userID, postID } = req.query;
  const hide = await hideOperations.getPostHide(postID, userID);
  return res.json(hide);
});

hideRouter.put('/post', async (req, res) => {
  methodLogging('GET', req);
  const { userId, postId, hide } = req.body.params;
  const user = await getUserByUserId(userId);
  const post = await postOperations.getPostByPostId(postId);
  const h = await hideOperations.getPostHide(postId, userId);
  if (hide && !h) {
    await hideOperations.createOneHide({ userID: user._id, postID: post._id });
  } else if (!hide && h) {
    await hideOperations.deleteOneHideByUserIdAndPostId(userId, postId);
  }
  return res.json(hide);
});

hideRouter.post('/', async (req, res) => {
  methodLogging('POST', req);
  const { userID, postID } = req.body;
  if (!userID || !postID) {
    return res.json({ error: 'Missing userID or postID parameter' });
  }
  const userPosts = await postOperations.getPostsByUserId(userID);
  const post = userPosts.find((p) => p._id.toString() === postID);
  if (post) {
    return res.json({ error: 'Cannot hide own posts' });
  }
  const hide = {
    userID,
    postID,
  };
  const response = await hideOperations.createOneHide(hide);
  return res.json(response);
});

hideRouter.delete('/', async (req, res) => {
  methodLogging('DELETE', req);
  const { userID, postID } = req.body;
  if (!userID || !postID) {
    return res.json({ error: 'Missing userID or postID parameter' });
  }
  const response = await hideOperations.deleteOneHideByUserIdAndPostId(userID, postID);
  return res.json(response);
});

hideRouter.delete('/:id', async (req, res) => {
  methodLogging('DELETE', req);
  const response = await hideOperations.deleteOneHideById(req.params.id);
  return res.json(response);
});

module.exports = { hideRouter };