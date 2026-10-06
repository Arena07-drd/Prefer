import catchAsync from '../utils/catchAsync.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responseFormatter.js';
import * as userService from '../services/userService.js';
import { getPaginationParams } from '../utils/pagination.js';
import * as authService from '../services/authService.js';

export const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body, req.user);
  sendCreated(res, { user });
});

export const getUsers = catchAsync(async (req, res) => {
  const filters = {
    role: req.query.role,
    isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    search: req.query.search
  };
  
  const paginationParams = getPaginationParams(req.query);
  const result = await userService.getUsers(filters, paginationParams);
  
  sendPaginated(res, result.users, result.pagination);
});

export const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, { user });
});

export const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user);
  sendSuccess(res, { user }, 'User updated successfully');
});

export const deactivateUser = catchAsync(async (req, res) => {
  await userService.deactivateUser(req.params.id, req.user);
  sendSuccess(res, null, 'User deactivated successfully');
});

export const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.params.id, req.body.newPassword, req.user);
  sendSuccess(res, null, 'Password reset successfully');
});
