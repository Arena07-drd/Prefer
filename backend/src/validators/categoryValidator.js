import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().required().trim().max(100),
  description: Joi.string().trim().max(500).allow('', null),
  image: Joi.string().uri().trim().allow('', null),
  sortOrder: Joi.number().integer().min(0).default(0)
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().max(100),
  description: Joi.string().trim().max(500).allow('', null),
  image: Joi.string().uri().trim().allow('', null),
  sortOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean()
}).min(1);

export const categoryIdParamSchema = Joi.object({
  id: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid category ID format')
});
