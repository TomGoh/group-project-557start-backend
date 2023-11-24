const dotenv = require('dotenv');
const { tokenManager } = require('./tokenManager');

dotenv.config();

const { methodLogging, logger } = require('./logger');

const pathException = ['/api/login', '/api/signup', '/api/logout'];

/**
 * Middleware to check for valid token
 * @param req request
 * @param res response
 * @param next next
 * @returns {Promise<*>} next
 */
async function tokenAuthenticator(req, res, next) {
	methodLogging('tokenAuthenticator', req);
	if (pathException.includes(req.path)) {
		return next();
	}
	if (req.headers.cookie) {
		const { cookie } = req.headers;
		const accessToken = cookie.split('=')[1];
		if (!accessToken) {
			logger.error('missing token');
			return res.status(401).json({ error: 'missing token' });
		}
		const blocked = await tokenManager.isTokenDisabled(accessToken);
		if (blocked) {
			logger.error('token disabled');
			return res.status(401).json({ error: 'invalid token' });
		}
		const decoded = tokenManager.validateToken(accessToken);
		if (decoded) {
			return next();
		}
		logger.error('invalid token');
		return res.status(401).json({ error: 'invalid token' });
	}
	logger.error('missing token');
	return res.status(401).json({ error: 'missing token' });
}

module.exports = { tokenAuthenticator };
