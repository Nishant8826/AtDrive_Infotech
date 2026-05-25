const axios = require('axios');
const asyncHandler = require('../middleware/asyncHandler.js');
const ErrorResponse = require('../utils/errorResponse.js');

const getWeather = asyncHandler(async (req, res) => {
  const { lat, lon, city } = req.query;

  const latitude = lat || '28.5355';
  const longitude = lon || '77.3910';
  const cityName = city || 'Noida, India';

  const response = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m`
  );

  if (!response.data || !response.data.current_weather) {
    throw new ErrorResponse('Invalid response from weather provider', 502);
  }

  const current = response.data.current_weather;
  res.json({
    city: cityName,
    coordinates: { latitude, longitude },
    temperature: current.temperature,
    windspeed: current.windspeed,
    winddirection: current.winddirection,
    weathercode: current.weathercode,
    time: current.time,
    units: {
      temperature: response.data.current_weather_units?.temperature || '°C',
      windspeed: response.data.current_weather_units?.windspeed || 'km/h',
    }
  });
});

module.exports = {
  getWeather
};
