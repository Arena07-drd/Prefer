import Joi from 'joi';

export const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
      quantity: Joi.number().integer().required().min(1)
    })
  ).required().min(1),
  notes: Joi.string().trim().max(1000).allow('', null)
});

export const editOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
      quantity: Joi.number().integer().required().min(1)
    })
  ).required().min(1)
});

export const updateStatusSchema = Joi.object({
  status: Joi.string().required().valid('placed', 'accepted', 'modified', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'),
  note: Joi.string().trim().max(500).allow('', null)
});

export const updatePaymentSchema = Joi.object({
  isPaid: Joi.boolean().required()
});

export const orderIdParamSchema = Joi.object({
  id: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid order ID format')
});

export const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  sort: Joi.string().trim(),
  status: Joi.string().valid('placed', 'accepted', 'modified', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'),
  paymentStatus: Joi.string().valid('pending', 'paid'),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  search: Joi.string().trim().max(200)
});
