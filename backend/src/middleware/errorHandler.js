import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

export default function errorHandler(err, req, res, next) {
  // 1. Log the error
  if (config.env === 'development') {
    logger.error(err.stack || err);
  } else {
    logger.error(err.message || err);
  }

  let error = err;
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let errors = null;

  // 2. Handle specific error types
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(el => ({
      field: el.path,
      message: el.message
    }));
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for ${field}`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err instanceof AppError && err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
    if (err.details) {
      errors = err.details;
    }
  }

  // 3 & 4. Response format
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(config.env === 'development' && { stack: err.stack })
  });
}
