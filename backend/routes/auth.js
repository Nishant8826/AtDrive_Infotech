const express = require('express');
const { registerUser, loginUser, checkUsername } = require('../controllers/auth.js');

const router = express.Router();

router.get('/check-username', checkUsername);
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
