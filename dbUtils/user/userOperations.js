const { deleteCache, setCache, getCache } = require('../../utils/redisMaintenance');
const dbFunctions = require('../dbFunctions');

/**
 * Get all users
 * @returns {Promise<*>} array of users
 */
async function getAllUsers() {
  return dbFunctions.getAllObjects('user');
}

/**
 * Get user by userId
 * @param userId user id
 * @returns {Promise<*>} user object
 */
async function getUserByUserId(userId) {
  const cachedUser = await getCache(`user:${userId}`);
  if (cachedUser) {
    return cachedUser;
  }
  const response = await dbFunctions.getOneObjectById('user', userId);
  await setCache(`user:${userId}`, response, 1800);
  return response;
}

/**
 * Get user by email
 * @param email user email
 * @returns {Promise<*>} user object
 */
async function getUserByEmail(email) {
  return await dbFunctions.getOneObjectByQuery('user', { email });
}

/**
 * Get user by userName
 * @param userName user name
 * @returns {Promise<*>} user object
 */
async function getUserByUserName(userName) {
  return await dbFunctions.getOneObjectByQuery('user', { userName });
}

/**
 * Create one user
 * @param user user object
 * @returns {Promise<*>} created user
 */
async function createOneUser(user) {
  return dbFunctions.insertOneObject('user', user);
}

/**
 * Delete one user by userId
 * @param userId user id
 * @returns {Promise<*>} deleted user
 */
async function deleteOneUserById(userId) {
  await deleteCache(`user:${userId}`);
  await deleteCache(`post:${userId}`);
  await deleteCache(`following:${userId}`);
  await deleteCache(`comment:${userId}`);
  await deleteCache(`hide:${userId}`);
  return dbFunctions.deleteOneObjectById('user', userId);
}

/**
 * Update user motto
 * @param userId user id
 * @param userMotto user motto
 * @returns {Promise<*>} updated user
 */
async function updateUserMotto(userId, userMotto) {
  await deleteCache(`user:${userId}`);
  return dbFunctions.updateOneFieldById('user', userId, 'userMotto', userMotto);
}

/**
 * Check if email exists
 * @param email user email
 * @returns {Promise<boolean>} true if email exists
 */
async function checkEmailExistence(email) {
  const response = await dbFunctions.checkOneObjectExistByQuery('user', { email });
  return response.length > 0;
}

/**
 * Check if username exists
 * @param userName user name
 * @returns {Promise<boolean>} true if username exists
 */
async function checkUsernameExistence(userName) {
  const response = await dbFunctions.checkOneObjectExistByQuery('user', { userName });
  return response.length > 0;
}

/**
 * Get user by userName like
 * @param startWith start with
 * @returns {Promise<*>} array of users
 */
async function getUserBybUserNameLike(startWith) {
  return await dbFunctions.getManyObjectsByQuery('user', { userName: { $regex: `^${startWith}`, $options: 'i' } });
}

module.exports = {
  getAllUsers,
  getUserByUserId,
  getUserByEmail,
  createOneUser,
  deleteOneUserById,
  updateUserMotto,
  checkEmailExistence,
  checkUsernameExistence,
  getUserByUserName,
  getUserBybUserNameLike,
};
