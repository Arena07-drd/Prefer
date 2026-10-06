class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request') { return new AppError(message, 400); }
  static unauthorized(message = 'Unauthorized') { return new AppError(message, 401); }
  static forbidden(message = 'Forbidden') { return new AppError(message, 403); }
  static notFound(message = 'Resource not found') { return new AppError(message, 404); }
  static conflict(message = 'Conflict') { return new AppError(message, 409); }
  static tooManyRequests(message = 'Too many requests') { return new AppError(message, 429); }
  static internal(message = 'Internal server error') { return new AppError(message, 500); }
}

export default AppError;
