import { Router } from 'express';
import { getDashboard, getSalesReport, getTopProducts, getTopCustomers, getOrdersSummary, getPaymentSummary } from '../../controllers/reportController.js';
import validate from '../../middleware/validate.js';
import authenticate from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';
import { salesReportQuerySchema, topItemsQuerySchema } from '../../validators/reportValidator.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin', 'staff'));

router.get('/dashboard', getDashboard);
router.get('/sales', validate(salesReportQuerySchema, 'query'), getSalesReport);
router.get('/top-products', validate(topItemsQuerySchema, 'query'), getTopProducts);
router.get('/top-customers', validate(topItemsQuerySchema, 'query'), getTopCustomers);
router.get('/orders-summary', getOrdersSummary);
router.get('/payments', getPaymentSummary);

export default router;
