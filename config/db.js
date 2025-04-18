const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
	dialect: 'postgres',
	logging: false,
});

const testDbConnection = async () => {
	try {
		await sequelize.authenticate();
		console.log('Database connection established successfully');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
};

module.exports = { sequelize, testDbConnection };
