/* eslint-disable no-underscore-dangle */
const {
  getOneObjectById, insertOneObject,
  deleteOneObjectById,
  increaseOneFieldById,
  checkOneObjectExistByQuery, checkOneObjectExistById,
} = require('./dbFunctions');

async function createOneUser(user) {
  return insertOneObject('user', user);
}

async function createOnePost(post) {
  const postResult = await insertOneObject('post', post);
  const postCountResult = await increaseOneFieldById('user', post.userID, 'postCount');
  return postResult && postCountResult;
}

async function createOneComment(comment) {
  return insertOneObject('comment', comment);
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

async function deleteOnePostById(postID) {
  const post = await getOneObjectById('post', postID);
  const postResult = await deleteOneObjectById('post', postID);
  const postCountResult = await increaseOneFieldById('user', post.userID, 'postCount', -1);
  return post && postResult && postCountResult;
}

async function deleteOneFollowingByIds(followingId, followerId) {
  checkOneObjectExistByQuery('following', { followingID: followingId, followerID: followerId }).then((result) => {
    if (result) {
      const followingRemoval = deleteOneObjectById('following', result._id);
      const followerCountResult = increaseOneFieldById('user', followerId, 'followerCount', -1);
      const followingCountResult = increaseOneFieldById('user', followingId, 'followingCount', -1);
      return followingRemoval && followerCountResult && followingCountResult;
    }
    return false;
  });
}

async function deleteOneLikeById(likeId) {
  checkOneObjectExistById('like', likeId).then((result) => {
    if (result) {
      const likeRemoval = deleteOneObjectById('like', likeId);
      const likeCountResult = increaseOneFieldById('post', result.postID, 'likeCount', -1);
      return likeRemoval && likeCountResult;
    }
    return false;
  });
}

async function deleteOneLikeByUserIdAndPostId(userId, postId) {
  checkOneObjectExistByQuery('like', { userID: userId, postID: postId }).then((result) => {
    if (result) {
      const likeRemoval = deleteOneObjectById('like', result._id);
      const likeCountResult = increaseOneFieldById('post', postId, 'likeCount', -1);
      return likeRemoval && likeCountResult;
    }
    return false;
  });
}

module.exports = {
  createOneUser,
  createOnePost,
  createOneComment,
  createOneFollowing,
  createOneLike,
  deleteOnePostById,
  deleteOneFollowingByIds,
  deleteOneLikeById,
  deleteOneLikeByUserIdAndPostId,
};
