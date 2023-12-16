const { deleteCache, setCache, getCache } = require('../../utils/redisMaintenance');
const dbFunctions = require('../dbFunctions');

/**
 * Get hide relationship by id
 * @param hideId hide id
 * @returns {Promise<*>} hide object
 */
async function getHideById(hideId) {
  const cachedHide = await getCache(`hide:${hideId}`);
  if (cachedHide) {
    return cachedHide;
  }
  const response = await dbFunctions.getOneObjectById('hide', hideId);
  await setCache(`hide:${hideId}`, response, 1800);
  return response;
}

/**
 * Get all hides of a user
 * @param userId user id
 * @returns {Promise<*>} array of hide objects
 */
async function getHidesByUserId(userId) {
  const cachedHides = await getCache(`hide:${userId}`);
  if (cachedHides) {
    return cachedHides;
  }
  const response = await dbFunctions.getManyObjectsByQuery('hide', { userID: userId });
  await setCache(`hide:${userId}`, response, 1800);
  return response;
}

async function checkHideByUserIdAndPostId(userId, postId) {
  const cahcedHides = await getCache(`hide:${userId}`);
  if (cahcedHides) {
    return cahcedHides.find((h) => h.postID === postId);
  }
  const response = await dbFunctions.getManyObjectsByQuery('hide', { userID: userId });
  await setCache(`hide:${userId}`, response, 1800);
  return response.find((h) => h.postID === postId);
}

/**
 * Create a new hide relationship
 * @param hide hide object, should contain userID and postID
 * @returns {Promise<*>} hide object
 */
async function createOneHide(hide) {
  const result = await dbFunctions.insertOneObject('hide', hide);
  await deleteCache(`hide:${hide.userID}`);
  return result;
}

/**
 * Delete a hide relationship by id
 * @param hideId hide id
 * @returns {Promise<*|string>} mongo response or error message
 */
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

/**
 * Delete a hide relationship by user id and post id
 * @param userId user id
 * @param postId post id
 * @returns {Promise<*|string>} mongo response or error message
 */
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
  checkHideByUserIdAndPostId,
};
