const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.js');
const User = require('./user.js');

const Order = sequelize.define(
  'Order',
  {
    orderId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    productIds: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Must be an array of product IDs');
          }
          if (value.length === 0) {
            throw new Error('Order must contain at least one product');
          }
        },
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    timestamps: true,
    tableName: 'orders',
  }
);

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Order;
