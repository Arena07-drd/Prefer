import catchAsync from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responseFormatter.js';
import * as authService from '../services/authService.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

export const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password, req);
  sendSuccess(res, result, 'Login successful');
});

export const refresh = catchAsync(async (req, res) => {
  const result = await authService.refreshTokens(req.body.refreshToken, req);
  sendSuccess(res, result, 'Tokens refreshed');
});

export const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  sendSuccess(res, null, 'Logged out successfully');
});

export const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
  sendSuccess(res, null, 'Password changed successfully');
});

export const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    throw AppError.notFound('User not found');
  }
  sendSuccess(res, { user });
});
