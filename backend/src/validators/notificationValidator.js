import Joi from 'joi';

export const notificationIdParamSchema = Joi.object({
  id: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/)
});

export const notificationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  isRead: Joi.boolean()
});
