const express = require('express');
const userRouter = express.Router();
const dbLib = require('../dbUtils/crud');
const { methodLogging, logger } = require('../utils/logger');

userRouter.get('/', async (req, res) => {
	methodLogging('GET', req)
	const userName = req.query.userName;
	const userName_like = req.query.userName_like;
	if(userName) {
		const user = await dbLib.getObjectsByQuery('user', { userName: userName });
		return res.json(user);
	}
	if(userName_like) {
		const user = await dbLib.getObjectsByQuery('user', {userName: { $regex: `^${userName_like}`, $options: 'i' }});
		return res.json(user);
	}
	const allUsers = await dbLib.getAllObjects('user');
	return res.json(allUsers);
});

userRouter.get('/:id', async (req, res) => {
	const user = await dbLib.getObjectsByQuery('user', { _id: req.params.id });
	return res.json(user);
});

userRouter.post('/', async (req, res) => {
	methodLogging('POST', req)
	try {
		const user = req.body;
		const result = await dbLib.createOneUser(user);
		res.json(result);
	} catch (err) {
		res.json({ error: err.toString() });
	}
});

userRouter.delete('/:id', async (req, res) => {
	methodLogging('DELETE', req)
	try{
		const result = await dbLib.deleteOneUserById(req.params.id);
		return res.json(result);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});


module.exports = { userRouter };