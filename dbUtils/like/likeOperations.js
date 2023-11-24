const { deleteCache } = require('../../utils/redisMaintenance');
const dbFunctions = require('../dbFunctions');

/**
 * Get like by id
 * @param likeId like id
 * @returns {Promise<*>}  like object
 */
async function getLikeById(likeId) {
  return dbFunctions.getOneObjectById('like', likeId);
}

/**
 * Get likes of a post by post id
 * @param postId post id
 * @returns {Promise<*>} array of like objects
 */
async function getLikeByPostId(postId) {
  return dbFunctions.getManyObjectsByQuery('like', { postID: postId });
}

/**
 * Get likes of a user by user id
 * @param userId user id
 * @returns {Promise<*>} array of like objects
 */
async function getLikeByUserId(userId) {
  return dbFunctions.getManyObjectsByQuery('like', { userID: userId });
}

/**
 * Get like of a post by post id and userid of the user who liked it
 * @param postId post id
 * @param userId user id
 * @returns {Promise<*>} like object
 */
async function getLikeByPostIdAndUserId(postId, userId) {
  return await dbFunctions.getManyObjectsByQuery('like', { postID: postId, userID: userId });
}

/**
 * Create a like
 * @param like like object
 * @returns {Promise<*>} like object
 */
async function createOneLike(like) {
  const post = await dbFunctions.getOneObjectById('post', like.postID);
  await deleteCache(`post:${post.userID}`);
  await deleteCache(`post:${like.userID}`);
  await deleteCache(`post:${like.postID}`);
  return await dbFunctions.insertOneObject('like', like) && dbFunctions.increaseOneFieldById('post', like.postID, 'likeCount');
}

/**
 * Delete a like by id
 * @param likeId like id
 * @returns {Promise<*|string>} true if successful, error message or false if not
 */
async function deleteOneLikeById(likeId) {
  const result = await dbFunctions.checkOneObjectExistByQuery('like', { _id: likeId });
  if (result != null) {
    const like = await dbFunctions.getOneObjectById('like', result._id);
    const likeRemoval = await dbFunctions.deleteOneObjectById('like', like._id);
    const likeCountResult = await dbFunctions.decreaseOneFieldById('post', like.postID, 'likeCount');
    const post = await dbFunctions.getOneObjectById('post', like.postID);
    await deleteCache(`post:${post.userID}`);
    await deleteCache(`post:${like.userID}`);
    await deleteCache(`post:${like.postID}`);
    if (likeRemoval && likeCountResult) {
      return likeRemoval;
    }
  }
  return "like doesn't exist";
}

/**
 * Delete a like by user id and post id
 * @param userId user id
 * @param postId post id
 * @returns {Promise<*|string>} true if successful, error message or false if not
 */
async function deleteOneLikeByUserIdAndPostId(userId, postId) {
  const result = await dbFunctions.checkOneObjectExistByQuery('like', { userID: userId, postID: postId });
  if (result != null) {
    const likeRemoval = await dbFunctions.deleteOneObjectById('like', result._id);
    const likeCountResult = await dbFunctions.decreaseOneFieldById('post', postId, 'likeCount');
    await deleteCache(`post:${postId}`);
    const post = await dbFunctions.getOneObjectById('post', postId);
    await deleteCache(`post:${post.userID}`);
    await deleteCache(`post:${userId}`);
    await deleteCache(`post:${postId}`);
    if (likeRemoval && likeCountResult) {
      return likeRemoval;
    }
  }
  return "like doesn't exist";
}

module.exports = {
  getLikeById,
  getLikeByPostId,
  getLikeByUserId,
  getLikeByPostIdAndUserId,
  createOneLike,
  deleteOneLikeById,
  deleteOneLikeByUserIdAndPostId,
};
