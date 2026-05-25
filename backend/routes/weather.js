const express = require('express');
const { getWeather } = require('../controllers/weather.js');

const router = express.Router();

router.get('/', getWeather);

module.exports = router;
