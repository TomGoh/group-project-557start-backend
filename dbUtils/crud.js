/* eslint-disable no-underscore-dangle */
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
  const followingResult = await insertOneObject('following', following);
  const followingCountResult = await increaseOneFieldById('user', following.followerID, 'followingCount');
  const followerCountResult = await increaseOneFieldById('user', following.followingID, 'followerCount');
  return followingResult && followingCountResult && followerCountResult;
}

async function createOneLike(like) {
  const likeResult = await insertOneObject('like', like);
  const likeCountResult = await increaseOneFieldById('post', like.postID, 'likeCount');
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
  return post && postResult && postCountResult;
}

async function deleteOneFollowingByFollowerIDAndFollowingID(followingId, followerId) {
  const result = await checkOneObjectExistByQuery('following', { followingID: followingId, followerID: followerId });
  if (result != null) {
    const followingRemoval = await deleteOneObjectById('following', result._id);
    const followerCountResult = await decreaseOneFieldById('user', followerId, 'followerCount');
    const followingCountResult = await decreaseOneFieldById('user', followingId, 'followingCount');
    if (followingRemoval && followerCountResult && followingCountResult) {
      return followingRemoval;
    }
  }
  return "following doesn't exist";
}

async function deleteOneFollowingById(id) {
  const result = await checkOneObjectExistByQuery('following', { _id: id });
  if (result != null) {
    const followingRemoval = await deleteOneObjectById('following', result._id);
    const followerCountResult = await decreaseOneFieldById('user', result.followerID, 'followerCount');
    const followingCountResult = await decreaseOneFieldById('user', result.followingID, 'followingCount');
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

async function userLogin(email, password) {
  return getOneObjectByQuery('login', { email, password });
}

async function userSignUp(email, password) {
  return insertOneObject('login', { email, password });
}

async function updateOneUserMotto(userId, motto) {
  return updateOneFieldById('user', userId, 'userMotto', motto);
}

async function updateOnePostLikeCount(postId, newLikeCount) {
  return updateOneFieldById('post', postId, 'likeCount', newLikeCount);
}

async function getOneRandomUser() {
  return getOneRandomObject('user');
}

async function getOneRandomPost() {
  return getOneRandomObject('post');
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
};
