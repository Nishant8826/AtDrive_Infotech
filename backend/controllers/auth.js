const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const asyncHandler = require('../middleware/asyncHandler.js');
const ErrorResponse = require('../utils/errorResponse.js');

const registerUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ErrorResponse('All fields are required', 400);
  }

  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    throw new ErrorResponse('Username already taken', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    password: hashedPassword,
  });

  res.status(201).json({
    message: 'User registered',
    user: { id: user.id, username: user.username },
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ErrorResponse('Username and password required', 400);
  }

  const user = await User.findOne({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET || 'supersecretkey_interview',
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, username: user.username },
  });
});

const checkUsername = asyncHandler(async (req, res) => {
  const { username } = req.query;
  if (!username) {
    throw new ErrorResponse('Username query parameter required', 400);
  }

  const user = await User.findOne({ where: { username } });
  res.json({ available: !user });
});

module.exports = {
  registerUser,
  loginUser,
  checkUsername
};
