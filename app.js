const express = require('express');
const cors = require('cors');
const { Op } = require('sequelize');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const expenseRoutes = require('./routes/expense.routes');
const reportRoutes = require('./routes/report.routes');

// Import database connection
const { sequelize, testDbConnection } = require('./config/db');

// Initialize app
const app = express();
app.use(express.static('public'));

// Middleware
// Define allowed origins
const allowedOrigins = [
	'http://localhost:8080',
	'http://localhost:3000',
	'https://spndy.xyz',
];

// Apply CORS middleware first
app.use(
	cors({
		origin: function (origin, callback) {
			// Allow requests with no origin (like mobile apps or curl requests)
			if (!origin) return callback(null, true);

			if (allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				console.log('Blocked by CORS: ', origin);
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: [
			'Origin',
			'X-Requested-With',
			'Content-Type',
			'Accept',
			'Authorization',
		],
	})
);

// Handle OPTIONS preflight requests
app.options('*', cors());

// Explicit CORS header setting for all responses
app.use((req, res, next) => {
	const origin = req.headers.origin;
	if (allowedOrigins.includes(origin)) {
		res.header('Access-Control-Allow-Origin', origin);
	}
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	res.header('Access-Control-Allow-Credentials', 'true');

	// Handle preflight
	if (req.method === 'OPTIONS') {
		return res.status(204).end();
	}
	next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form-data

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);

// Test database connection
testDbConnection();

// Sync sequelize models with database
const syncDb = async () => {
	try {
		await sequelize.sync();
		console.log('Database synced successfully');
	} catch (error) {
		console.error('Error syncing database:', error);
	}
};

syncDb();

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: 'Server error' });
});

// Export app for server to use
module.exports = app;
