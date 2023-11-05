const express = require('express');

const loginRouter = express.Router();
const dbLib = require('../dbUtils/crud');
const { methodLogging, logger } = require('../utils/logger');
const jwtTools = require('../utils/jwtTools');

loginRouter.post('/', async (req, res) => {
  methodLogging('POST', req);
  try {
    const { email } = req.body;
    const { password } = req.body;
    if (!email || !password) {
      return res.json({ error: 'invalid input' });
    }
    const loginData = await dbLib.userLogin(email, password);
    if (loginData) {
      const profile = await dbLib.getOneObjectByQuery('user', { email });
      const token = jwtTools.generateToken(profile);
      return res.json({ ...profile._doc, accessToken: token });
    }
    return res.json({ error: 'Incorrect Email or Password' });
  } catch (err) {
    logger.error(err.toString());
    return res.json({ error: err.toString() });
  }
});

module.exports = { loginRouter };
