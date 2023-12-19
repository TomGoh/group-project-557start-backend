const mongoose = require('../dbUtils/db');
const dbFunctions = require('../dbUtils/dbFunctions');

async function paramValidator(req, resp, next) {
  const { id } = req.params;
  if (!id) {
    return resp.status(400).json({ error: 'missing params' });
  }
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) {
    return resp.status(400).json({ error: 'invalid params' });
  }
  return next();
}

async function queryValidator(req, resp, next) {
  try {
    const {
      userID = undefined,
      postID = undefined,
      followerID = undefined,
      followingID = undefined,
    } = req.query;

    const ids = [{ key: 'userID', value: userID }, { key: 'postID', value: postID }, { key: 'followerID', value: followerID }, { key: 'followingID', value: followingID }];

    const invalidId = ids
      .find((idObj) => idObj.value && !mongoose.Types.ObjectId.isValid(idObj.value));

    if (invalidId) {
      return resp.status(400).json({ error: `Invalid ${invalidId.key}` });
    }
    return next();
  } catch (error) {
    return resp.status(500).json({ error: 'An error occurred while validating the query' });
  }
}

async function commentBodyValidator(req, resp, next) {
  const comment = req.body;
  if (!comment) {
    return resp.status(400).json({ error: 'missing body' });
  }
  const { userID, postID, content } = comment;
  if (!userID || !postID || !content) {
    return resp.status(400).json({ error: 'incomplete comment object' });
  }
  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return resp.status(400).json({ error: 'invalid userID' });
  }
  if (!mongoose.Types.ObjectId.isValid(postID)) {
    return resp.status(400).json({ error: 'invalid postID' });
  }
  if (!content && typeof content !== 'string' && content.length < 1) {
    return resp.status(400).json({ error: 'invalid content' });
  }
  return next();
}

function isS3Url(url) {
  const regex = /^https?:\/\/(.+?)\.s3(.+)?\.amazonaws\.com\/(.+)/;
  return regex.test(url);
}

async function postBodyValidator(req, resp, next) {
  const post = req.body;
  if (!post) {
    return resp.status(400).json({ error: 'missing body' });
  }
  const { userID, imgPath, description } = post;
  if (!userID && !imgPath && !description) {
    return resp.status(400).json({ error: 'incomplete post object' });
  }
  if (userID && !mongoose.Types.ObjectId.isValid(userID)) {
    return resp.status(400).json({ error: 'invalid userID' });
  }
  if (imgPath && typeof imgPath !== 'string' && imgPath.length < 1 && !isS3Url(imgPath)) {
    return resp.status(400).json({ error: 'invalid imgPath' });
  }
  if (description && typeof description !== 'string' && description.length < 1) {
    return resp.status(400).json({ error: 'invalid description' });
  }
  return next();
}

async function likeBodyValidator(req, resp, next) {
  const like = req.body;
  if (!like) {
    return resp.status(400).json({ error: 'missing body' });
  }
  const { userID, postID } = like;
  if (!userID || !postID) {
    return resp.status(400).json({ error: 'incomplete like object' });
  }
  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return resp.status(400).json({ error: 'invalid userID' });
  }
  if (!mongoose.Types.ObjectId.isValid(postID)) {
    return resp.status(400).json({ error: 'invalid postID' });
  }
  return next();
}

async function followingBodyValidator(req, resp, next) {
  const following = req.body;
  if (!following) {
    return resp.status(400).json({ error: 'missing body' });
  }
  const { followerID, followingID } = following;
  if (!followerID || !followingID) {
    return resp.status(400).json({ error: 'incomplete following object' });
  }
  if (!mongoose.Types.ObjectId.isValid(followerID)) {
    return resp.status(400).json({ error: 'invalid followerID' });
  }
  if (!mongoose.Types.ObjectId.isValid(followingID)) {
    return resp.status(400).json({ error: 'invalid followingID' });
  }
  return next();
}

async function userBodyValidator(req, resp, next) {
  const user = req.body;
  if (!user) {
    return resp.status(400).json({ error: 'missing body' });
  }
  const { userName, email } = user;
  if (!userName || !email) {
    return resp.status(400).json({ error: 'incomplete user object' });
  }
  if (!userName && typeof userName !== 'string' && userName.length < 1) {
    return resp.status(400).json({ error: 'invalid userName' });
  }
  if (!email && typeof email !== 'string' && email.length < 1) {
    return resp.status(400).json({ error: 'invalid email' });
  }
  return next();
}

