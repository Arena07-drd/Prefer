import { Router } from 'express';
import { getAuditLogs } from '../../controllers/auditLogController.js';
import validate from '../../middleware/validate.js';
import authenticate from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';
import { auditLogQuerySchema } from '../../validators/reportValidator.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/', validate(auditLogQuerySchema, 'query'), getAuditLogs);

export default router;
