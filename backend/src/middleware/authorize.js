import AppError from '../utils/AppError.js';

export default function authorize(...roles) {
  return (req, res, next) => {
    // 1. Check if req.user exists
    if (!req.user) {
      return next(AppError.unauthorized('User is not authenticated'));
    }

    // 2. Check if req.user.role is in the roles array
    if (!roles.includes(req.user.role)) {
      // 3. If not, throw forbidden
      return next(AppError.forbidden('You do not have permission to perform this action'));
    }

    // 4. Call next
    next();
  };
}
