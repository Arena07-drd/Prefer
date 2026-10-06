import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween.js';
dayjs.extend(isBetween);

export const getDashboardStats = async () => {
  const today = dayjs().startOf('day').toDate();
  const endOfToday = dayjs().endOf('day').toDate();

  const [
    todayOrdersCount,
    todayRevenueResult,
    pendingOrdersCount,
    pendingPaymentsCount,
    totalCustomersCount,
    totalProductsCount,
    recentOrdersList
  ] = await Promise.all([
    Order.countDocuments({
      createdAt: { $gte: today, $lte: endOfToday }
    }),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lte: endOfToday },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]),
    Order.countDocuments({
      status: { $in: ['placed', 'accepted', 'preparing'] }
    }),
    Order.countDocuments({
      paymentStatus: 'pending',
      status: { $ne: 'cancelled' }
    }),
    User.countDocuments({ role: 'customer', isActive: true }),
    Product.countDocuments({ status: 'active' }),
    Order.find()
      .select('orderNumber customerName totalAmount status paymentStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
  ]);

  const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].totalRevenue : 0;

  return {
    todayOrders: todayOrdersCount,
    todayRevenue,
    pendingOrders: pendingOrdersCount,
    pendingPayments: pendingPaymentsCount,
    totalCustomers: totalCustomersCount,
    totalProducts: totalProductsCount,
    recentOrders: recentOrdersList
  };
};

export const getSalesReport = async (period = 'daily', startDate, endDate) => {
  const matchQuery = { status: { $ne: 'cancelled' } };
  
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  let dateFormat;
  if (period === 'monthly') {
    dateFormat = '%Y-%m';
  } else if (period === 'weekly') {
    dateFormat = '%Y-W%V';
  } else {
    dateFormat = '%Y-%m-%d';
  }

  const sales = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        totalSales: 1,
        orderCount: 1
      }
    }
  ]);

  return sales;
};

export const getTopProducts = async (limit = 10, startDate, endDate) => {
  const matchQuery = {};
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const products = await Order.aggregate([
    { $match: matchQuery },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        productName: { $first: '$items.productName' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' },
        orderCount: { $addToSet: '$_id' }
      }
    },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        productName: 1,
        totalQuantity: 1,
        totalRevenue: 1,
        orderCount: { $size: '$orderCount' }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: parseInt(limit, 10) }
  ]);

  return products;
};

export const getTopCustomers = async (limit = 10, startDate, endDate) => {
  const matchQuery = {};
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const customers = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$customerId',
        customerName: { $first: '$customerName' },
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' }
      }
    },
    {
      $project: {
        _id: 0,
        customerId: '$_id',
        customerName: 1,
        totalOrders: 1,
        totalSpent: 1
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: parseInt(limit, 10) }
  ]);

  return customers;
};

export const getOrdersSummary = async (startDate, endDate) => {
  const matchQuery = {};
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const summary = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);

  const result = summary.reduce((acc, curr) => {
    acc[curr._id] = { count: curr.count, amount: curr.totalAmount };
    return acc;
  }, {});

  return result;
};

export const getPaymentSummary = async (startDate, endDate) => {
  const matchQuery = {};
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const summary = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        amount: { $sum: '$totalAmount' }
      }
    }
  ]);

  const result = {
    pending: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 }
  };

  summary.forEach(item => {
    if (item._id === 'pending') {
      result.pending = { count: item.count, amount: item.amount };
    } else if (item._id === 'paid') {
      result.paid = { count: item.count, amount: item.amount };
    }
  });

  return result;
};
