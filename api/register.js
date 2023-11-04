const express = require('express');
const registerRouter = express.Router();
const dbLib = require('../dbUtils/crud');
const { methodLogging, logger } = require('../utils/logger');

registerRouter.post('/', async (req, res) => {
	methodLogging('POST', req);
	try {
		const email = req.body.email;
		const password = req.body.password;
		const username = req.body.userName;
		if (!email || !password || !username) {
			return res.json({ error: 'invalid input' });
		}
		const registerResult = await dbLib.userSignUp(email, password);
		const userCreationResult = await dbLib.createOneUser({ email: email, userName: username });
		if (registerResult && userCreationResult) {
			return res.json({ success: 'user created' });
		}
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

module.exports = { registerRouter };
