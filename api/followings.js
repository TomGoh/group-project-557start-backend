const express = require('express');

const followingRouter = express.Router();
const dbLib = require('../dbUtils/crud');
const { methodLogging, logger } = require('../utils/logger');
const { getObjectsByQuery } = require('../dbUtils/crud');
const { getManyObjectsByQuery } = require('../dbUtils/dbFunctions');

followingRouter.get('/', async (req, res) => {
	methodLogging('GET', req);
	try {
		const followerid = req.query.followerID;
		const followingid = req.query.followingID;
		if (followerid && followingid) {
			const responseData = await getObjectsByQuery('following', { followerID: followerid, followingID: followingid });
			return res.json(responseData);
		}
		if (followerid) {
			const responseData = await getObjectsByQuery('following', { followerID: followerid });
			return res.json(responseData);
		}
		if (followingid) {
			const responseData = await getObjectsByQuery('following', { followingID: followingid });
			return res.json(responseData);
		}
		const responseData = await getManyObjectsByQuery('following', {});
		return res.json(responseData);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

followingRouter.get('/:id', async (req, res) => {
	methodLogging('GET', req);
	try {
		const responseData = await getObjectsByQuery('following', { _id: req.params.id });
		return res.json(responseData);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

followingRouter.post('/', async (req, res) => {
	methodLogging('POST', req);
	try {
		const following = req.body;
		if (following.followerID === following.followingID) {
			return res.json({ error: 'cannot follow yourself' });
		}
		const followingExist = await getObjectsByQuery('following', { followerID: following.followerID, followingID: following.followingID });
		if (followingExist.length > 0) {
			return res.json({ error: 'already following' });
		}
		const result = await dbLib.createOneFollowing(following);
		return res.json(result);
	} catch (err) {
		return res.json({ error: err.toString() });
	}
});

followingRouter.delete('/', async (req, res) => {
	methodLogging('DELETE', req);
	try {
		const followerid = req.query.followerID;
		const followingid = req.query.followingID;
		if (!followerid || !followingid) {
			return res.json({ error: 'followerID and followingID are required' });
		}
		const result = await dbLib
			.deleteOneFollowingByFollowerIDAndFollowingID(followingid, followerid);
		return res.json(result);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

followingRouter.delete('/:id', async (req, res) => {
	methodLogging('DELETE', req);
	try {
		const result = await dbLib.deleteOneFollowingById(req.params.id);
		return res.json(result);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

module.exports = { followingRouter };
