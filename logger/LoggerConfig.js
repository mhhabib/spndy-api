// logger/LoggerConfig.js
require('dotenv').config();
const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, json } = format;
const { Logtail } = require('@logtail/node');
const { LogtailTransport } = require('@logtail/winston');

const logtail = new Logtail('gcfC6vxHJ4bRB7S53HpP6zic');

const ProductionLogger = createLogger({
	level: 'info',
	format: combine(timestamp(), json()),
	defaultMeta: { service: 'spndy-api' },
	transports: [new LogtailTransport(logtail)],
});

// ----- Development / Debug Logger -----
const DebugLogger = createLogger({
	level: 'debug',
	format: combine(
		timestamp(),
		printf((info) => `${info.timestamp} [${info.level}] : ${info.message}`)
	),
	defaultMeta: { service: 'spndy-api' },
	transports: [
		new transports.Console(),
		new transports.File({ filename: './Logs/error.log', level: 'error' }),
		new transports.File({ filename: './Logs/combined.log' }),
	],
});

// ----- Auto flush Logtail on exit -----
const flushLogtail = async () => {
	try {
		await logtail.flush();
		console.log('✅ Logtail logs flushed');
	} catch (err) {
		console.error('❌ Failed to flush Logtail logs:', err);
	}
};

process.on('beforeExit', flushLogtail);
process.on('SIGINT', async () => {
	await flushLogtail();
	process.exit(0);
});
process.on('SIGTERM', async () => {
	await flushLogtail();
	process.exit(0);
});

// ----- Export the right logger based on NODE_ENV -----
const logger =
	process.env.NODE_ENV === 'development' ? DebugLogger : ProductionLogger;

module.exports = { logger, logtail };
