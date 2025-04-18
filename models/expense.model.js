const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user.model');
const Category = require('./category.model');

const Expense = sequelize.define('Expense', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	description: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	amount: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: false,
	},
	date: {
		type: DataTypes.DATEONLY,
		allowNull: false,
		defaultValue: DataTypes.NOW,
	},
});

// Set up relationships
User.hasMany(Expense);
Expense.belongsTo(User);

Category.hasMany(Expense);
Expense.belongsTo(Category);

module.exports = Expense;
