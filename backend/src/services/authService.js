import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { createAuditLog } from './auditService.js';

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const login = async (email, password, req) => {
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !user.isActive) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  const hashedToken = hashToken(refreshToken);
  const family = crypto.randomUUID();

  // 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    token: hashedToken,
    userId: user._id,
    family,
    expiresAt,
    userAgent: req?.headers?.['user-agent'],
    ipAddress: req?.ip
  });

  user.lastLogin = new Date();
  await user.save();

  createAuditLog({
    userId: user._id,
    userName: user.name,
    action: 'USER_LOGIN',
    entityType: 'User',
    entityId: user._id,
    req
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessName: user.businessName,
      phone: user.phone
    },
    accessToken,
    refreshToken
  };
};

export const refreshTokens = async (refreshToken, req) => {
  const hashedToken = hashToken(refreshToken);
  const tokenDoc = await RefreshToken.findOne({ token: hashedToken });

  if (!tokenDoc) {
    throw AppError.unauthorized('Invalid refresh token');
  }

  if (tokenDoc.isRevoked) {
    await RefreshToken.updateMany(
      { family: tokenDoc.family },
      { $set: { isRevoked: true } }
    );
    throw AppError.unauthorized('Token reuse detected. All sessions revoked.');
  }

  if (tokenDoc.expiresAt < new Date()) {
    throw AppError.unauthorized('Refresh token expired');
  }

  tokenDoc.isRevoked = true;
  await tokenDoc.save();

  const user = await User.findById(tokenDoc.userId);
  if (!user || !user.isActive) {
    throw AppError.unauthorized('User not found or inactive');
  }

  const newAccessToken = generateAccessToken(user);
  const newRawRefreshToken = generateRefreshToken();
  const newHashedToken = hashToken(newRawRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    token: newHashedToken,
    userId: user._id,
    family: tokenDoc.family,
    expiresAt,
    userAgent: req?.headers?.['user-agent'],
    ipAddress: req?.ip
  });

  tokenDoc.replacedBy = newHashedToken;
  await tokenDoc.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRawRefreshToken
  };
};

export const logout = async (refreshToken) => {
  if (!refreshToken) return true;
  const hashedToken = hashToken(refreshToken);
  const tokenDoc = await RefreshToken.findOne({ token: hashedToken });
  
  if (tokenDoc) {
    await RefreshToken.updateMany(
      { family: tokenDoc.family },
      { $set: { isRevoked: true } }
    );
  }
  return true;
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw AppError.notFound('User not found');

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw AppError.unauthorized('Invalid old password');

  user.password = newPassword;
  await user.save();

  await RefreshToken.updateMany(
    { userId: user._id },
    { $set: { isRevoked: true } }
  );

  createAuditLog({
    userId: user._id,
    userName: user.name,
    action: 'PASSWORD_CHANGED',
    entityType: 'User',
    entityId: user._id
  });

  return true;
};

export const resetPassword = async (userId, newPassword, resetByUser) => {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User not found');

  user.password = newPassword;
  await user.save();

  await RefreshToken.updateMany(
    { userId: user._id },
    { $set: { isRevoked: true } }
  );

  createAuditLog({
    userId: resetByUser.id,
    userName: resetByUser.name,
    action: 'PASSWORD_RESET',
    entityType: 'User',
    entityId: user._id,
    metadata: { resetTarget: user.email }
  });

  return true;
};
