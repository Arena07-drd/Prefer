import Joi from 'joi';

export const createUserSchema = Joi.object({
  name: Joi.string().required().trim().max(100),
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required().min(8),
  role: Joi.string().valid('customer', 'staff', 'admin').default('customer'),
  phone: Joi.string().trim().allow('', null),
  businessName: Joi.string().trim().allow('', null),
  address: Joi.object({
    street: Joi.string().trim().allow('', null),
    city: Joi.string().trim().allow('', null),
    state: Joi.string().trim().allow('', null),
    pincode: Joi.string().trim().allow('', null)
  }).optional()
});

export const updateUserSchema = Joi.object({
  name: Joi.string().trim().max(100),
  phone: Joi.string().trim().allow('', null),
  businessName: Joi.string().trim().allow('', null),
  address: Joi.object({
    street: Joi.string().trim().allow('', null),
    city: Joi.string().trim().allow('', null),
    state: Joi.string().trim().allow('', null),
    pincode: Joi.string().trim().allow('', null)
  }),
  isActive: Joi.boolean(),
  role: Joi.string().valid('customer', 'staff', 'admin')
}).min(1);

export const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().required().min(8)
});

export const userIdParamSchema = Joi.object({
  id: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid user ID format')
});
