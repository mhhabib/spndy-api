const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Entry = sequelize.define(
	'TourDay',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		location: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		amount: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: true,
		},
		type: {
			type: DataTypes.ENUM(
				'food',
				'expense',
				'experience',
				'hotel',
				'shopping',
				'transport'
			),
			allowNull: false,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = Entry;
