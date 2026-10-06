import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';
import validate from '../../middleware/validate.js';
import * as categoryController from '../../controllers/categoryController.js';
import { createCategorySchema, updateCategorySchema, categoryIdParamSchema } from '../../validators/categoryValidator.js';

const router = Router();

router.get('/', authenticate, categoryController.getCategories);
router.get('/:id', authenticate, validate(categoryIdParamSchema, 'params'), categoryController.getCategory);
router.post('/', authenticate, authorize('admin'), validate(createCategorySchema), categoryController.createCategory);
router.patch('/:id', authenticate, authorize('admin'), validate(categoryIdParamSchema, 'params'), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('admin'), validate(categoryIdParamSchema, 'params'), categoryController.deleteCategory);

export default router;
