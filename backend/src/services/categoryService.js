import Category from '../models/Category.js';
import AppError from '../utils/AppError.js';
import { createAuditLog } from './auditService.js';
import { getPaginationMeta } from '../utils/pagination.js';

export const createCategory = async (data, createdByUser) => {
  const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${data.name}$`, 'i') } });
  if (existingCategory) {
    throw AppError.conflict('Category name already exists');
  }

  const category = await Category.create({
    ...data,
    createdBy: createdByUser.id
  });

  await createAuditLog({
    userId: createdByUser.id,
    userName: createdByUser.name,
    action: 'CATEGORY_CREATED',
    entityType: 'Category',
    entityId: category._id,
    changes: data,
    metadata: { name: category.name }
  });

  return category;
};

export const getCategories = async (filters = {}, paginationParams) => {
  const query = {};
  
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  } else {
    query.isActive = true;
  }

  if (filters.search) {
    query.name = { $regex: new RegExp(filters.search, 'i') };
  }

  const { page, limit, skip } = paginationParams;

  const [categories, total] = await Promise.all([
    Category.find(query)
      .sort({ sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(limit),
    Category.countDocuments(query)
  ]);

  return {
    categories,
    pagination: getPaginationMeta(total, page, limit)
  };
};

export const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw AppError.notFound('Category not found');
  }
  return category;
};

export const updateCategory = async (categoryId, data, updatedByUser) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw AppError.notFound('Category not found');
  }

  if (data.name && data.name.toLowerCase() !== category.name.toLowerCase()) {
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${data.name}$`, 'i') } });
    if (existingCategory) {
      throw AppError.conflict('Category name already exists');
    }
  }

  const allowedFields = ['name', 'description', 'image', 'sortOrder', 'isActive'];
  const changes = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined && data[field] !== category[field]) {
      changes[field] = { old: category[field], new: data[field] };
      category[field] = data[field];
    }
  }

  await category.save();

  if (Object.keys(changes).length > 0) {
    await createAuditLog({
      userId: updatedByUser.id,
      userName: updatedByUser.name,
      action: 'CATEGORY_UPDATED',
      entityType: 'Category',
      entityId: category._id,
      changes,
      metadata: { name: category.name }
    });
  }

  return category;
};

export const deleteCategory = async (categoryId, deletedByUser) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw AppError.notFound('Category not found');
  }

  category.isActive = false;
  await category.save();

  await createAuditLog({
    userId: deletedByUser.id,
    userName: deletedByUser.name,
    action: 'CATEGORY_DELETED',
    entityType: 'Category',
    entityId: category._id,
    changes: { isActive: { old: true, new: false } },
    metadata: { name: category.name }
  });

  return category;
};
