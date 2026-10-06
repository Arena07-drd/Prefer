import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';
import validate from '../../middleware/validate.js';
import * as productController from '../../controllers/productController.js';
import { createProductSchema, updateProductSchema, productIdParamSchema, productQuerySchema } from '../../validators/productValidator.js';

const router = Router();

router.get('/', authenticate, validate(productQuerySchema, 'query'), productController.getProducts);
router.get('/search', authenticate, productController.searchProducts);
router.get('/:id', authenticate, validate(productIdParamSchema, 'params'), productController.getProduct);
router.post('/', authenticate, authorize('admin'), validate(createProductSchema), productController.createProduct);
router.patch('/:id', authenticate, authorize('admin'), validate(productIdParamSchema, 'params'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), validate(productIdParamSchema, 'params'), productController.deleteProduct);

export default router;
