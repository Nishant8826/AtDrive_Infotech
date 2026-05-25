const Order = require('../models/order.js');
const User = require('../models/user.js');
const Product = require('../models/product.js');
const asyncHandler = require('../middleware/asyncHandler.js');
const ErrorResponse = require('../utils/errorResponse.js');

const getProductsDetails = async (productIds) => {
  return await Product.find({ _id: { $in: productIds } });
};

const createOrder = asyncHandler(async (req, res) => {
  const { productIds } = req.body;
  const userId = req.user.id;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    throw new ErrorResponse('productIds array required', 400);
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  const products = await getProductsDetails(productIds);
  if (products.length !== productIds.length) {
    throw new ErrorResponse('Some products could not be found', 400);
  }

  const totalAmount = products.reduce((sum, p) => sum + p.price, 0);

  const order = await Order.create({
    userId,
    productIds,
    totalAmount,
  });

  res.status(201).json({
    message: 'Order created',
    order: {
      orderId: order.orderId,
      userId: order.userId,
      productIds: order.productIds,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      products
    }
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }
    ]
  });

  const populated = await Promise.all(
    orders.map(async (order) => {
      const data = order.toJSON();
      try {
        data.products = await getProductsDetails(data.productIds);
      } catch (err) {
        data.products = [];
      }
      return data;
    })
  );

  res.json(populated);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }
    ]
  });

  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  if (order.userId !== req.user.id) {
    throw new ErrorResponse('Unauthorized', 403);
  }

  const data = order.toJSON();
  try {
    data.products = await getProductsDetails(data.productIds);
  } catch (err) {
    data.products = [];
  }

  res.json(data);
});

const updateOrder = asyncHandler(async (req, res) => {
  const { productIds } = req.body;
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    throw new ErrorResponse('productIds array required', 400);
  }

  const order = await Order.findByPk(req.params.id);
  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  if (order.userId !== req.user.id) {
    throw new ErrorResponse('Unauthorized', 403);
  }

  const products = await getProductsDetails(productIds);
  if (products.length !== productIds.length) {
    throw new ErrorResponse('Some products could not be found', 400);
  }

  const totalAmount = products.reduce((sum, p) => sum + p.price, 0);

  order.productIds = productIds;
  order.totalAmount = totalAmount;
  await order.save();

  res.json({
    message: 'Order updated',
    order: {
      orderId: order.orderId,
      userId: order.userId,
      productIds: order.productIds,
      totalAmount: order.totalAmount,
      updatedAt: order.updatedAt,
      products
    }
  });
});

const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    throw new ErrorResponse('Order not found', 404);
  }

  if (order.userId !== req.user.id) {
    throw new ErrorResponse('Unauthorized', 403);
  }

  await order.destroy();
  res.json({ message: 'Order deleted' });
});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
};
