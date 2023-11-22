/* eslint-disable no-underscore-dangle */
const redisFactory = require('../utils/redisFactory');
const {
  getOneObjectById, insertOneObject,
  deleteOneObjectById,
  increaseOneFieldById,
  checkOneObjectExistByQuery, checkOneObjectExistById,
  getManyObjectsByQuery, deleteManyObjectsByQuery,
  getOneObjectByQuery,
  updateOneFieldById,
  getOneRandomObject,
  decreaseOneFieldById,
} = require('./dbFunctions');

async function createOneUser(user) {
  return insertOneObject('user', user);
}

async function createOneLogin(login) {
  return insertOneObject('login', login);
}

async function createOnePost(post) {
  const postResult = await insertOneObject('post', post);
  const { userID } = post;
  const redisClient = await redisFactory.getClient();
  await redisClient.del(`user:${userID}`);
  await redisClient.del(`post:${userID}`);
  const postCountResult = await increaseOneFieldById('user', post.userID, 'postCount');
  if (postResult && postCountResult) {
    return postResult;
  }
  return postResult;
}

async function createOneComment(comment) {
  if (comment.userID === undefined || comment.postID === undefined) {
    return null;
  }
  const { postID } = comment;
  const redisClient = await redisFactory.getClient();
  await redisClient.del(`post:${postID}`);
  await redisClient.del(`post:${comment.userID}`);
  const commentResult = await insertOneObject('comment', comment);
  const commentCountResult = await increaseOneFieldById('post', comment.postID, 'commentCount');
  if (commentResult && commentCountResult) {
    return commentResult;
  }
  return commentResult;
}

async function createOneFollowing(following) {
  if (following.userID === following.followingID) {
    return false;
  }
  const redisClient = await redisFactory.getClient();
  const followingResult = await insertOneObject('following', following);
  const followingCountResult = await increaseOneFieldById('user', following.followerID, 'followingCount');
  const followerCountResult = await increaseOneFieldById('user', following.followingID, 'followerCount');
  await redisClient.del(`user:${following.followerID}`);
  await redisClient.del(`user:${following.followingID}`);
  return followingResult && followingCountResult && followerCountResult;
}

async function createOneLike(like) {
  const likeResult = await insertOneObject('like', like);
  const likeCountResult = await increaseOneFieldById('post', like.postID, 'likeCount');
  const post = await getOneObjectById('post', like.postID);
  const redisClient = await redisFactory.getClient();
  await redisClient.del(`post:${like.postID}`);
  await redisClient.del(`post:${post.userID}`);
  return likeResult && likeCountResult;
}

async function deleteOneUserById(userId) {
  const user = await getOneObjectById('user', userId);
  const commentResult = await deleteManyObjectsByQuery('comment', { userID: userId });
  const followingResult = await deleteManyObjectsByQuery('following', { $or: [{ followerID: userId }, { followingID: userId }] });
  const likeResult = await deleteManyObjectsByQuery('like', { userID: userId });
  const postResult = await deleteManyObjectsByQuery('post', { userID: userId });
  const userResult = await deleteOneObjectById('user', userId);
  return user && userResult && postResult && commentResult && followingResult && likeResult;
}

async function deleteOnePostById(postID) {
  const post = await getOneObjectById('post', postID);
  const postResult = await deleteOneObjectById('post', postID);
  const postCountResult = await decreaseOneFieldById('user', post.userID, 'postCount');
  const redisClient = await redisFactory.getClient();
  await redisClient.del(`user:${post.userID}`);
  await redisClient.del(`post:${post.userID}`);
  await redisClient.del(`post:${postID}`);
  return post && postResult && postCountResult;
}

async function deleteOneFollowingByFollowerIDAndFollowingID(followingId, followerId) {
  const result = await checkOneObjectExistByQuery('following', { followingID: followingId, followerID: followerId });
  if (result != null) {
    const followingRemoval = await deleteOneObjectById('following', result._id);
    const followerCountResult = await decreaseOneFieldById('user', followerId, 'followingCount');
    const followingCountResult = await decreaseOneFieldById('user', followingId, 'followerCount');
    const redisClient = await redisFactory.getClient();
    await redisClient.del(`user:${followerId}`);
    await redisClient.del(`user:${followingId}`);
    if (followingRemoval && followerCountResult && followingCountResult) {
      return followingRemoval;
    }
  }
  return "following doesn't exist";
}

async function deleteOneFollowingById(id) {
  const result = await checkOneObjectExistByQuery('following', { _id: id });
  if (result != null) {
    const following = await getOneObjectById('following', result._id);
    const followingRemoval = await deleteOneObjectById('following', following._id);
    const followerCountResult = await decreaseOneFieldById('user', following.followerID, 'followingCount');
    const followingCountResult = await decreaseOneFieldById('user', following.followingID, 'followerCount');
    const redisClient = await redisFactory.getClient();
    await redisClient.del(`user:${following.followerID}`);
    await redisClient.del(`user:${following.followingID}`);
    if (followingRemoval && followerCountResult && followingCountResult) {
      return followingRemoval;
    }
  }
  return "following doesn't exist";
}

