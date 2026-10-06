import catchAsync from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responseFormatter.js';
import * as reportService from '../services/reportService.js';

export const getDashboard = catchAsync(async (req, res) => {
  const stats = await reportService.getDashboardStats();
  sendSuccess(res, stats, 'Dashboard stats retrieved successfully');
});

export const getSalesReport = catchAsync(async (req, res) => {
  const { period, startDate, endDate } = req.query;
  const report = await reportService.getSalesReport(period, startDate, endDate);
  sendSuccess(res, report, 'Sales report retrieved successfully');
});

export const getTopProducts = catchAsync(async (req, res) => {
  const { limit, startDate, endDate } = req.query;
  const products = await reportService.getTopProducts(limit, startDate, endDate);
  sendSuccess(res, products, 'Top products retrieved successfully');
});

export const getTopCustomers = catchAsync(async (req, res) => {
  const { limit, startDate, endDate } = req.query;
  const customers = await reportService.getTopCustomers(limit, startDate, endDate);
  sendSuccess(res, customers, 'Top customers retrieved successfully');
});

export const getOrdersSummary = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const summary = await reportService.getOrdersSummary(startDate, endDate);
  sendSuccess(res, summary, 'Orders summary retrieved successfully');
});

export const getPaymentSummary = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const summary = await reportService.getPaymentSummary(startDate, endDate);
  sendSuccess(res, summary, 'Payment summary retrieved successfully');
});
