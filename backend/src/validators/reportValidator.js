import Joi from 'joi';

export const salesReportQuerySchema = Joi.object({
  period: Joi.string().valid('daily', 'weekly', 'monthly').default('daily'),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso()
});

export const topItemsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso()
});

export const auditLogQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sort: Joi.string().trim(),
  entityType: Joi.string().trim(),
  userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  action: Joi.string().trim(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso()
});
