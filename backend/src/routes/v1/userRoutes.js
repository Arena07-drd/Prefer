import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';
import validate from '../../middleware/validate.js';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deactivateUser,
  resetPassword
} from '../../controllers/userController.js';
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  userIdParamSchema
} from '../../validators/userValidator.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('admin'), validate(createUserSchema), createUser);
router.get('/', authorize('admin', 'staff'), getUsers);
router.get('/:id', authorize('admin', 'staff'), validate(userIdParamSchema, 'params'), getUser);
router.patch('/:id', authorize('admin'), validate(userIdParamSchema, 'params'), validate(updateUserSchema), updateUser);
router.delete('/:id', authorize('admin'), validate(userIdParamSchema, 'params'), deactivateUser);
router.post('/:id/reset-password', authorize('admin'), validate(userIdParamSchema, 'params'), validate(resetPasswordSchema), resetPassword);

export default router;
