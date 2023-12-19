const express = require('express');
const likeOperations = require('../dbUtils/like/likeOperations');
const { methodLogging, logger } = require('../utils/logger');
const { getUserByUserId } = require('../dbUtils/user/userOperations');
const { paramValidator, queryValidator, likeBodyValidator } = require('../utils/paramValidator');

const likeRouter = express.Router();

likeRouter.get('/', queryValidator, async (req, res) => {
	methodLogging('GET', req);
	try {
		const userid = req.query.userID;
		const postid = req.query.postID;
		if (userid && postid) {
			const responseData = await likeOperations.getLikeByPostIdAndUserId(postid, userid);
			return res.json(responseData);
		}
		if (userid) {
			const responseData = await likeOperations.getLikeByUserId(userid);
			return res.json(responseData);
		}
		if (postid) {
			const responseData = await likeOperations.getLikeByPostId(postid);
			return res.json(responseData);
		}
		const responseData = await likeOperations.getAllLikes();
		return res.json(responseData);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

likeRouter.get('/:id', paramValidator, async (req, res) => {
	methodLogging('GET', req);
	try {
		const responseData = await likeOperations.getLikeById(req.params.id);
		return res.json(responseData);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

likeRouter.delete('/:id', paramValidator, async (req, res) => {
	methodLogging('DELETE', req);
	try {
		const result = await likeOperations.deleteOneLikeById(req.params.id);
		res.json(result);
	} catch (err) {
		res.json({ error: err.toString() });
	}
});

likeRouter.delete('/', queryValidator, async (req, res) => {
	methodLogging('DELETE', req);
	try {
		const userid = req.query.userID;
		const postid = req.query.postID;
		if (userid && postid) {
			const result = await likeOperations.deleteOneLikeByUserIdAndPostId(userid, postid);
			return res.json(result);
		}
		return res.json({ error: 'missing query params' });
	} catch (err) {
		return res.json({ error: err.toString() });
	}
});

likeRouter.post('/', likeBodyValidator, async (req, res) => {
	methodLogging('POST', req);
	try {
		const like = req.body;
		const likeExist = await likeOperations.getLikeByPostIdAndUserId(like.postID, like.userID);
		if (likeExist.length > 0) {
			return res.json({ error: 'already liked' });
		}
		if (like.userName === undefined) {
			const user = await getUserByUserId(like.userID);

			like.userName = user.userName;
		}
		const result = await likeOperations.createOneLike(like);
		return res.json(result);
	} catch (err) {
		return res.json({ error: err.toString() });
	}
});

module.exports = { likeRouter };
