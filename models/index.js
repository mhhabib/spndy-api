const Sequelize = require('sequelize');
const { sequelize } = require('../config/db');

const Tour = require('./tour.model');
const Entry = require('./tourEntry.model');
const User = require('./user.model');
const Category = require('./category.model');

// Associations
Tour.hasMany(Entry, { foreignKey: 'tourId', as: 'entries' });
Entry.belongsTo(Tour, { foreignKey: 'tourId', as: 'tour' });

Entry.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Entry, { foreignKey: 'userId' });

Entry.belongsTo(Category, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
Category.hasMany(Entry, { foreignKey: 'categoryId' });

module.exports = {
	sequelize,
	Sequelize,
	Tour,
	Entry,
	User,
	Category,
};
