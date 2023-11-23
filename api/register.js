const express = require('express');

const registerRouter = express.Router();
const generalOperations = require('../dbUtils/generalOperations');
const userOperations = require('../dbUtils/user/userOperations');
const { methodLogging, logger } = require('../utils/logger');
const { encryptPassword } = require('../utils/userVerify');

registerRouter.post('/', async (req, res) => {
  methodLogging('POST', req);
  try {
    const { email } = req.body;
    const { password } = req.body;
    const username = req.body.userName;
    if (!email || !password || !username) {
      return res.json({ error: 'invalid input' });
    }
    const enPassword = await encryptPassword(password);
    const registerResult = await generalOperations.userSignUp(email, enPassword);
    const userCreationResult = await userOperations.createOneUser({ email, userName: username });
    if (registerResult && userCreationResult) {
      return res.json({ success: 'user created' });
    }
    return res.json({ error: 'failed to create user' });
  } catch (err) {
    logger.error(err.toString());
    return res.json({ error: err.toString() });
  }
});

registerRouter.get('/', async (req, res) => {
  methodLogging('GET', req);
  try {
    const { email, username } = req.query;
    if (email && username) {
      const emailExistence = await userOperations.checkEmailExistence(email);
      const usernameExistence = await userOperations.checkUsernameExistence(username);
      if (emailExistence) {
        return res.json({ error: 'email already exists' });
      }
      if (usernameExistence) {
        return res.json({ error: 'username already exists' });
      }
    }
    if (email) {
      const emailExistence = await userOperations.checkEmailExistence(email);
      if (emailExistence) {
        return res.json({ error: 'email already exists' });
      }
    }
    if (username) {
      const usernameExistence = await userOperations.checkUsernameExistence(username);
      if (usernameExistence) {
        return res.json({ error: 'username already exists' });
      }
    }
    return res.json({ success: 'email and username are available' });
  } catch (err) {
    logger.error(err.toString());
    return res.json({ error: err.toString() });
  }
});

module.exports = { registerRouter };
