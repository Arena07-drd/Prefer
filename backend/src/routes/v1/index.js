import { Router } from 'express';
import authRouter from './authRoutes.js';
import userRouter from './userRoutes.js';
import categoryRouter from './categoryRoutes.js';
import productRouter from './productRoutes.js';
import orderRouter from './orderRoutes.js';
import notificationRouter from './notificationRoutes.js';
import reportRouter from './reportRoutes.js';
import auditLogRouter from './auditLogRoutes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/categories', categoryRouter);
router.use('/products', productRouter);
router.use('/orders', orderRouter);
router.use('/notifications', notificationRouter);
router.use('/reports', reportRouter);
router.use('/audit-logs', auditLogRouter);

export default router;
