// server.js
require('dotenv').config(); // Add this line at the very top
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your actual Ambient Weather API keys
const API_KEY = process.env.API_KEY;
const APP_KEY = process.env.APP_KEY;

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API route for current weather
app.get('/api/weather', async (req, res) => {
  try {
    const response = await axios.get('https://api.ambientweather.net/v1/devices', {
      params: {
        apiKey: API_KEY,
        applicationKey: APP_KEY
      }
    });

    const device = response.data[0];
    const lastData = device.lastData;

    res.json({
      temperature: lastData.tempf ? ((lastData.tempf - 32) * 5 / 9).toFixed(1) : "--",
      windSpeed: lastData.windspeedmph ?? "--",
      humidity: lastData.humidity ?? "--",
      cloudCover: lastData.solarradiation ? (100 - lastData.solarradiation) : "--"
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
