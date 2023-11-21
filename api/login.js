const express = require('express');

const loginRouter = express.Router();
const dbLib = require('../dbUtils/crud');
const { methodLogging, logger } = require('../utils/logger');
const { verifyPassword } = require('../utils/userVerify');
const { tokenManager } = require('../utils/tokenManager');

loginRouter.post('/', async (req, res) => {
  methodLogging('POST', req);
  try {
    const { email } = req.body;
    const { password } = req.body;
    if (!email || !password) {
      return res.json({ error: 'invalid input' });
    }
    const loginData = await dbLib.userLogin(email);
    if (loginData && verifyPassword(password, loginData.password)) {
      const profile = await dbLib.getOneObjectByQuery('user', { email });
      const token = tokenManager.generateToken(profile);
      return res.json({ ...profile._doc, accessToken: token });
    }
    return res.json({ error: 'Incorrect Email or Password' });
  } catch (err) {
    logger.error(err.toString());
    return res.json({ error: err.toString() });
  }
});

module.exports = { loginRouter };
