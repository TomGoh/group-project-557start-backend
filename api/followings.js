const express = require('express');
const { methodLogging, logger } = require('../utils/logger');
const followingOperations = require('../dbUtils/following/followingOperations');
const { getUserByUserId } = require('../dbUtils/user/userOperations');
const {
	queryValidator, paramValidator, followingBodyValidator,
	deleteQueryValidator, deleteParamValidator,
} = require('../utils/paramValidator');

const followingRouter = express.Router();
followingRouter.get('/', queryValidator, async (req, res) => {
	methodLogging('GET', req);
	try {
		const followerid = req.query.followerID;
		const followingid = req.query.followingID;
		if (followerid && followingid) {
			const responseData = await followingOperations
				.getFollowingByFollowerIDAndFollowingID(followerid, followingid);
			return res.json(responseData);
		}
		if (followerid) {
			const responseData = await followingOperations.getFollowingBySourceId(followerid);
			return res.json(responseData);
		}
		if (followingid) {
			const responseData = await followingOperations.getFollowerByTargetId(followingid);
			return res.json(responseData);
		}
		const responseData = await followingOperations.getAllFollowings();
		return res.json(responseData);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

followingRouter.get('/:id', paramValidator, async (req, res) => {
	methodLogging('GET', req);
	try {
		const responseData = await followingOperations.getFollowingById(req.params.id);
		return res.json(responseData);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

followingRouter.post('/', followingBodyValidator, async (req, res) => {
	methodLogging('POST', req);
	try {
		const following = req.body;
		if (following.followerID === following.followingID) {
			return res.json({ error: 'cannot follow yourself' });
		}
		const followingExist = await followingOperations
			.getFollowingByFollowerIDAndFollowingID(following.followerID, following.followingID);
		if (followingExist.length > 0) {
			return res.json({ error: 'already following' });
		}
		if (!following.followingName || !following.followerName) {
			const followingUser = await getUserByUserId(following.followingID);
			const followerUser = await getUserByUserId(following.followerID);
			following.followingName = followingUser.userName;
			following.followerName = followerUser.userName;
		}
		const result = await followingOperations.createOneFollowing(following);
		return res.json(result);
	} catch (err) {
		return res.json({ error: err.toString() });
	}
});

followingRouter.delete('/', queryValidator, deleteQueryValidator, async (req, res) => {
	methodLogging('DELETE', req);
	try {
		const followerid = req.query.followerID;
		const followingid = req.query.followingID;
		if (!followerid || !followingid) {
			return res.json({ error: 'followerID and followingID are required' });
		}
		const result = await followingOperations
			.deleteOneFollowingByFollowerIDAndFollowingID(followerid, followingid);
		return res.json(result);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

followingRouter.delete('/:id', paramValidator, deleteParamValidator, async (req, res) => {
	methodLogging('DELETE', req);
	try {
		const followingId = req.params.id;
		const result = await followingOperations.deleteOneFollowingById(followingId);
		return res.json(result);
	} catch (err) {
		logger.error(err.toString());
		return res.json({ error: err.toString() });
	}
});

module.exports = { followingRouter };
