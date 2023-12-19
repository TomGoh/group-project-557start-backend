const express = require('express');
const { methodLogging } = require('../utils/logger');
const hideOperations = require('../dbUtils/hide/hideOperations');
const postOperations = require('../dbUtils/post/postOperations');
const {
  queryValidator, hideBodyValidator, paramValidator, deleteParamValidator, hideParamValidator,
} = require('../utils/paramValidator');

const hideRouter = express.Router();

hideRouter.get('/', queryValidator, async (req, res) => {
  methodLogging('GET', req);
  const userId = req.query.userID;
  const postId = req.query.postID;
  if (!userId && !postId) {
    const response = await hideOperations.getAllHides();
    return res.json(response);
  }
  if (userId && postId) {
    const response = await hideOperations.checkHideByUserIdAndPostId(userId, postId);
    if (response) {
      return res.json({ postID: postId, userID: userId });
    }
    return res.json({ error: 'No hide relationship found' });
  }
  if (!postId) {
    const response = await hideOperations.getHidesByUserId(userId);
    return res.json(response);
  }
    return res.json({ error: 'Missing userID parameter' });
});

hideRouter.post('/', hideBodyValidator, async (req, res) => {
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

hideRouter.delete('/', hideParamValidator, deleteParamValidator, async (req, res) => {
  methodLogging('DELETE', req);
  const { userID, postID } = req.query;
  if (!userID || !postID) {
    return res.json({ error: 'Missing userID or postID parameter' });
  }
  const cookies = req.headers.cookie;
  let currentUserID;
  cookies.split(';').forEach((element) => {
    if (element.includes('_id')) {
      [, currentUserID] = element.split('=');
    }
  });
  if (currentUserID !== userID) {
    return res.json({ error: 'Cannot delete hide relationship for other users' });
  }
  const response = await hideOperations.deleteOneHideByUserIdAndPostId(userID, postID);
  return res.json(response);
});

hideRouter.delete('/:id', paramValidator, deleteParamValidator, async (req, res) => {
  methodLogging('DELETE', req);
  const response = await hideOperations.deleteOneHideById(req.params.id);
  return res.json(response);
});

module.exports = { hideRouter };
