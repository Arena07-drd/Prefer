import catchAsync from '../utils/catchAsync.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responseFormatter.js';
import * as orderService from '../services/orderService.js';
import { getPaginationParams } from '../utils/pagination.js';

export const createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body.items, req.body.notes, req);
  sendCreated(res, { order }, 'Order placed successfully');
});

export const getOrders = catchAsync(async (req, res) => {
  const pagination = getPaginationParams(req.query);
  const filters = {
    status: req.query.status,
    paymentStatus: req.query.paymentStatus,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    search: req.query.search
  };

  let result;
  if (req.user.role === 'customer') {
    result = await orderService.getCustomerOrders(req.user.id, filters, pagination);
  } else {
    result = await orderService.getOrders(filters, pagination);
  }

  sendPaginated(res, result.orders, result.pagination, 'Orders retrieved successfully');
});

export const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user);
  sendSuccess(res, { order }, 'Order retrieved successfully');
});

export const editOrder = catchAsync(async (req, res) => {
  const order = await orderService.editOrder(req.params.id, req.body.items, req.user, req);
  sendSuccess(res, { order }, 'Order updated successfully');
});

export const updateStatus = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status, req.body.note, req.user, req);
  sendSuccess(res, { order }, 'Order status updated');
});

export const updatePayment = catchAsync(async (req, res) => {
  const order = await orderService.updatePaymentStatus(req.params.id, req.body.isPaid, req.user, req);
  sendSuccess(res, { order }, 'Payment status updated');
});
