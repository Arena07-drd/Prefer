import { Router } from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../controllers/notificationController.js';
import validate from '../../middleware/validate.js';
import authenticate from '../../middleware/authenticate.js';
import { notificationIdParamSchema, notificationQuerySchema } from '../../validators/notificationValidator.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(notificationQuerySchema, 'query'), getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', validate(notificationIdParamSchema, 'params'), markAsRead);

export default router;
