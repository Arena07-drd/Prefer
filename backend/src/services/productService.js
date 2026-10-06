import Product from '../models/Product.js';
import Category from '../models/Category.js';
import PriceHistory from '../models/PriceHistory.js';
import AppError from '../utils/AppError.js';
import { createAuditLog } from './auditService.js';
import { getPaginationMeta } from '../utils/pagination.js';

export const createProduct = async (data, createdByUser) => {
  const category = await Category.findById(data.category);
  if (!category || !category.isActive) {
    throw AppError.badRequest('Category is invalid or inactive');
  }

  const product = await Product.create({
    ...data,
    createdBy: createdByUser.id
  });

  await product.populate('category', 'name');

  await createAuditLog({
    userId: createdByUser.id,
    userName: createdByUser.name,
    action: 'PRODUCT_CREATED',
    entityType: 'Product',
    entityId: product._id,
    changes: data,
    metadata: { name: product.name }
  });

  return product;
};

export const getProducts = async (filters = {}, paginationParams) => {
  const query = {};

  if (filters.category) query.category = filters.category;
  
  if (filters.status) {
    query.status = filters.status;
  } else {
    query.status = 'active';
  }

  if (filters.search) {
    query.name = { $regex: new RegExp(filters.search, 'i') };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice !== undefined) query.price.$lte = Number(filters.maxPrice);
  }

  const { page, limit, skip } = paginationParams;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name')
      .sort(filters.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query)
  ]);

  return {
    products,
    pagination: getPaginationMeta(total, page, limit)
  };
};

export const getProductById = async (productId) => {
  const product = await Product.findById(productId).populate('category', 'name');
  if (!product) {
    throw AppError.notFound('Product not found');
  }
  return product;
};

export const updateProduct = async (productId, data, updatedByUser) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw AppError.notFound('Product not found');
  }

  const changes = {};
  
  if (data.price !== undefined && data.price !== product.price) {
    await PriceHistory.create({
      productId: product._id,
      productName: product.name,
      oldPrice: product.price,
      newPrice: data.price,
      changedBy: updatedByUser.id
    });
    changes.price = { old: product.price, new: data.price };
  }

  if (data.category && data.category !== product.category.toString()) {
    const category = await Category.findById(data.category);
    if (!category || !category.isActive) {
      throw AppError.badRequest('Category is invalid or inactive');
    }
  }

  const allowedFields = ['name', 'description', 'category', 'price', 'images', 'unit', 'minOrderQuantity', 'maxOrderQuantity', 'status', 'tags', 'sku'];
  
  for (const field of allowedFields) {
    if (data[field] !== undefined && data[field] !== product[field]) {
      if (field !== 'price') {
        changes[field] = { old: product[field], new: data[field] };
      }
      product[field] = data[field];
    }
  }

  await product.save();
  await product.populate('category', 'name');

  if (Object.keys(changes).length > 0) {
    await createAuditLog({
      userId: updatedByUser.id,
      userName: updatedByUser.name,
      action: 'PRODUCT_UPDATED',
      entityType: 'Product',
      entityId: product._id,
      changes,
      metadata: { name: product.name }
    });
  }

  return product;
};

export const deleteProduct = async (productId, deletedByUser) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw AppError.notFound('Product not found');
  }

  product.status = 'inactive';
  await product.save();

  await createAuditLog({
    userId: deletedByUser.id,
    userName: deletedByUser.name,
    action: 'PRODUCT_DELETED',
    entityType: 'Product',
    entityId: product._id,
    changes: { status: { old: 'active', new: 'inactive' } },
    metadata: { name: product.name }
  });

  return product;
};

export const searchProducts = async (query, filters = {}) => {
  const dbQuery = {
    name: { $regex: new RegExp(query, 'i') },
    status: filters.status || 'active'
  };

  if (filters.category) {
    dbQuery.category = filters.category;
  }

  const products = await Product.find(dbQuery)
    .populate('category', 'name')
    .limit(50)
    .sort({ name: 1 });

  return products;
};
