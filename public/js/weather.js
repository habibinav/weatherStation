async function loadWeather() {
    try {
      const res = await fetch('/api/weather');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
  
      document.getElementById('temperature').textContent = `${data.temperature} °C`;
      document.getElementById('windSpeed').textContent = `${data.windSpeed} km/h`;
      document.getElementById('humidity').textContent = `${data.humidity} %`;
      document.getElementById('cloudCover').textContent = `${data.cloudCover} %`;
      document.getElementById('lastUpdated').textContent = `Last updated: ${data.updatedAt}`;
    } catch (err) {
      console.error("❌ Weather fetch failed:", err);
    }
  }
  
  async function loadHistory() {
    try {
      const res = await fetch('/api/weather/history');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
  
      const labels = data.map(d => d.time);
      const temps = data.map(d => d.temperature);
      const rain = data.map(d => d.rain);
  
      updateTempChart(labels, temps);
      updateRainChart(labels, rain);
    } catch (err) {
      console.error("❌ History fetch failed:", err);
    }
  }
  
  function updateTempChart(labels, temps) {
    const ctx = document.getElementById('tempChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Temperature (°C)',
          data: temps,
          borderColor: '#b22',
          borderWidth: 2,
          tension: 0.3,
          fill: false
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: false } } }
    });
  }
  
  function updateRainChart(labels, rain) {
    const ctx = document.getElementById('rainChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Rainfall (in/hr)',
          data: rain,
          borderColor: '#722',
          borderWidth: 2,
          tension: 0.3,
          fill: false
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
  }
  
  // Load initial data + refresh safely
  loadWeather();
  loadHistory();
  setInterval(loadWeather, 60 * 1000); // refresh current data every minute
  setInterval(loadHistory, 10 * 60 * 1000); // refresh graphs every 10 minutes
  