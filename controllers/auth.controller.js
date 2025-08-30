const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} = require('../utils/jwt.utils');

// Helper: validate signup inputs
const validateSignup = (username, email, password) => {
	if (!username || !email || !password) return 'All fields are required';
	const emailRegex = /\S+@\S+\.\S+/;
	if (!emailRegex.test(email)) return 'Invalid email format';
	if (password.length < 6) return 'Password must be at least 6 characters';
	return null;
};

// ----------------- SIGNUP -----------------
const signup = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		const validationError = validateSignup(username, email, password);
		if (validationError)
			return res.status(400).json({ message: validationError });

		const existingUser = await User.findOne({ where: { email } });
		if (existingUser)
			return res.status(400).json({ message: 'User already exists' });

		const hashedPassword = await bcrypt.hash(password, 12);

		const user = await User.create({
			username,
			email,
			password: hashedPassword,
		});

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		// Send refresh token as HttpOnly cookie
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'Strict',
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		});

		res.status(201).json({
			id: user.id,
			username: user.username,
			email: user.email,
			token: accessToken,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// ----------------- LOGIN -----------------
const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password)
			return res.status(400).json({ message: 'Email and password required' });

		const user = await User.findOne({ where: { email } });
		if (!user)
			return res.status(401).json({ message: 'Invalid email or password' });

		let isMatch = false;

		// Plain-text migration: detect hashed password
		if (user.password.startsWith('$2')) {
			isMatch = await bcrypt.compare(password, user.password);
		} else {
			// Plain-text fallback
			isMatch = password === user.password;
			if (isMatch) {
				// Hash password after successful login
				user.password = await bcrypt.hash(password, 12);
				await user.save();
			}
		}

		if (!isMatch)
			return res.status(401).json({ message: 'Invalid email or password' });

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'Strict',
			maxAge: 30 * 24 * 60 * 60 * 1000,
		});

		res.json({
			id: user.id,
			username: user.username,
			email: user.email,
			token: accessToken,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// ----------------- REFRESH TOKEN -----------------
const refreshToken = async (req, res) => {
	try {
		const token = req.cookies.refreshToken;
		if (!token)
			return res.status(401).json({ message: 'No refresh token provided' });

		const payload = verifyRefreshToken(token);
		if (!payload)
			return res
				.status(403)
				.json({ message: 'Invalid or expired refresh token' });

		const user = await User.findByPk(payload.id);
		if (!user) return res.status(404).json({ message: 'User not found' });

		const newAccessToken = generateAccessToken(user);
		const newRefreshToken = generateRefreshToken(user);

		res.cookie('refreshToken', newRefreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'Strict',
			maxAge: 30 * 24 * 60 * 60 * 1000,
		});

		res.json({ token: newAccessToken });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// ----------------- LOGOUT -----------------
const logout = (req, res) => {
	res.clearCookie('refreshToken', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'Strict',
	});
	res.json({ message: 'Logged out successfully' });
};

module.exports = { signup, login, refreshToken, logout };
