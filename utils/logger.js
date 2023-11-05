const winston = require('winston');

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [
		new winston.transports.File({ filename: 'error.log', level: 'error' }),
		new winston.transports.File({ filename: 'combined.log' }),
	],
});

function methodLogging(methodName, req) {
	logger.log('info', '-----------------------------------');
	logger.log('info', `${methodName} ${req.originalUrl}`);
	logger.log('info', `req.body: ${JSON.stringify(req.body)}`);
	logger.log('info', `req query params: ${JSON.stringify(req.query)}`);
}

module.exports = { logger, methodLogging };
