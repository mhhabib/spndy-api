require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const { Op } = require('sequelize');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const expenseRoutes = require('./routes/expense.routes');
const reportRoutes = require('./routes/report.routes');
const tourRoutes = require('./routes/tour.routes');
const tourEntryRoutes = require('./routes/tourEntry.routes');

// DB
const { sequelize, testDbConnection } = require('./config/db');

const app = express();

// ------------------------------
// Trust proxy if behind CDN/ELB
// ------------------------------
if (process.env.TRUST_PROXY === '1') {
	app.set('trust proxy', true);
}

// ------------------------------
// Security + Compression + Logs
// ------------------------------
app.use(
	helmet({
		crossOriginResourcePolicy: { policy: 'cross-origin' },
		contentSecurityPolicy:
			process.env.NODE_ENV === 'production'
				? {
						directives: {
							defaultSrc: ["'self'"],
							scriptSrc: ["'self'"],
							styleSrc: ["'self'", "'unsafe-inline'"],
							imgSrc: ["'self'", 'data:', 'https:'],
							connectSrc: ["'self'"],
							fontSrc: ["'self'"],
							objectSrc: ["'none'"],
							mediaSrc: ["'self'"],
							frameSrc: ["'none'"],
						},
				  }
				: false,
	})
);

app.use(compression());

if (process.env.NODE_ENV !== 'development') {
	app.use(morgan('combined'));
} else {
	app.use(morgan('dev')); // More readable in development
}

// ------------------------------
// CORS config (dev vs prod)
// ------------------------------
const devOrigins = [
	'http://localhost:3000',
	'http://localhost:8080',
	'http://localhost:5173',
];

const prodOrigins = ['https://spndy.xyz'];

const allowedOrigins =
	process.env.NODE_ENV === 'production'
		? prodOrigins
		: [...devOrigins, ...prodOrigins];

app.use(
	cors({
		origin(origin, callback) {
			// Allow non-browser tools (curl, Postman, etc.)
			if (!origin) return callback(null, true);

			if (allowedOrigins.includes(origin)) {
				return callback(null, true);
			}

			console.warn(`CORS blocked for origin: ${origin}`);
			return callback(new Error(`CORS blocked for origin: ${origin}`));
		},
		credentials: true, // This is crucial for cookies
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: [
			'Origin',
			'X-Requested-With',
			'Content-Type',
			'Accept',
			'Authorization',
		],
		exposedHeaders: ['X-Total-Count'],
	})
);

// Explicit preflight handling
app.options('*', cors());
app.use(cookieParser());
// ------------------------------
// Parsers
// ------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------
// Static assets with long-lived cache
// ------------------------------
// For fingerprinted (hashed) files like app.abc123.js, we can mark as immutable
app.use(
	express.static('public', {
		etag: true,
		lastModified: true,
		maxAge: '30d',
		setHeaders: (res, path) => {
			// If the filename looks hashed, make it immutable
			if (/\.[0-9a-f]{8,}\./i.test(path)) {
				res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
			}
		},
	})
);

// ------------------------------
// API-level HTTP caching
// ------------------------------
// Keep API fresh but allow short-lived caching + validator-based revalidation.
// Note: Express sends ETag by default for JSON. You can also add Last-Modified if you track it.
app.use((req, res, next) => {
	if (
		req.method === 'GET' &&
		(req.path.startsWith('/api/reports/range') ||
			req.path.startsWith('/api/reports/myexpense/range') ||
			req.path.startsWith('/api/categories'))
	) {
		res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=30');
	}
	return next();
});

// ------------------------------
// Routes
// ------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/entries', tourEntryRoutes);

// ------------------------------
// DB init
// ------------------------------
(async () => {
	try {
		await testDbConnection();
		await sequelize.sync();
		console.log('Database connected & synced');
	} catch (err) {
		console.error('Database init error:', err);
	}
})();

app.use((req, res) => {
	res.status(404).json({ message: 'Not found' });
});

// ------------------------------
// Error handler (final)
// ------------------------------
app.use((err, req, res, next) => {
	console.error(err.stack || err.message || err);
	const status =
		err.message && err.message.startsWith('CORS blocked') ? 403 : 500;
	res.status(status).json({ message: err.message || 'Server error' });
});

module.exports = app;
