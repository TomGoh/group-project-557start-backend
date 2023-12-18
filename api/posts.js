const express = require('express');
const { methodLogging, logger } = require('../utils/logger');
const { getUserByUserId } = require('../dbUtils/user/userOperations');
const {
  getPostsByUserId, getAllPosts, getPostByPostId,
  createOnePost, deleteOnePostById, updateOnePostById,
} = require('../dbUtils/post/postOperations');
const {
  queryValidator, paramValidator, postBodyValidator, deleteParamValidator,
} = require('../utils/paramValidator');

const postRouter = express.Router();
postRouter.get('/', queryValidator, async (req, res) => {
  methodLogging('GET', req);
  try {
    const userid = req.query.userID;
    if (userid) {
      const user = await getUserByUserId(userid);
      if (!user) {
        return res.json({ error: 'User does not exist' });
      }
      const usersPost = await getPostsByUserId(userid);
      return res.json(usersPost);
    }
    const allPosts = await getAllPosts();
    return res.json(allPosts);
  } catch (err) {
    logger.error(err.toString());
    return res.json({ error: err.toString() });
  }
});

postRouter.get('/:id', paramValidator, async (req, res) => {
  methodLogging('GET', req);
  if (!req.params.id) {
    return res.json({ error: 'Missing id parameter' });
  }
  try {
    const responseData = await getPostByPostId(req.params.id);
    return res.json(responseData);
  } catch (err) {
    logger.error(err.toString());
    return res.json({ error: err.toString() });
  }
});

postRouter.post('/', postBodyValidator, async (req, res) => {
  methodLogging('POST', req);
  try {
    const post = req.body;
    if (post.userName === undefined) {
      const user = await getUserByUserId(post.userID);
      post.userName = user.userName;
    }
    const result = await createOnePost(post);
    res.json(result);
  } catch (err) {
    res.json({ error: err.toString() });
  }
});

postRouter.delete('/:id', paramValidator, deleteParamValidator, async (req, res) => {
  methodLogging('DELETE', req);
  try {
    const result = await deleteOnePostById(req.params.id);
    return res.json(result);
  } catch (err) {
    logger.error(err.toString());
    return res.json({ error: err.toString() });
  }
});

postRouter.patch('/:id', paramValidator, postBodyValidator, deleteParamValidator, async (req, res) => {
  methodLogging('PATCH', req);
  try {
    const patchData = req.body;
    const post = await getPostByPostId(req.params.id);
    if (!post) {
      return res.json({ error: 'Post does not exist' });
    }
    const updatedPost = {
      ...post._doc,
      ...patchData,
    };
    const result = await updateOnePostById(req.params.id, updatedPost);
    return res.json(result);
  } catch (err) {
    logger.error(err.toString());
    return res.json({ error: err.toString() });
  }
});

module.exports = { postRouter };
