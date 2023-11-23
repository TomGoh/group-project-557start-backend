const { deleteCache, setCache, getCache } = require('../../utils/redisMaintenance');
const dbFunctions = require('../dbFunctions');

async function getHideById(hideId) {
  const cachedHide = await getCache(`hide:${hideId}`);
  if (cachedHide) {
    return cachedHide;
  }
  const response = await dbFunctions.getOneObjectById('hide', hideId);
  await setCache(`hide:${hideId}`, response, 1800);
  return response;
}

async function getHidesByUserId(userId) {
  const cachedHides = await getCache(`hide:${userId}`);
  if (cachedHides) {
    return cachedHides;
  }
  const response = await dbFunctions.getManyObjectsByQuery('hide', { userID: userId });
  await setCache(`hide:${userId}`, response, 1800);
  return response;
}

async function createOneHide(hide) {
  const result = await dbFunctions.insertOneObject('hide', hide);
  await deleteCache(`hide:${hide.userID}`);
  return result;
}

async function deleteOneHideById(hideId) {
  const result = await dbFunctions.checkOneObjectExistByQuery('hide', { _id: hideId });
  if (result != null) {
    const hide = await dbFunctions.getOneObjectById('hide', result._id);
    const hideRemoval = await dbFunctions.deleteOneObjectById('hide', hide._id);
    await deleteCache(`hide:${hide.userID}`);
    if (hideRemoval) {
      return hideRemoval;
    }
  }
  return "hide doesn't exist";
}

async function deleteOneHideByUserIdAndPostId(userId, postId) {
  const result = await dbFunctions.checkOneObjectExistByQuery('hide', { userID: userId, postID: postId });
  if (result != null) {
    const hideRemoval = await dbFunctions.deleteOneObjectById('hide', result._id);
    await deleteCache(`hide:${userId}`);
    if (hideRemoval) {
      return hideRemoval;
    }
  }
  return "hide doesn't exist";
}

module.exports = {
  getHideById,
  getHidesByUserId,
  createOneHide,
  deleteOneHideById,
  deleteOneHideByUserIdAndPostId,
};
