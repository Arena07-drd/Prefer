import winston from 'winston';
import config from '../config/index.js';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

const transports = [
  new winston.transports.Console({
    format: config.env === 'development' 
      ? winston.format.combine(winston.format.colorize({ all: true }), format) 
      : winston.format.json(),
  }),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  }),
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  }),
];

const logger = winston.createLogger({
  level: config.logLevel,
  levels,
  transports,
});

export const morganStream = {
  write: (message) => logger.http(message.trim()),
};

export default logger;