async function registerBodyValidator(req, resp, next) {
  const user = req.body;
  if (!user) {
    return resp.status(400).json({ error: 'missing body' });
  }
  const { userName, email, password } = user;
  if (!userName || !email || !password) {
    return resp.status(400).json({ error: 'incomplete user object' });
  }
  if (!userName && typeof userName !== 'string' && userName.length < 1) {
    return resp.status(400).json({ error: 'invalid userName' });
  }
  if (!email && typeof email !== 'string' && email.length < 1) {
    return resp.status(400).json({ error: 'invalid email' });
  }
  if (!password && typeof password !== 'string' && password.length < 6) {
    return resp.status(400).json({ error: 'invalid password' });
  }
  return next();
}

async function hideBodyValidator(req, resp, next) {
  const hide = req.body;
  if (!hide) {
    return resp.status(400).json({ error: 'missing body' });
  }
  const { userID, postID } = hide;
  if (!userID || !postID) {
    return resp.status(400).json({ error: 'incomplete hide object' });
  }
  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return resp.status(400).json({ error: 'invalid userID' });
  }
  if (!mongoose.Types.ObjectId.isValid(postID)) {
    return resp.status(400).json({ error: 'invalid postID' });
  }
  return next();
}

async function hideQueryValidator(req, resp, next) {
  console.log(req.query);
  const { userID, postID } = req.query;
  if (!userID || !postID) {
    return resp.status(400).json({ error: 'incomplete hide object' });
  }
  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return resp.status(400).json({ error: 'invalid userID' });
  }
  if (!mongoose.Types.ObjectId.isValid(postID)) {
    return resp.status(400).json({ error: 'invalid postID' });
  }
  return next();
}

async function loginBodyValidator(req, resp, next) {
  const user = req.body;
  if (!user) {
    return resp.status(400).json({ error: 'missing body' });
  }
  const { email, password } = user;
  if (!email || !password) {
    return resp.status(400).json({ error: 'incomplete user object' });
  }
  if (!email && typeof email !== 'string' && email.length < 1) {
    return resp.status(400).json({ error: 'invalid email' });
  }
  if (!password && typeof password !== 'string' && password.length < 6) {
    return resp.status(400).json({ error: 'invalid password' });
  }
  return next();
}

async function deleteQueryValidator(req, resp, next) {
  const cookies = req.headers.cookie;
  let currentUserID;
  cookies.split(';').forEach((element) => {
    if (element.includes('_id')) {
      [, currentUserID] = element.split('=');
    }
  });
  const userID = req.body.userID || req.query.userID || req.query.followerID;
  if (!userID) {
    return resp.status(400).json({ error: 'missing userID' });
  }
  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return resp.status(400).json({ error: 'invalid userID' });
  }
  if (currentUserID !== userID.toString()) {
    return resp.status(401).json({ error: 'you cannot delete other user\'s data.' });
  }
  return next();
}

async function deleteParamValidator(req, resp, next) {
  const entityID = req.params.id;
  const requestURLSegments = req.originalUrl.split('/');
  const requestIDIndex = requestURLSegments.findIndex((segment) => segment === entityID);
  let requestEntity = requestURLSegments[requestIDIndex - 1];
  if (!requestEntity) {
    return resp.status(400).json({ error: 'missing entity' });
  }
  if (requestEntity[requestEntity.length - 1] === 's') {
    requestEntity = requestEntity.slice(0, -1);
  }
  const cookies = req.headers.cookie;
  let currentUserID;
  cookies.split(';').forEach((element) => {
    if (element.includes('_id')) {
      [, currentUserID] = element.split('=');
    }
  });
  const entityInstance = await dbFunctions.getOneObjectById(requestEntity, entityID);
  if (entityInstance === null) {
    return resp.status(400).json({ error: `invalid params on ${requestEntity}.` });
  }
  if (entityInstance.userID && entityInstance.userID.toString() !== currentUserID) {
    return resp.status(401).json({ error: 'you cannot delete other user\'s data.' });
  }
  if (entityInstance.followerID && entityInstance.followerID.toString() !== currentUserID) {
    return resp.status(401).json({ error: 'you cannot delete other user\'s data.' });
  }
  return next();
}
module.exports = {
  paramValidator,
  queryValidator,
  commentBodyValidator,
  postBodyValidator,
  likeBodyValidator,
  followingBodyValidator,
  userBodyValidator,
  registerBodyValidator,
  hideBodyValidator,
  hideQueryValidator,
  loginBodyValidator,
  deleteQueryValidator,
  deleteParamValidator,
};