async function deleteOneLikeById(likeId) {
  const result = await checkOneObjectExistByQuery('like', { _id: likeId });
  if (result != null) {
    const like = await getOneObjectById('like', result._id);
    const likeRemoval = await deleteOneObjectById('like', like._id);
    const likeCountResult = await decreaseOneFieldById('post', like.postID, 'likeCount');
    const post = await getOneObjectById('post', like.postID);
    const redisClient = await redisFactory.getClient();
    await redisClient.del(`post:${like.postID}`);
    await redisClient.del(`post:${post.userID}`);
    if (likeRemoval && likeCountResult) {
      return likeRemoval;
    }
  }
  return "like doesn't exist";
}

async function deleteOneLikeByUserIdAndPostId(userId, postId) {
  const result = await checkOneObjectExistByQuery('like', { userID: userId, postID: postId });
  if (result != null) {
    const likeRemoval = await deleteOneObjectById('like', result._id);
    const likeCountResult = await decreaseOneFieldById('post', postId, 'likeCount');
    const redisClient = await redisFactory.getClient();
    const post = await getOneObjectById('post', postId);
    await redisClient.del(`post:${postId}`);
    await redisClient.del(`post:${post.userID}`);
    if (likeRemoval && likeCountResult) {
      return likeRemoval;
    }
  }
  return "like doesn't exist";
}

async function deleteOneCommentById(commentId) {
  const result = await checkOneObjectExistByQuery('comment', { _id: commentId });
  if (result != null) {
    const comment = await getOneObjectById('comment', result._id);
    const commentRemoval = await deleteOneObjectById('comment', result._id);
    const commentCountResult = await decreaseOneFieldById('post', comment.postID, 'commentCount');
    const post = await getOneObjectById('post', comment.postID);
    const redisClient = await redisFactory.getClient();
    await redisClient.del(`post:${comment.postID}`);
    await redisClient.del(`post:${post.userID}`);
    if (commentRemoval && commentCountResult) {
      return commentRemoval;
    }
  }
  return "comment doesn't exist";
}

async function getObjectsByQuery(modelName, query) {
  return getManyObjectsByQuery(modelName, query);
}

async function getAllObjects(modelName) {
  return getManyObjectsByQuery(modelName, {});
}

async function userLogin(email) {
  return getOneObjectByQuery('login', { email });
}

async function userSignUp(email, password) {
  return insertOneObject('login', { email, password });
}

async function updateOneUserMotto(userId, motto) {
  const redisClient = await redisFactory.getClient();
  await redisClient.del(`user:${userId}`);
  return updateOneFieldById('user', userId, 'userMotto', motto);
}

async function updateOnePostLikeCount(postId, newLikeCount) {
  const redisClient = await redisFactory.getClient();
  await redisClient.del(`post:${postId}`);
  return updateOneFieldById('post', postId, 'likeCount', newLikeCount);
}

async function getOneRandomUser() {
  return getOneRandomObject('user');
}

async function getOneRandomPost() {
  return getOneRandomObject('post');
}

async function checkEmailExistence(email) {
  return checkOneObjectExistByQuery('user', { email });
}

async function checkUsernameExistence(username) {
  return checkOneObjectExistByQuery('user', { userName: username });
}

async function getOneHideByUserIdAndPostId(userId, postId) {
  return getOneObjectByQuery('hide', { userID: userId, postID: postId });
}

async function getHidesByUserId(userId) {
  return getObjectsByQuery('hide', { userID: userId });
}

async function getAllHides() {
  return getAllObjects('hide');
}

async function createOneHide(hide) {
  return insertOneObject('hide', hide);
}

module.exports = {
  createOneUser,
  createOnePost,
  createOneComment,
  createOneFollowing,
  createOneLike,
  deleteOnePostById,
  deleteOneFollowingByFollowerIDAndFollowingID,
  deleteOneLikeById,
  deleteOneLikeByUserIdAndPostId,
  deleteOneFollowingById,
  getAllObjects,
  getObjectsByQuery,
  deleteOneUserById,
  deleteOneCommentById,
  checkOneObjectExistById,
  getOneObjectByQuery,
  createOneLogin,
  userLogin,
  userSignUp,
  updateOneUserMotto,
  updateOnePostLikeCount,
  getOneRandomUser,
  getOneRandomPost,
  checkEmailExistence,
  checkUsernameExistence,
  getOneHideByUserIdAndPostId,
  getHidesByUserId,
  getAllHides,
  createOneHide,
};
