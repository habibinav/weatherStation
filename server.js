require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;
const APP_KEY = process.env.APP_KEY;
const DEVICE_MAC = process.env.DEVICE_MAC;

let cachedCurrent = null;
let cachedHistory = null;
let lastCurrentFetch = 0;
let lastHistoryFetch = 0;

app.use(express.static(path.join(__dirname, 'public')));

async function fetchWeatherData(limit = 288) {
  const url = `https://rt.ambientweather.net/v1/devices/${DEVICE_MAC}`;
  const response = await axios.get(url, {
    params: { apiKey: API_KEY, applicationKey: APP_KEY, limit },
    timeout: 15000
  });
  return response.data;
}

app.get('/api/weather', async (req, res) => {
  const now = Date.now();

  if (cachedCurrent && now - lastCurrentFetch < 45 * 1000) {
    return res.json(cachedCurrent);
  }

  try {
    const data = await fetchWeatherData(1);
    if (!data.length) return res.status(503).json({ error: 'No data' });

    const last = data[0];
    const result = {
      temperature: last.tempf ? ((last.tempf - 32) * 5 / 9).toFixed(1) : "--",
      windSpeed: last.windspeedmph ? (last.windspeedmph * 1.60934).toFixed(1) : "--",
      humidity: last.humidity ?? "--",
      cloudCover: last.solarradiation
        ? (100 - Math.min(last.solarradiation / 10, 100)).toFixed(0)
        : "--",
      pressure: last.baromrelin
        ? (last.baromrelin * 33.8639).toFixed(1)
        : "--",
      updatedAt: new Date(last.dateutc).toISOString()
    };

    cachedCurrent = result;
    lastCurrentFetch = now;
    res.json(result);
  } catch (err) {
    console.error('❌ Error fetching current:', err.message);
    if (cachedCurrent) return res.json(cachedCurrent);
    res.status(500).json({ error: 'Failed to fetch current' });
  }
});

app.get('/api/weather/history', async (req, res) => {
  const now = Date.now();

  if (cachedHistory && now - lastHistoryFetch < 30 * 60 * 1000) {
    return res.json(cachedHistory);
  }

  try {
    const data = await fetchWeatherData(288);
    if (!data.length) return res.status(503).json({ error: 'No history' });

    const formatted = data
      .slice(0, 288)
      .reverse()
      .map(entry => ({
        timestamp: new Date(entry.dateutc).toISOString(), // ✅ UTC timestamp
        tempf: entry.tempf ?? null,
        hourlyrainin: entry.hourlyrainin ?? 0
      }));

    cachedHistory = formatted;
    lastHistoryFetch = now;
    res.json(formatted);
  } catch (err) {
    console.error('❌ History fetch error:', err.message);
    if (cachedHistory) return res.json(cachedHistory);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});
