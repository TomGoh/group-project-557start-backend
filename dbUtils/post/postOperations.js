const { deleteCache, setCache, getCache } = require('../../utils/redisMaintenance');
const dbFunctions = require('../dbFunctions');

/**
 * Get a post by its id
 * @param postId post id
 * @returns {Promise<*>} post object
 */
async function getPostByPostId(postId) {
  const cachedPost = await getCache(`post:${postId}`);
  if (cachedPost) {
    return cachedPost;
  }
  const response = await dbFunctions.getOneObjectById('post', postId);
  await setCache(`post:${postId}`, response, 1800);
  return response;
}

/**
 * Get all posts
 * @returns {Promise<*>} array of post objects
 */
async function getAllPosts() {
  return dbFunctions.getAllObjects('post');
}

/**
 * Get all posts of a user by user id
 * @param userId user id
 * @returns {Promise<*>} array of post objects
 */
async function getPostsByUserId(userId) {
  const cachedPosts = await getCache(`post:${userId}`);
  if (cachedPosts) {
    return cachedPosts;
  }
  const response = await dbFunctions.getManyObjectsByQuery('post', { userID: userId });
  await setCache(`post:${userId}`, response, 1800);
  return response;
}

async function getUsersPosts(userIDs, page = 1, size = 60) {
  const response = await dbFunctions.getPaginatedObjects('post', { userID: { $in: userIDs } }, page, size);
  return response;
}

/**
 * Get one random post
 * @returns {Promise<*>} post object
 */
async function getOneRandomPost() {
  return dbFunctions.getOneRandomObject('post');
}

/**
 * Create a post
 * @param post post object
 * @returns {Promise<*>} post object
 */
async function createOnePost(post) {
  const postCreation = await dbFunctions.insertOneObject('post', post);
  const userInforUpdate = await dbFunctions.increaseOneFieldById('user', post.userID, 'postCount', 1);
  await deleteCache(`post:${post.userID}`);
  await deleteCache(`user:${post.userID}`);
  if (postCreation && userInforUpdate) {
    return postCreation;
  }
  return null;
}

/**
 * Delete a post by its id
 * @param postId post id
 * @returns {Promise<*|string>} success message or error message
 */
async function deleteOnePostById(postId) {
  const post = await dbFunctions.getOneObjectById('post', postId);
  if (post == null) {
    return "post doesn't exist";
  }
  await deleteCache(`post:${postId}`);
  await deleteCache(`post:${post.userID}`);
  await deleteCache(`comment:${postId}`);
  await deleteCache(`hide:${postId}`);
  await deleteCache(`user:${post.userID}`);
  const deleteResult = dbFunctions.deleteOneObjectById('post', postId);
  const userInforUpdate = dbFunctions.decreaseOneFieldById('user', post.userID, 'postCount');
  if (deleteResult && userInforUpdate) {
    return deleteResult;
  }
  return 'delete failed';
}

/**
 * Update the like count of a post
 * @param postId post id
 * @param likeCount new like count
 * @returns {Promise<*>} post object
 */
async function updateOnePostLikeCount(postId, likeCount) {
  await deleteCache(`post:${postId}`);
  const post = await dbFunctions.getOneObjectById('post', postId);
  await deleteCache(`post:${post.userID}`);
  return dbFunctions.updateOneFieldById('post', postId, 'likeCount', likeCount);
}

/**
 * Update a post by its id
 * @param postId post id
 * @param post post object
 * @returns {Promise<*>} post object
 */
async function updateOnePostById(postId, post) {
  await deleteCache(`post:${postId}`);
  await deleteCache(`post:${post.userID}`);
  return dbFunctions.updateOneObjectById('post', postId, post);
}

module.exports = {
  getUsersPosts,
  getPostByPostId,
  getAllPosts,
  getPostsByUserId,
  getOneRandomPost,
  createOnePost,
  deleteOnePostById,
  updateOnePostLikeCount,
  updateOnePostById,
};
