const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
	verifyAccessToken,
} = require('../utils/jwt.utils');

// Helper: validate signup inputs
const validateSignup = (username, email, password) => {
	if (!username || !email || !password) return 'All fields are required';
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Improved regex
	if (!emailRegex.test(email)) return 'Invalid email format';
	if (password.length < 8) return 'Password must be at least 8 characters'; // Increased security
	return null;
};

const getCookieOptions = () => ({
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'Strict',
	maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
});

// ----------------- SIGNUP -----------------
const signup = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		const validationError = validateSignup(username, email, password);
		if (validationError)
			return res.status(400).json({ message: validationError });

		const existingUser = await User.findOne({
			where: {
				[Op.or]: [{ email }, { username }],
			},
		});

		if (existingUser) {
			const field = existingUser.email === email ? 'Email' : 'Username';
			return res.status(400).json({ message: `${field} already exists` });
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		const user = await User.create({
			username,
			email,
			password: hashedPassword,
		});

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		res.cookie('refreshToken', refreshToken, getCookieOptions());

		res.status(201).json({
			id: user.id,
			username: user.username,
			email: user.email,
			token: accessToken,
		});
	} catch (error) {
		console.error('Signup error:', error);
		res.status(500).json({ message: 'Server error during signup' });
	}
};

// ----------------- LOGIN -----------------
const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password)
			return res.status(400).json({ message: 'Email and password required' });

		const user = await User.findOne({ where: { email } });

		let isMatch = false;

		if (user) {
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
		}

		// Always use same message for security (don't reveal if email exists)
		if (!user || !isMatch) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		res.cookie('refreshToken', refreshToken, getCookieOptions());

		res.json({
			id: user.id,
			username: user.username,
			email: user.email,
			token: accessToken,
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ message: 'Server error during login' });
	}
};

// ----------------- REFRESH TOKEN -----------------
const refreshToken = async (req, res) => {
	try {
		// Check if cookies are available
		if (!req.cookies) {
			console.error(
				'Cookies not available - cookie-parser middleware missing?'
			);
			return res.status(500).json({
				message: 'Server configuration error',
				debug:
					process.env.NODE_ENV === 'development'
						? 'Cookie parser not configured'
						: undefined,
			});
		}

		const token = req.cookies.refreshToken;
		if (!token) {
			return res.status(401).json({ message: 'No refresh token provided' });
		}

		const payload = verifyRefreshToken(token);
		if (!payload) {
			return res
				.status(403)
				.json({ message: 'Invalid or expired refresh token' });
		}

		const user = await User.findByPk(payload.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const newAccessToken = generateAccessToken(user);
		const newRefreshToken = generateRefreshToken(user);

		res.cookie('refreshToken', newRefreshToken, getCookieOptions());

		res.json({
			token: newAccessToken,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
			},
		});
	} catch (error) {
		console.error('Token refresh error:', error);
		res.status(500).json({ message: 'Server error during token refresh' });
	}
};

// ----------------- VALIDATE TOKEN -----------------
const validateToken = async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ message: 'No token provided' });
		}

		const token = authHeader.split(' ')[1];
		const payload = verifyAccessToken(token);

		if (!payload) {
			return res.status(401).json({ message: 'Invalid or expired token' });
		}

		const user = await User.findByPk(payload.id, {
			attributes: { exclude: ['password'] },
		});

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json({
			valid: true,
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
			},
		});
	} catch (error) {
		console.error('Token validation error:', error);
		res.status(401).json({ message: 'Token validation failed' });
	}
};

// ----------------- LOGOUT -----------------
const logout = (req, res) => {
	try {
		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'Strict',
		});
		res.json({ message: 'Logged out successfully' });
	} catch (error) {
		console.error('Logout error:', error);
		res.status(500).json({ message: 'Server error during logout' });
	}
};

module.exports = { signup, login, refreshToken, validateToken, logout };
