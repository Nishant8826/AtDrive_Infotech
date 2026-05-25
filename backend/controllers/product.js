const Product = require('../models/product.js');
const asyncHandler = require('../middleware/asyncHandler.js');
const ErrorResponse = require('../utils/errorResponse.js');

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ErrorResponse('Product not found', 404);
  }
  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description } = req.body;
  if (!name || price === undefined || !description) {
    throw new ErrorResponse('Missing fields', 400);
  }

  const product = new Product({ name, price, description });
  const saved = await product.save();
  res.status(201).json(saved);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ErrorResponse('Product not found', 404);
  }

  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  if (description !== undefined) product.description = description;

  const updated = await product.save();
  res.json(updated);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ErrorResponse('Product not found', 404);
  }
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted' });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
