const { deleteCache } = require('../../utils/redisMaintenance');
const dbFunctions = require('../dbFunctions');

async function getLikeById(likeId) {
  return dbFunctions.getOneObjectById('like', likeId);
}

async function getLikeByPostId(postId) {
  return dbFunctions.getManyObjectsByQuery('like', { postID: postId });
}

async function getLikeByUserId(userId) {
  return dbFunctions.getManyObjectsByQuery('like', { userID: userId });
}

async function getLikeByPostIdAndUserId(postId, userId) {
  return dbFunctions.getManyObjectsByQuery('like', { postID: postId, userID: userId });
}

async function createOneLike(like) {
  const post = await dbFunctions.getOneObjectById('post', like.postID);
  await deleteCache(`post:${post.userID}`);
  await deleteCache(`post:${like.userID}`);
  await deleteCache(`post:${like.postID}`);
  return dbFunctions.insertOneObject('like', like) && dbFunctions.increaseOneFieldById('post', like.postID, 'likeCount');
}

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
