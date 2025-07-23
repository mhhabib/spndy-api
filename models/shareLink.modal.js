const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ShareLink = sequelize.define(
	'ShareLink',
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		isPublic: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		shareLink: {
			type: DataTypes.STRING,
			defaultValue: null,
		},
		tourId: {
			type: DataTypes.UUID,
			allowNull: false,
			unique: true,
		},
	},
	{
		tableName: 'sharelinks',
		timestamps: true,
	}
);

module.exports = ShareLink;
