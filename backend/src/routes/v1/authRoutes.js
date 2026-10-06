import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import validate from '../../middleware/validate.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { login, refresh, logout, changePassword, getMe } from '../../controllers/authController.js';
import { loginSchema, refreshSchema, changePasswordSchema } from '../../validators/authValidator.js';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', validate(refreshSchema), logout);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);
router.get('/me', authenticate, getMe);

export default router;
