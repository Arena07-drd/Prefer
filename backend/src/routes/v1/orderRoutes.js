import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';
import validate from '../../middleware/validate.js';
import { strictLimiter } from '../../middleware/rateLimiter.js';
import {
  createOrder,
  getOrders,
  getOrder,
  editOrder,
  updateStatus,
  updatePayment
} from '../../controllers/orderController.js';
import {
  createOrderSchema,
  editOrderSchema,
  updateStatusSchema,
  updatePaymentSchema,
  orderIdParamSchema,
  orderQuerySchema
} from '../../validators/orderValidator.js';

const router = Router();

router.use(authenticate);

router.post('/', strictLimiter, validate(createOrderSchema), createOrder);
router.get('/', validate(orderQuerySchema, 'query'), getOrders);
router.get('/:id', validate(orderIdParamSchema, 'params'), getOrder);
router.patch('/:id', authorize('admin', 'staff'), validate(orderIdParamSchema, 'params'), validate(editOrderSchema), editOrder);
router.patch('/:id/status', authorize('admin', 'staff'), validate(orderIdParamSchema, 'params'), validate(updateStatusSchema), updateStatus);
router.patch('/:id/payment', authorize('admin', 'staff'), validate(orderIdParamSchema, 'params'), validate(updatePaymentSchema), updatePayment);

export default router;
