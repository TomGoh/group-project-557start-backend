const { deleteCache, setCache, getCache } = require('../../utils/redisMaintenance');
const dbFunctions = require('../dbFunctions');

async function getAllUsers() {
  return dbFunctions.getAllObjects('user');
}

async function getUserByUserId(userId) {
  const cachedUser = await getCache(`user:${userId}`);
  if (cachedUser) {
    return cachedUser;
  }
  const response = await dbFunctions.getOneObjectById('user', userId);
  await setCache(`user:${userId}`, response, 1800);
  return response;
}

async function getUserByEmail(email) {
  const response = await dbFunctions.getOneObjectByQuery('user', { email });
  return response;
}

async function getUserByUserName(userName) {
  const response = await dbFunctions.getOneObjectByQuery('user', { userName });
  return response;
}

async function createOneUser(user) {
  return dbFunctions.insertOneObject('user', user);
}

async function deleteOneUserById(userId) {
  await deleteCache(`user:${userId}`);
  await deleteCache(`post:${userId}`);
  await deleteCache(`following:${userId}`);
  await deleteCache(`comment:${userId}`);
  await deleteCache(`hide:${userId}`);
  return dbFunctions.deleteOneObjectById('user', userId);
}

async function updateUserMotto(userId, userMotto) {
  await deleteCache(`user:${userId}`);
  return dbFunctions.updateOneFieldById('user', userId, 'userMotto', userMotto);
}

async function checkEmailExistence(email) {
  const response = await dbFunctions.checkOneObjectExistByQuery('user', { email });
  return response.length > 0;
}

async function checkUsernameExistence(userName) {
  const response = await dbFunctions.checkOneObjectExistByQuery('user', { userName });
  return response.length > 0;
}

async function getUserBybUserNameLike(startWith) {
  const response = await dbFunctions.getManyObjectsByQuery('user', { userName: { $regex: `^${startWith}`, $options: 'i' } });
  return response;
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
