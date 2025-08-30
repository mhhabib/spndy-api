const { verifyAccessToken } = require('../utils/jwt.utils');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		try {
			token = req.headers.authorization.split(' ')[1];
			const decoded = verifyAccessToken(token);

			if (!decoded) {
				return res
					.status(401)
					.json({ message: 'Not authorized, token failed' });
			}

			req.user = await User.findByPk(decoded.id, {
				attributes: { exclude: ['password'] },
			});
			next();
		} catch (error) {
			console.error(error);
			res.status(401).json({ message: 'Not authorized, token failed' });
		}
	}

	if (!token) {
		res.status(401).json({ message: 'Not authorized, no token' });
	}
};

module.exports = { protect };
