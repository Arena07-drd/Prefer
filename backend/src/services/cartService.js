import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';

export const validateCart = async (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw AppError.badRequest('Cart is empty');
  }

  const productIds = [...new Set(items.map(item => item.productId))];
  const products = await Product.find({ _id: { $in: productIds } });

  const productMap = products.reduce((acc, product) => {
    acc[product._id.toString()] = product;
    return acc;
  }, {});

  const invalidItems = [];
  const validatedItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = productMap[item.productId];

    if (!product) {
      invalidItems.push({ productId: item.productId, reason: 'Product not found' });
      continue;
    }

    if (product.status !== 'active') {
      invalidItems.push({ productId: item.productId, reason: 'Product is not available' });
      continue;
    }

    if (item.quantity < product.minOrderQuantity) {
      invalidItems.push({ productId: item.productId, reason: `Minimum order quantity is ${product.minOrderQuantity}` });
      continue;
    }

    if (product.maxOrderQuantity !== null && item.quantity > product.maxOrderQuantity) {
      invalidItems.push({ productId: item.productId, reason: `Maximum order quantity is ${product.maxOrderQuantity}` });
      continue;
    }

    const subtotal = product.price * item.quantity;
    validatedItems.push({
      productId: product._id,
      productName: product.name,
      unit: product.unit,
      quantity: item.quantity,
      priceAtOrder: product.price,
      subtotal
    });
    
    totalAmount += subtotal;
  }

  if (invalidItems.length > 0) {
    const reasons = invalidItems.map(i => i.reason).join('. ');
    const error = AppError.badRequest(`Cart error: ${reasons}`);
    error.details = invalidItems;
    throw error;
  }

  return {
    validatedItems,
    totalAmount,
    itemCount: validatedItems.length
  };
};
