import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

const authenticate = catchAsync(async (req, res, next) => {
  // 1. Extracts token from Authorization header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. If no token, throw unauthorized
  if (!token) {
    return next(AppError.unauthorized('Access token is required'));
  }

  // 3. Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.accessSecret);
  } catch (err) {
    return next(AppError.unauthorized('Invalid or expired token'));
  }

  // 4. Find user by decoded.userId
  const user = await User.findById(decoded.userId);

  // 5. If user not found or inactive, throw unauthorized
  if (!user || !user.isActive) {
    return next(AppError.unauthorized('User not found or inactive'));
  }

  // 6. Attach user to req.user
  req.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  // 7. Call next
  next();
});

export default authenticate;
