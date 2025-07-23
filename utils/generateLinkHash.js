const crypto = require('crypto');

const generateHexLink = (length = 6) => {
	return crypto
		.randomBytes(Math.ceil(length / 2))
		.toString('hex')
		.slice(0, length);
};

module.exports = { generateHexLink };
