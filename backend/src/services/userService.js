import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { createAuditLog } from './auditService.js';
import { getPaginationMeta } from '../utils/pagination.js';

export const createUser = async (data, createdByUser) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw AppError.conflict('Email already in use');
  }

  const user = await User.create({
    ...data,
    createdBy: createdByUser.id
  });

  const userObj = user.toObject();
  delete userObj.password;

  createAuditLog({
    userId: createdByUser.id,
    userName: createdByUser.name,
    action: 'USER_CREATED',
    entityType: 'User',
    entityId: user._id,
    changes: { new: userObj }
  });

  return userObj;
};

export const getUsers = async (filters = {}, paginationParams = {}) => {
  const query = { isActive: filters.isActive !== undefined ? filters.isActive : true };

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { businessName: searchRegex }
    ];
  }

  const { skip = 0, limit = 10, sort = { createdAt: -1 }, page = 1 } = paginationParams;

  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort(sort).skip(skip).limit(limit),
    User.countDocuments(query)
  ]);

  return {
    users,
    pagination: getPaginationMeta(total, page, limit)
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw AppError.notFound('User not found');
  }
  return user;
};

export const updateUser = async (userId, data, updatedByUser) => {
  const user = await User.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found');
  }

  if (data.email && data.email !== user.email) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw AppError.conflict('Email already in use');
    }
  }

  const allowedFields = ['name', 'phone', 'businessName', 'address', 'isActive', 'role'];
  const oldValues = {};
  const newValues = {};

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      oldValues[field] = user[field];
      newValues[field] = data[field];
      user[field] = data[field];
    }
  });

  await user.save();

  const userObj = user.toObject();
  delete userObj.password;

  createAuditLog({
    userId: updatedByUser.id,
    userName: updatedByUser.name,
    action: 'USER_UPDATED',
    entityType: 'User',
    entityId: user._id,
    changes: { old: oldValues, new: newValues }
  });

  return userObj;
};

export const deactivateUser = async (userId, deactivatedByUser) => {
  const user = await User.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found');
  }

  user.isActive = false;
  await user.save();

  createAuditLog({
    userId: deactivatedByUser.id,
    userName: deactivatedByUser.name,
    action: 'USER_DEACTIVATED',
    entityType: 'User',
    entityId: user._id
  });

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};
