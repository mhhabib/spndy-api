const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user.model');

const Ledger = sequelize.define('Ledger', {
	id: {
		type: DataTypes.STRING,
		primaryKey: true,
	},
	from: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	to: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	type: {
		type: DataTypes.ENUM('BORROW', 'LEND'),
		allowNull: false,
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

Ledger.beforeCreate((record, options) => {
	record.id = `hisab_${Date.now()}`;
});

User.hasMany(Ledger);
Ledger.belongsTo(User);

module.exports = Ledger;
