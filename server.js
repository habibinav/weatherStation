// server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
//replace actual api keys
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
      windSpeed: lastData.windspeedmph ? (lastData.windspeedmph * 1.60934).toFixed(1) : "--",
      humidity: lastData.humidity ?? "--",
      cloudCover: lastData.solarradiation ? (100 - lastData.solarradiation) : "--"
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// API route for historical chart data
app.get('/api/weather/history', async (req, res) => {
  try {
    // Get device MAC address
    const devicesResponse = await axios.get('https://api.ambientweather.net/v1/devices', {
      params: {
        apiKey: API_KEY,
        applicationKey: APP_KEY
      }
    });

    const device = devicesResponse.data[0];
    const macAddress = device.macAddress;

    // Fetch past data
    const historyResponse = await axios.get(`https://api.ambientweather.net/v1/devices/${macAddress}`, {
      params: {
        apiKey: API_KEY,
        applicationKey: APP_KEY
      }
    });

    const entries = historyResponse.data.slice(0, 6).reverse(); // last 6 data points

    const labels = entries.map(entry => {
      const date = new Date(entry.dateutc);
      return `${date.getHours()}:00`;
    });

    const temperature = entries.map(entry => entry.tempf ? ((entry.tempf - 32) * 5 / 9).toFixed(1) : null);
    const precip = entries.map(entry => entry.hourlyrainin ? (entry.hourlyrainin * 25.4).toFixed(2) : 0);

    res.json({ labels, temperature, precip });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch historical weather data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
