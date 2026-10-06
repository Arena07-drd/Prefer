import catchAsync from '../utils/catchAsync.js';
import { sendSuccess, sendPaginated } from '../utils/responseFormatter.js';
import * as notificationService from '../services/notificationService.js';
import { getPaginationParams } from '../utils/pagination.js';

export const getNotifications = catchAsync(async (req, res) => {
  const filters = {};
  if (req.query.isRead !== undefined) {
    filters.isRead = req.query.isRead;
  }
  
  const paginationParams = getPaginationParams(req.query);
  const { notifications, pagination } = await notificationService.getUserNotifications(req.user.id, filters, paginationParams);
  
  sendPaginated(res, notifications, pagination, 'Notifications retrieved successfully');
});

export const getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  sendSuccess(res, { count }, 'Unread count retrieved successfully');
});

export const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  sendSuccess(res, { notification }, 'Notification marked as read');
});

export const markAllAsRead = catchAsync(async (req, res) => {
  const count = await notificationService.markAllAsRead(req.user.id);
  sendSuccess(res, { count }, 'All notifications marked as read');
});
