import Notification from '../models/Notification.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { getPaginationMeta } from '../utils/pagination.js';

export const createNotification = async ({ userId, title, message, type, entityType, entityId }) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      entityType,
      entityId
    });
    const savedNotification = await notification.save();
    return savedNotification;
  } catch (error) {
    logger.error('Error creating notification:', error);
  }
};

export const notifyCustomer = async (customerId, { title, message, type, entityType, entityId }) => {
  return createNotification({
    userId: customerId,
    title,
    message,
    type,
    entityType,
    entityId
  });
};

export const notifyStaff = async ({ title, message, type, entityType, entityId }) => {
  try {
    const staffUsers = await User.find({ role: { $in: ['staff', 'admin'] }, isActive: true });
    
    if (staffUsers.length > 0) {
      const notifications = staffUsers.map(user => ({
        userId: user._id,
        title,
        message,
        type,
        entityType,
        entityId
      }));
      
      await Notification.insertMany(notifications, { ordered: false });
    }
  } catch (error) {
    logger.error('Error notifying staff:', error);
  }
};

export const notifyOrderPlaced = async (order) => {
  return notifyStaff({
    title: 'New Order Received',
    message: `Order ${order.orderNumber} placed by ${order.customerName}. Total: ₹${order.totalAmount}`,
    type: 'new_order',
    entityType: 'Order',
    entityId: order._id
  });
};

export const notifyOrderStatusChange = async (order, newStatus) => {
  let message = '';
  switch (newStatus) {
    case 'accepted': message = 'Your order has been accepted'; break;
    case 'preparing': message = 'Your order is being prepared'; break;
    case 'ready': message = 'Your order is ready for pickup/delivery'; break;
    case 'delivered': message = 'Your order has been delivered'; break;
    case 'completed': message = 'Your order is completed'; break;
    case 'cancelled': message = 'Your order has been cancelled'; break;
    default: message = `Your order status changed to ${newStatus}`;
  }

  return notifyCustomer(order.customerId, {
    title: 'Order Status Update',
    message,
    type: `order_${newStatus}`,
    entityType: 'Order',
    entityId: order._id
  });
};

export const notifyOrderModified = async (order, previousTotal, newTotal) => {
  return notifyCustomer(order.customerId, {
    title: 'Order Updated',
    message: `Your order ${order.orderNumber} has been updated. Updated Total: ₹${newTotal}`,
    type: 'order_modified',
    entityType: 'Order',
    entityId: order._id
  });
};

export const notifyPaymentReceived = async (order) => {
  return notifyCustomer(order.customerId, {
    title: 'Payment Confirmed',
    message: `Payment for order ${order.orderNumber} has been received. Amount: ₹${order.totalAmount}`,
    type: 'payment_received',
    entityType: 'Order',
    entityId: order._id
  });
};

export const getUserNotifications = async (userId, filters = {}, paginationParams) => {
  const query = { userId };
  
  if (filters.isRead !== undefined) {
    query.isRead = filters.isRead === 'true' || filters.isRead === true;
  }
  
  const { skip, limit, page } = paginationParams;
  
  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(query)
  ]);
  
  const pagination = getPaginationMeta(total, page, limit);
  
  return { notifications, pagination };
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  
  if (!notification) {
    throw AppError.notFound('Notification not found');
  }
  
  return notification;
};

export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  
  return result.modifiedCount;
};

export const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ userId, isRead: false });
  return count;
};
