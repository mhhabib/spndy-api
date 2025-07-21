const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Tour = sequelize.define(
	'Tour',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		location: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		startDate: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		endDate: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		totalCost: {
			type: DataTypes.DECIMAL(10, 2),
			defaultValue: 0,
		},
		isPublic: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		sharedLink: {
			type: DataTypes.STRING,
			defaultValue: null,
		},
	},
	{
		tableName: 'tours',
		timestamps: true,
	}
);

module.exports = Tour;
