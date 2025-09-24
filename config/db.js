const { Sequelize } = require('sequelize');
require('dotenv').config();
const { logger } = require('../logger/LoggerConfig');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
	dialect: 'postgres',
	logging: false,
});

const testDbConnection = async () => {
	try {
		await sequelize.authenticate();
		logger.info('Database connection established successfully');
	} catch (error) {
		logger.error('Unable to connect to the database:', error);
	}
};

module.exports = { sequelize, testDbConnection };
