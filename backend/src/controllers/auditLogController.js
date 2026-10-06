import catchAsync from '../utils/catchAsync.js';
import { sendPaginated } from '../utils/responseFormatter.js';
import { getAuditLogs as getLogsService } from '../services/auditService.js';
import { getPaginationParams } from '../utils/pagination.js';

export const getAuditLogs = catchAsync(async (req, res) => {
  const { entityType, userId, action, startDate, endDate } = req.query;
  const filters = { entityType, userId, action, startDate, endDate };
  
  const paginationParams = getPaginationParams(req.query);
  const result = await getLogsService(filters, paginationParams);
  
  sendPaginated(res, result.logs, result.pagination, 'Audit logs retrieved successfully');
});
