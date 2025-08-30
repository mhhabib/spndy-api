const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateAccessToken = (user) => {
	return jwt.sign(
		{ id: user.id, username: user.username, email: user.email },
		process.env.JWT_ACCESS_SECRET_KEY,
		{ expiresIn: '15m' }
	);
};

const generateRefreshToken = (user) => {
	return jwt.sign(
		{ id: user.id, username: user.username, email: user.email },
		process.env.JWT_REFRESH_SECRET_KEY,
		{ expiresIn: '30d' }
	);
};

const verifyAccessToken = (token) => {
	try {
		return jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
	} catch {
		return null;
	}
};

const verifyRefreshToken = (token) => {
	try {
		return jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY);
	} catch {
		return null;
	}
};

module.exports = {
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
};
