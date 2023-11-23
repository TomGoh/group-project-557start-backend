const { deleteCache, setCache, getCache } = require('../../utils/redisMaintenance');
const dbFunctions = require('../dbFunctions');

async function getPostByPostId(postId) {
  const cachedPost = await getCache(`post:${postId}`);
  if (cachedPost) {
    return cachedPost;
  }
  const response = await dbFunctions.getOneObjectById('post', postId);
  await setCache(`post:${postId}`, response, 1800);
  return response;
}

async function getAllPosts() {
  return dbFunctions.getAllObjects('post');
}

async function getPostsByUserId(userId) {
  const cachedPosts = await getCache(`post:${userId}`);
  if (cachedPosts) {
    return cachedPosts;
  }
  const response = await dbFunctions.getManyObjectsByQuery('post', { userID: userId });
  await setCache(`post:${userId}`, response, 1800);
  return response;
}

async function getOneRandomPost() {
  return dbFunctions.getOneRandomObject('post');
}

async function createOnePost(post) {
  return dbFunctions.insertOneObject('post', post);
}

async function deleteOnePostById(postId) {
  const post = await dbFunctions.getOneObjectById('post', postId);
  if (post == null) {
    return "post doesn't exist";
  }
  await deleteCache(`post:${postId}`);
  await deleteCache(`post:${post.userID}`);
  await deleteCache(`comment:${postId}`);
  await deleteCache(`hide:${postId}`);
  return dbFunctions.deleteOneObjectById('post', postId);
}

async function updateOnePostLikeCount(postId, likeCount) {
  await deleteCache(`post:${postId}`);
  const post = await dbFunctions.getOneObjectById('post', postId);
  await deleteCache(`post:${post.userID}`);
  return dbFunctions.updateOneFieldById('post', postId, 'likeCount', likeCount);
}

async function updateOnePostById(postId, post) {
  await deleteCache(`post:${postId}`);
  await deleteCache(`post:${post.userID}`);
  return dbFunctions.updateOneObjectById('post', postId, post);
}

module.exports = {
  getPostByPostId,
  getAllPosts,
  getPostsByUserId,
  getOneRandomPost,
  createOnePost,
  deleteOnePostById,
  updateOnePostLikeCount,
  updateOnePostById,
};
