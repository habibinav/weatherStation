const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  tempf: Number,
  hourlyrainin: Number
});

module.exports = mongoose.model('WeatherData', weatherDataSchema);
