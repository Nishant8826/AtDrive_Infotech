const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require('../controllers/order.js');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/', getOrders);

router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router;
