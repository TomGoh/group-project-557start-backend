const express = require('express');
const userOperations = require('../dbUtils/user/userOperations');
const { methodLogging, logger } = require('../utils/logger');
const { deleteParamValidator } = require('../utils/paramValidator');

const userRouter = express.Router();

userRouter.get('/', async (req, res) => {
	methodLogging('GET', req);
	const { userName } = req.query;
	const { userNameLike } = req.query;
	if (userName) {
		const user = await userOperations.getUserByUserName(userName);
		return res.json(user);
	}
	if (userNameLike) {
		const user = await userOperations.getUserBybUserNameLike(userNameLike);
		return res.json(user);
	}
	const allUsers = await userOperations.getAllUsers();
	return res.json(allUsers);
});

userRouter.get('/:id', async (req, res) => {
	if (!req.params.id) {
		return res.json({ error: 'Missing id parameter' });
	}
	const user = await userOperations.getUserByUserId(req.params.id);
	return res.json(user);
});

userRouter.post('/', async (req, res) => {
	methodLogging('POST', req);
	try {
		const user = req.body;
		const result = await userOperations.createOneUser(user);
		res.json(result);
	} catch (err) {
		res.json({ error: err.toString() });
	}
});

userRouter.delete('/:id', deleteParamValidator, async (req, res) => {
	methodLogging('DELETE', req);
	try {
		const result = await userOperations.deleteOneUserById(req.params.id);
		return res.json(result);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

userRouter.patch('/:id', deleteParamValidator, async (req, res) => {
	methodLogging('PATCH', req);
	try {
		const userId = req.params.id;
		const result = await userOperations.updateOneUserById(userId, req.body);
		return res.json(result);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

module.exports = { userRouter };
