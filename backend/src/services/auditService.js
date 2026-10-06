import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

export const createAuditLog = async ({ userId, userName, action, entityType, entityId, changes, metadata, req }) => {
  try {
    let ipAddress = null;
    let userAgent = null;

    if (req) {
      ipAddress = req.ip || req.connection?.remoteAddress;
      userAgent = req.headers?.['user-agent'];
    }

    const log = new AuditLog({
      userId,
      userName,
      action,
      entityType,
      entityId,
      changes,
      metadata,
      ipAddress,
      userAgent
    });

    // Fire and forget
    log.save().catch(err => {
      logger.error('Failed to save audit log:', err);
    });

    return log;
  } catch (error) {
    logger.error('Error creating audit log:', error);
  }
};

export const getAuditLogs = async (filters = {}, paginationParams) => {
  const query = {};

  if (filters.entityType) query.entityType = filters.entityType;
  if (filters.entityId) query.entityId = filters.entityId;
  if (filters.userId) query.userId = filters.userId;
  if (filters.action) query.action = filters.action;
  
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  const { skip = 0, limit = 10, sort = { createdAt: -1 } } = paginationParams || {};

  const [logs, total] = await Promise.all([
    AuditLog.find(query).sort(sort).skip(skip).limit(limit),
    AuditLog.countDocuments(query)
  ]);

  return { logs, total };
};
