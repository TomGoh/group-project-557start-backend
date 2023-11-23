const { deleteCache, setCache, getCache } = require('../../utils/redisMaintenance');
const dbFunctions = require('../dbFunctions');

async function getAllComments() {
  return dbFunctions.getAllObjects('comment');
}

async function getCommentById(commentId) {
  return dbFunctions.getOneObjectById('comment', commentId);
}

async function getCommentsByPostId(postId) {
  const cachedComments = await getCache(`comment:${postId}`);
  if (cachedComments) {
    return cachedComments;
  }
  const response = await dbFunctions.getManyObjectsByQuery('comment', { postID: postId });
  await setCache(`comment:${postId}`, response, 1800);
  return response;
}

async function getCommentsByUserIdAndPostId(userId, postId) {
  const cachedComments = await getCache(`comment:${postId}`);
  if (cachedComments) {
    const filteredComments = JSON.parse(cachedComments)
      .filter((comment) => comment.userID === userId);
    return filteredComments;
  }
  const response = await dbFunctions.getManyObjectsByQuery('comment', { userID: userId, postID: postId });
  await setCache(`comment:${postId}`, response, 1800);
  return response;
}

async function getCommentsByUserId(userId) {
  const response = await dbFunctions.getManyObjectsByQuery('comment', { userID: userId });
  return response;
}

async function createOneComment(comment) {
  await deleteCache(`comment:${comment.postID}`);
  await deleteCache(`post:${comment.postID}`);
  const post = await dbFunctions.getOneObjectById('post', comment.postID);
  await deleteCache(`comment:${comment.userID}`);
  await deleteCache(`post:${post.userID}`);
  return dbFunctions.insertOneObject('comment', comment) && dbFunctions.increaseOneFieldById('post', comment.postID, 'commentCount');
}

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
