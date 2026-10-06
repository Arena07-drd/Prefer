import catchAsync from '../utils/catchAsync.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responseFormatter.js';
import * as categoryService from '../services/categoryService.js';
import { getPaginationParams } from '../utils/pagination.js';

export const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.user);
  sendCreated(res, category, 'Category created successfully');
});

export const getCategories = catchAsync(async (req, res) => {
  const filters = {
    isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    search: req.query.search
  };
  const paginationParams = getPaginationParams(req.query);
  const result = await categoryService.getCategories(filters, paginationParams);
  sendPaginated(res, result.categories, result.pagination, 'Categories retrieved successfully');
});

export const getCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  sendSuccess(res, category, 'Category retrieved successfully');
});

export const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body, req.user);
  sendSuccess(res, category, 'Category updated successfully');
});

export const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.id, req.user);
  sendSuccess(res, null, 'Category deleted successfully');
});
