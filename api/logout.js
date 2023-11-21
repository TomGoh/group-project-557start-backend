const express = require('express');

const logoutRouter = express.Router();
const { methodLogging } = require('../utils/logger');
const { tokenManager } = require('../utils/tokenManager');

logoutRouter.post('/', async (req, res) => {
  methodLogging('POST', req);
  if (!req.cookies) {
    return res.json({ error: 'missing token' });
  }
  const token = req.cookies.accessToken;
  if (!token) {
    return res.json({ error: 'missing token' });
  }
  await tokenManager.disableToken(token);
  const blockResult = await tokenManager.isTokenDisabled(token);
  if (blockResult) {
    return res.json({ result: 'success' });
  }
  return res.json({ error: 'failed' });
});

module.exports = { logoutRouter };
