const jwt = require('jsonwebtoken');
require('dotenv');

const { methodLogging, logger } = require('./logger');

const pathException = ['/api/login', '/api/signup'];

function generateToken(user) {
	const token = jwt.sign(
		{ id: user._id },
		process.env.JWT_SECRET,
		{ expiresIn: '6h' },
	);
	return token;
}

function validateToken(token) {
	const secret = process.env.JWT_SECRET;
	try {
		const decoded = jwt.verify(token, secret);
		return decoded;
	} catch (err) {
		return false;
	}
}

function tokenAuthenticator(req, res, next) {
	methodLogging('tokenAuthenticator', req);
	if (pathException.includes(req.path)) {
		return next();
	}
	if (req.headers.cookie) {
		const { cookie } = req.headers;
		const accessToken = cookie.split('=')[1];
		const decoded = validateToken(accessToken);
		if (decoded) {
			return next();
		}
		logger.error('invalid token');
		res.status(401).json({ error: 'invalid token' });
	}
	logger.error('missing token');
	return res.status(401).json({ error: 'missing token' });
}

module.exports = { generateToken, validateToken, tokenAuthenticator };
