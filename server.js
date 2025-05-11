// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Ambient Weather API Keys
const API_KEY = process.env.API_KEY;
const APP_KEY = process.env.APP_KEY;

// Store latest 6 hourly entries
let storedWeatherData = [];

async function fetchAndStoreWeatherData() {
  try {
    const response = await axios.get('https://api.ambientweather.net/v1/devices', {
      params: {
        apiKey: API_KEY,
        applicationKey: APP_KEY
      }
    });

    const lastData = response.data[0].lastData;
    const timestamp = new Date();

    const record = {
      timestamp: timestamp.toISOString(),
      tempf: lastData.tempf ?? null,
      hourlyrainin: lastData.hourlyrainin ?? null
    };

    storedWeatherData.push(record);

    // ✅ Keep only last 6 records (6 hours)
    if (storedWeatherData.length > 6) {
      storedWeatherData.shift();
    }

  } catch (err) {
    console.error('Failed to fetch weather data:', err.message);
  }
}


// Initial fetch on startup
fetchAndStoreWeatherData();

// Schedule to run every hour
setInterval(fetchAndStoreWeatherData,60*60*1000); // every 1 hour

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Route to get latest weather summary
app.get('/api/weather', async (req, res) => {
  try {
    const latest = storedWeatherData[storedWeatherData.length - 1];
    if (!latest) {
      return res.status(503).json({ error: 'No weather data available yet.' });
    }

    const response = await axios.get('https://api.ambientweather.net/v1/devices', {
      params: {
        apiKey: API_KEY,
        applicationKey: APP_KEY
      }
    });

    const lastData = response.data[0].lastData;

    res.json({
      temperature: latest.tempf ? ((latest.tempf - 32) * 5 / 9).toFixed(1) : "--",
      windSpeed: lastData.windspeedmph ? (lastData.windspeedmph * 1.60934).toFixed(1) : "--", // mph to km/h
      humidity: lastData.humidity ?? "--",
      cloudCover: lastData.solarradiation ? (100 - lastData.solarradiation).toFixed(1) : "--"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});


// Route to get full hourly data history
app.get('/api/weather/history', (req, res) => {
  res.json(storedWeatherData);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
