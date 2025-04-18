const { Op } = require('sequelize');
const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt.utils');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		// Check if user already exists
		const emailExists = await User.findOne({
			where: { email },
		});

		if (emailExists) {
			return res.status(400).json({ message: 'User already exists' });
		}

		// Create user
		const user = await User.create({
			username,
			email,
			password,
		});

		if (user) {
			res.status(201).json({
				id: user.id,
				username: user.username,
				email: user.email,
				token: generateToken(user.id),
			});
		} else {
			res.status(400).json({ message: 'Invalid user data' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Check for user
		const user = await User.findOne({ where: { email } });

		if (user && (await user.comparePassword(password))) {
			res.json({
				id: user.id,
				username: user.username,
				email: user.email,
				token: generateToken(user),
			});
		} else {
			res.status(401).json({ message: 'Invalid email or password' });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = { signup, login };
