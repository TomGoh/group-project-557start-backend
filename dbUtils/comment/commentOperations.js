const { deleteCache, setCache, getCache } = require('../../utils/redisMaintenance');
const dbFunctions = require('../dbFunctions');

/**
 * Get all comments
 * @returns {Promise<*>} all comments
 */
async function getAllComments() {
  return dbFunctions.getAllObjects('comment');
}

/**
 * Get comment by commentId
 * @param commentId commentId
 * @returns {Promise<*>} comment
 */
async function getCommentById(commentId) {
  return dbFunctions.getOneObjectById('comment', commentId);
}

/**
 * Get all comments of a post by postId
 * @param postId postId
 * @returns {Promise<*>} array of comments
 */
async function getCommentsByPostId(postId) {
  const cachedComments = await getCache(`comment:${postId}`);
  if (cachedComments) {
    return cachedComments;
  }
  const response = await dbFunctions.getManyObjectsByQuery('comment', { postID: postId });
  await setCache(`comment:${postId}`, response, 1800);
  return response;
}

/**
 * Get all comments of a post by postId and userId
 * @param userId  userId
 * @param postId postId
 * @returns {Promise<*>} array of comments
 */
async function getCommentsByUserIdAndPostId(userId, postId) {
  const cachedComments = await getCache(`comment:${postId}`);
  if (cachedComments) {
    return JSON.parse(cachedComments)
      .filter((comment) => comment.userID === userId);
  }
  const response = await dbFunctions.getManyObjectsByQuery('comment', { userID: userId, postID: postId });
  await setCache(`comment:${postId}`, response, 1800);
  return response;
}

/**
 * Get all comments of a user by userId
 * @param userId userId
 * @returns {Promise<*>} array of comments
 */
async function getCommentsByUserId(userId) {
  return await dbFunctions.getManyObjectsByQuery('comment', { userID: userId });
}

/**
 * Create a comment
 * @param comment comment object
 * @returns {Promise<*>} result
 */
async function createOneComment(comment) {
  await deleteCache(`comment:${comment.postID}`);
  await deleteCache(`post:${comment.postID}`);
  const post = await dbFunctions.getOneObjectById('post', comment.postID);
  await deleteCache(`comment:${comment.userID}`);
  await deleteCache(`post:${post.userID}`);
  return await dbFunctions.insertOneObject('comment', comment) && dbFunctions.increaseOneFieldById('post', comment.postID, 'commentCount');
}

/**
 * Delete a comment by commentId
 * @param commentId commentId
 * @returns {Promise<*|string>} result
 */
async function deleteOneCommentById(commentId) {
  const result = await dbFunctions.checkOneObjectExistByQuery('comment', { _id: commentId });
  if (result != null) {
    const comment = await dbFunctions.getOneObjectById('comment', result._id);
    const commentRemoval = await dbFunctions.deleteOneObjectById('comment', result._id);
    const commentCountResult = await dbFunctions.decreaseOneFieldById('post', comment.postID, 'commentCount');
    const post = await dbFunctions.getOneObjectById('post', comment.postID);
    await deleteCache(`post:${post.userID}`);
    await deleteCache(`post:${comment.postID}`);
    await deleteCache(`comment:${comment.userID}`);
    await deleteCache(`comment:${comment.postID}`);
    if (commentRemoval && commentCountResult) {
      return commentRemoval;
    }
  }
  return "comment doesn't exist";
}

/**
 * Delete a comment by postId and userId
 * @param postId postId
 * @param userId userId
 * @returns {Promise<*|string>} result
 */
async function deleteOneCommentByPostIdAndUserId(postId, userId) {
  const comment = await dbFunctions.getOneObjectByQuery('comment', { postID: postId, userID: userId });
  const commentRemoval = await dbFunctions.deleteOneObjectById('comment', { postID: postId, userID: userId });
  const commentCountResult = await dbFunctions.decreaseOneFieldById('post', postId, 'commentCount');
  const post = await dbFunctions.getOneObjectById('post', postId);
  await deleteCache(`post:${post.userID}`);
  await deleteCache(`post:${comment.postID}`);
  await deleteCache(`comment:${comment.userID}`);
  await deleteCache(`comment:${comment.postID}`);
  if (commentRemoval && commentCountResult) {
    return commentRemoval;
  }
  return "comment doesn't exist";
}

module.exports = {
  getAllComments,
  getCommentById,
  getCommentsByPostId,
  createOneComment,
  deleteOneCommentById,
  deleteOneCommentByPostIdAndUserId,
  getCommentsByUserIdAndPostId,
  getCommentsByUserId,
};
