import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().required().trim().max(200),
  description: Joi.string().trim().max(2000).allow('', null),
  category: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid category ID'),
  price: Joi.number().required().min(0).precision(2),
  images: Joi.array().items(Joi.string().uri().trim()).max(10),
  unit: Joi.string().trim().valid('kg', 'g', 'litre', 'ml', 'piece', 'packet', 'dozen', 'box', 'bundle').default('piece'),
  minOrderQuantity: Joi.number().integer().min(1).default(1),
  maxOrderQuantity: Joi.number().integer().min(1).allow(null),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(50)).max(20)
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().max(200),
  description: Joi.string().trim().max(2000).allow('', null),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid category ID'),
  price: Joi.number().min(0).precision(2),
  images: Joi.array().items(Joi.string().uri().trim()).max(10),
  unit: Joi.string().trim().valid('kg', 'g', 'litre', 'ml', 'piece', 'packet', 'dozen', 'box', 'bundle'),
  minOrderQuantity: Joi.number().integer().min(1),
  maxOrderQuantity: Joi.number().integer().min(1).allow(null),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(50)).max(20),
  status: Joi.string().valid('active', 'inactive')
}).min(1);

export const productIdParamSchema = Joi.object({
  id: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid product ID format')
});

export const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sort: Joi.string().trim(),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  status: Joi.string().valid('active', 'inactive'),
  search: Joi.string().trim().max(200),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0)
});
