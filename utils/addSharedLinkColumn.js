const { sequelize } = require('../config/db');

async function runMigration() {
	await sequelize.query(`
    ALTER TABLE tours
    ADD COLUMN sharedLink VARCHAR(255) DEFAULT NULL;
  `);
	console.log('Column sharedLink added successfully!');
}

module.exports = runMigration;
