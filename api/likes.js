const express = require('express');

const likeRouter = express.Router();
const dbLib = require('../dbUtils/crud');
const { methodLogging, logger } = require('../utils/logger');
const { getObjectsByQuery } = require('../dbUtils/crud');
const { getManyObjectsByQuery } = require('../dbUtils/dbFunctions');

likeRouter.get('/', async (req, res) => {
	methodLogging('GET', req);
	try {
		const userid = req.query.userID;
		const postid = req.query.postID;
		if (userid && postid) {
			const responseData = await getObjectsByQuery('like', { userID: userid, postID: postid });
			return res.json(responseData);
		}
		if (userid) {
			const responseData = await getObjectsByQuery('like', { userID: userid });
			return res.json(responseData);
		}
		if (postid) {
			const responseData = await getObjectsByQuery('like', { postID: postid });
			return res.json(responseData);
		}
		const responseData = await getManyObjectsByQuery('like', {});
		return res.json(responseData);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

likeRouter.get('/:id', async (req, res) => {
	methodLogging('GET', req);
	try {
		const responseData = await getObjectsByQuery('like', { _id: req.params.id });
		return res.json(responseData);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

likeRouter.delete('/:id', async (req, res) => {
	methodLogging('DELETE', req);
	try {
		const result = await dbLib.deleteOneLikeById(req.params.id);
		res.json(result);
	} catch (err) {
		res.json({ error: err.toString() });
	}
});

likeRouter.delete('/', async (req, res) => {
	methodLogging('DELETE', req);
	try {
		const userid = req.query.userID;
		const postid = req.query.postID;
		if (userid && postid) {
			const result = await dbLib.deleteOneLikeByUserIdAndPostId(userid, postid);
			return res.json(result);
		}
		return res.json({ error: 'missing query params' });
	} catch (err) {
		return res.json({ error: err.toString() });
	}
});

likeRouter.post('/', async (req, res) => {
	methodLogging('POST', req);
	try {
		const like = req.body;
		const likeExist = await getObjectsByQuery('like', { userID: like.userID, postID: like.postID });
		if (likeExist.length > 0) {
			return res.json({ error: 'already liked' });
		}
		if (like.userName === undefined) {
			const user = await getObjectsByQuery('user', { _id: like.userID });
			like.userName = user[0].userName;
		}
		console.log(like);
		const result = await dbLib.createOneLike(like);
		return res.json(result);
	} catch (err) {
		return res.json({ error: err.toString() });
	}
});

module.exports = { likeRouter };
