const express = require('express');

const loginRouter = express.Router();
const generalOperations = require('../dbUtils/generalOperations');
const { methodLogging, logger } = require('../utils/logger');
const { verifyPassword } = require('../utils/userVerify');
const { tokenManager } = require('../utils/tokenManager');
const { getUserByEmail } = require('../dbUtils/user/userOperations');

loginRouter.post('/', async (req, res) => {
  methodLogging('POST', req);
  try {
    const { email } = req.body;
    const { password } = req.body;
    if (!email || !password) {
      return res.json({ error: 'invalid input' });
    }
    const loginData = await generalOperations.userLogin(email);
    if (loginData && await verifyPassword(password, loginData.password)) {
      const profile = await getUserByEmail(email);
      const token = tokenManager.generateToken(profile);
      return res.json({ ...profile._doc, accessToken: token });
    }
    const lock = await generalOperations.loginLock(email);
    if (lock) {
      return res.json({ error: 'Account Locked. Please try again after 10 minutes.' });
    }
    return res.json({ error: 'Incorrect Email or Password' });
  } catch (err) {
    logger.error(err.toString());
    return res.json({ error: err.toString() });
  }
});

module.exports = { loginRouter };
