const app = require('./app');
require('dotenv').config();
const { logger } = require("./logger/LoggerConfig");
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	logger.info(`Server running on port ${PORT}`);
});
