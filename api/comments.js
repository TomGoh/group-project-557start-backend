const express = require('express');
const commentRouter = express.Router();
const dbLib = require('../dbUtils/crud');
const { methodLogging, logger } = require('../utils/logger');
const { getObjectsByQuery } = require('../dbUtils/crud')
const { getManyObjectsByQuery } = require('../dbUtils/dbFunctions')

commentRouter.get('/', async (req, res) => {
	methodLogging('GET', req);
	try {
		const userid = req.query.userID;
		const postid = req.query.postID;
		if (userid && postid) {
			const responseData = await getObjectsByQuery('comment', { userID: userid, postID: postid });
			return res.json(responseData);
		}
		if (userid) {
			const responseData = await getObjectsByQuery('comment', { userID: userid });
			return res.json(responseData);
		}
		if (postid) {
			const responseData = await getObjectsByQuery('comment', { postID: postid });
			return res.json(responseData);
		}
		const responseData = await getManyObjectsByQuery('comment', {});
		return res.json(responseData);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

commentRouter.get('/:id', async (req, res) => {
	methodLogging('GET', req);
	try {
		const responseData = await getObjectsByQuery('comment', { _id: req.params.id });
		return res.json(responseData);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

commentRouter.post('/', async (req, res) => {
	methodLogging('POST', req);
	try {
		const comment = req.body;
		const result = await dbLib.createOneComment(comment);
		res.json(result);
	} catch (err) {
		res.json({ error: err.toString() });
	}
});

commentRouter.delete('/:id', async (req, res) => {
	methodLogging('DELETE', req);
	try {
		const result = await dbLib.deleteOneCommentById(req.params.id);
		res.json(result);
	} catch (err) {
		res.json({ error: err.toString() });
	}
});

module.exports = { commentRouter };
