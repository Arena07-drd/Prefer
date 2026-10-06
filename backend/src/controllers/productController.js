import catchAsync from '../utils/catchAsync.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responseFormatter.js';
import * as productService from '../services/productService.js';
import { getPaginationParams } from '../utils/pagination.js';

export const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user);
  sendCreated(res, product, 'Product created successfully');
});

export const getProducts = catchAsync(async (req, res) => {
  const filters = {
    category: req.query.category,
    status: req.query.status,
    search: req.query.search,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    sort: req.query.sort
  };
  const paginationParams = getPaginationParams(req.query);
  const result = await productService.getProducts(filters, paginationParams);
  sendPaginated(res, result.products, result.pagination, 'Products retrieved successfully');
});

export const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  sendSuccess(res, product, 'Product retrieved successfully');
});

export const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.user);
  sendSuccess(res, product, 'Product updated successfully');
});

export const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user);
  sendSuccess(res, null, 'Product deleted successfully');
});

export const searchProducts = catchAsync(async (req, res) => {
  const query = req.query.q || '';
  const filters = {
    category: req.query.category,
    status: req.query.status
  };
  const products = await productService.searchProducts(query, filters);
  sendSuccess(res, products, 'Products searched successfully');
});
