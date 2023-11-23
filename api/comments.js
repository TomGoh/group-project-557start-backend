const express = require('express');

const commentRouter = express.Router();
const commentOperations = require('../dbUtils/comment/commentOperations');
const { methodLogging, logger } = require('../utils/logger');
const { getUserByUserId } = require('../dbUtils/user/userOperations');

commentRouter.get('/', async (req, res) => {
	methodLogging('GET', req);
	try {
		const userid = req.query.userID;
		const postid = req.query.postID;
		if (userid && postid) {
			const responseData = await commentOperations.getCommentsByUserIdAndPostId(userid, postid);
			return res.json(responseData);
		}
		if (userid) {
			const responseData = await commentOperations.getCommentsByUserId(userid);
			return res.json(responseData);
		}
		if (postid) {
			const responseData = await commentOperations.getCommentsByPostId(postid);
			return res.json(responseData);
		}
		const responseData = await commentOperations.getAllComments();
		return res.json(responseData);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

commentRouter.get('/:id', async (req, res) => {
	methodLogging('GET', req);
	try {
		if (!req.params.id) {
			return res.json({ error: 'Missing id parameter' });
		}
		const responseData = await commentOperations.getCommentById(req.params.id);
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
		if (comment.userName === undefined) {
			const user = await getUserByUserId(comment.userID);
			comment.userName = user.userName;
		}
		const result = await commentOperations.createOneComment(comment);
		res.json(result);
	} catch (err) {
		res.json({ error: err.toString() });
	}
});

commentRouter.delete('/:id', async (req, res) => {
	methodLogging('DELETE', req);
	try {
		const result = await commentOperations.deleteOneCommentById(req.params.id);
		res.json(result);
	} catch (err) {
		res.json({ error: err.toString() });
	}
});

module.exports = { commentRouter };
