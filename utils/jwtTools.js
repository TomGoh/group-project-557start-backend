const jwt = require('jsonwebtoken');

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

module.exports = { generateToken, validateToken };
