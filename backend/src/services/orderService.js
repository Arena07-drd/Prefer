import Order from '../models/Order.js';
import Counter from '../models/Counter.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { createAuditLog } from './auditService.js';
import { validateCart } from './cartService.js';
import { getPaginationMeta } from '../utils/pagination.js';
import {
  notifyOrderPlaced,
  notifyOrderModified,
  notifyOrderStatusChange,
  notifyPaymentReceived
} from './notificationService.js';

const VALID_TRANSITIONS = {
  placed: ['accepted', 'cancelled'],
  accepted: ['preparing', 'modified', 'cancelled'],
  modified: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['delivered'],
  delivered: ['completed'],
  completed: [],
  cancelled: []
};

const generateOrderNumber = async () => {
  const nextVal = await Counter.getNextValue('orderNumber');
  return `ORD-${String(nextVal).padStart(5, '0')}`;
};

export const createOrder = async (customerId, items, notes, req) => {
  const customer = await User.findById(customerId);
  if (!customer || !customer.isActive) {
    throw AppError.badRequest('Invalid or inactive customer');
  }

  const { validatedItems, totalAmount, itemCount } = await validateCart(items);
  const orderNumber = await generateOrderNumber();

  const order = new Order({
    orderNumber,
    customerId,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerBusinessName: customer.businessName,
    status: 'placed',
    items: validatedItems,
    totalAmount,
    itemCount,
    notes,
    statusHistory: [{
      status: 'placed',
      changedBy: customerId,
      changedByName: customer.name,
      timestamp: new Date()
    }]
  });

  await order.save();

  await createAuditLog({
    userId: customerId,
    userName: customer.name,
    action: 'ORDER_CREATED',
    entityType: 'Order',
    entityId: order._id,
    changes: [],
    metadata: { orderNumber },
    req
  });

  // Notify staff about new order (fire-and-forget)
  notifyOrderPlaced(order).catch(err => logger.error('Failed to send order placed notification', err));

  return order;
};

export const editOrder = async (orderId, updatedItems, editedByUser, req) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (!['placed', 'accepted', 'modified'].includes(order.status)) {
    throw AppError.badRequest('Order cannot be edited in its current status');
  }

  const { validatedItems, totalAmount, itemCount } = await validateCart(updatedItems);
  const previousTotal = order.totalAmount;

  const changes = [
    { field: 'items', oldValue: order.items, newValue: validatedItems },
    { field: 'totalAmount', oldValue: previousTotal, newValue: totalAmount },
    { field: 'itemCount', oldValue: order.itemCount, newValue: itemCount }
  ];

  order.items = validatedItems;
  order.totalAmount = totalAmount;
  order.itemCount = itemCount;

  if (order.status === 'accepted') {
    order.status = 'modified';
    order.statusHistory.push({
      status: 'modified',
      changedBy: editedByUser.id,
      changedByName: editedByUser.name,
      timestamp: new Date(),
      note: 'Order modified'
    });
  }

  order.modificationHistory.push({
    modifiedBy: editedByUser.id,
    modifiedByName: editedByUser.name,
    timestamp: new Date(),
    changes,
    previousTotal,
    newTotal: totalAmount
  });

  await order.save();

  await createAuditLog({
    userId: editedByUser.id,
    userName: editedByUser.name,
    action: 'ORDER_MODIFIED',
    entityType: 'Order',
    entityId: order._id,
    changes,
    metadata: { orderNumber: order.orderNumber },
    req
  });

  // Notify customer about order modification (fire-and-forget)
  notifyOrderModified(order, previousTotal, totalAmount).catch(err =>
    logger.error('Failed to send order modified notification', err)
  );

  return order;
};

export const updateOrderStatus = async (orderId, newStatus, note, updatedByUser, req) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (!VALID_TRANSITIONS[order.status]?.includes(newStatus)) {
    throw AppError.badRequest(`Cannot transition from '${order.status}' to '${newStatus}'`);
  }

  const oldStatus = order.status;
  order.status = newStatus;
  
  order.statusHistory.push({
    status: newStatus,
    changedBy: updatedByUser.id,
    changedByName: updatedByUser.name,
    timestamp: new Date(),
    note
  });

  await order.save();

  await createAuditLog({
    userId: updatedByUser.id,
    userName: updatedByUser.name,
    action: 'ORDER_STATUS_UPDATED',
    entityType: 'Order',
    entityId: order._id,
    changes: [{ field: 'status', oldValue: oldStatus, newValue: newStatus }],
    metadata: { orderNumber: order.orderNumber },
    req
  });

  // Notify customer about status change (fire-and-forget)
  notifyOrderStatusChange(order, newStatus).catch(err =>
    logger.error('Failed to send status change notification', err)
  );

  return order;
};

export const updatePaymentStatus = async (orderId, isPaid, markedByUser, req) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw AppError.notFound('Order not found');
  }

  const oldPaymentStatus = order.paymentStatus;
  
  if (isPaid) {
    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.paidMarkedBy = markedByUser.id;
  } else {
    order.paymentStatus = 'pending';
    order.paidAt = undefined;
    order.paidMarkedBy = undefined;
  }

  await order.save();

  await createAuditLog({
    userId: markedByUser.id,
    userName: markedByUser.name,
    action: 'PAYMENT_STATUS_UPDATED',
    entityType: 'Order',
    entityId: order._id,
    changes: [{ field: 'paymentStatus', oldValue: oldPaymentStatus, newValue: order.paymentStatus }],
    metadata: { orderNumber: order.orderNumber },
    req
  });

  // Notify customer about payment status (fire-and-forget)
  if (isPaid) {
    notifyPaymentReceived(order).catch(err =>
      logger.error('Failed to send payment notification', err)
    );
  }

  return order;
};

export const getOrders = async (filters = {}, paginationParams = { page: 1, limit: 10, sort: '-createdAt' }) => {
  const { page, limit, sort } = paginationParams;
  const skip = (page - 1) * limit;

  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.customerId) query.customerId = filters.customerId;
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }
  if (filters.search) {
    query.orderNumber = { $regex: filters.search, $options: 'i' };
  }

  const [orders, total] = await Promise.all([
    Order.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Order.countDocuments(query)
  ]);

  return { orders, pagination: getPaginationMeta(total, page, limit) };
};

export const getCustomerOrders = async (customerId, filters = {}, paginationParams = { page: 1, limit: 10, sort: '-createdAt' }) => {
  filters.customerId = customerId;
  const { orders, pagination } = await getOrders(filters, paginationParams);
  
  const sanitizedOrders = orders.map(order => {
    const { internalNotes, ...rest } = order;
    return rest;
  });

  return { orders: sanitizedOrders, pagination };
};

export const getOrderById = async (orderId, requestingUser) => {
  const order = await Order.findById(orderId).lean();
  if (!order) {
    throw AppError.notFound('Order not found');
  }

  if (requestingUser.role === 'customer' && order.customerId.toString() !== requestingUser.id.toString()) {
    throw AppError.forbidden('Access denied');
  }

  if (requestingUser.role === 'customer') {
    delete order.internalNotes;
  }

  return order;
};
