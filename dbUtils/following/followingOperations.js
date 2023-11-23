const { deleteCache, setCache, getCache } = require('../../utils/redisMaintenance');
const dbFunctions = require('../dbFunctions');

async function getAllFollowings() {
  return dbFunctions.getAllObjects('following');
}

async function getFollowingById(followingId) {
  return dbFunctions.getOneObjectById('following', followingId);
}

async function getFollowingBySourceId(sourceId) {
  const cachedFollowings = await getCache(`following:${sourceId}`);
  if (cachedFollowings) {
    return cachedFollowings;
  }
  const response = await dbFunctions.getManyObjectsByQuery('following', { followerID: sourceId });
  await setCache(`following:${sourceId}`, response, 1800);
  return response;
}

async function getFollowerByTargetId(targetId) {
  const response = await dbFunctions.getManyObjectsByQuery('following', { targetID: targetId });
  return response;
}

async function getFollowingByFollowerIDAndFollowingID(followerID, followingID) {
  const cachedFollowings = await getCache(`following:${followerID}`);
  if (cachedFollowings) {
    const filteredFollowings = cachedFollowings
      .filter((following) => following.followingID === followingID);
    return filteredFollowings;
  }
  const response = await dbFunctions.getManyObjectsByQuery('following', { followerID, followingID });
  return response;
}

async function createOneFollowing(following) {
  if (following.userID === following.followingID) {
    return false;
  }
  const followingResult = await dbFunctions.insertOneObject('following', following);
  const followingCountResult = await dbFunctions.increaseOneFieldById('user', following.followerID, 'followingCount');
  const followerCountResult = await dbFunctions.increaseOneFieldById('user', following.followingID, 'followerCount');
  await deleteCache(`user:${following.followerID}`);
  await deleteCache(`user:${following.followingID}`);
  await deleteCache(`following:${following.followerID}`);
  return followingResult && followingCountResult && followerCountResult;
}

async function deleteOneFollowingByFollowerIDAndFollowingID(followerID, followingID) {
  const result = await dbFunctions.getOneObjectByQuery('following', { followerID, followingID });
  if (result != null) {
    const followingRemoval = await dbFunctions.deleteOneObjectById('following', result._id);
    const followingCountResult = await dbFunctions.decreaseOneFieldById('user', followerID, 'followingCount');
    const followerCountResult = await dbFunctions.decreaseOneFieldById('user', followingID, 'followerCount');
    await deleteCache(`user:${followerID}`);
    await deleteCache(`user:${followingID}`);
    await deleteCache(`following:${followerID}`);
    if (followingRemoval && followingCountResult && followerCountResult) {
      return followingRemoval;
    }
  }
  return "following doesn't exist";
}

async function deleteOneFollowingById(followingId) {
  const result = await dbFunctions.checkOneObjectExistByQuery('following', { _id: followingId });
  if (result != null) {
    const followingRemoval = await dbFunctions.deleteOneObjectById('following', result._id);
    const followingCountResult = await dbFunctions.decreaseOneFieldById('user', result.followerID, 'followingCount');
    const followerCountResult = await dbFunctions.decreaseOneFieldById('user', result.followingID, 'followerCount');
    await deleteCache(`user:${result.followerID}`);
    await deleteCache(`user:${result.followingID}`);
    await deleteCache(`following:${result.followerID}`);
    if (followingRemoval && followingCountResult && followerCountResult) {
      return followingRemoval;
    }
  }
  return "following doesn't exist";
}

module.exports = {
  getAllFollowings,
  getFollowingById,
  getFollowingBySourceId,
  getFollowerByTargetId,
  createOneFollowing,
  deleteOneFollowingByFollowerIDAndFollowingID,
  getFollowingByFollowerIDAndFollowingID,
  deleteOneFollowingById,
};
