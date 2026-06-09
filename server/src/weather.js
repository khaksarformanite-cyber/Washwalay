const axios = require('axios');

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

// ── Fetch raw forecast from Open-Meteo ────────────────────────────────────
async function fetchForecast(lat, lon) {
  const { data } = await axios.get(OPEN_METEO_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      hourly: 'precipitation_probability,relativehumidity_2m,precipitation',
      daily: [
        'precipitation_probability_max',
        'precipitation_sum',
        'weathercode',
        'sunrise',
        'sunset'
      ].join(','),
      forecast_days: 7,
      timezone: 'Asia/Karachi'
    },
    timeout: 8000
  });
  return data;
}

// ── Wash Score formula ────────────────────────────────────────────────────
// Score = 100
//   - (rain_prob_today * 0.5)
//   - (rain_next_48h  * 0.3)
//   - (humidity_penalty * 0.2)
// Clamped 0–100
function computeDayScore(rainProbToday, rainNext48h, avgHumidity) {
  const humidityPenalty = Math.max(0, avgHumidity - 70) * 0.5;
  const raw = 100
    - (rainProbToday * 0.5)
    - (Math.min(100, rainNext48h) * 0.3)
    - (humidityPenalty * 0.2);
  return Math.round(Math.max(0, Math.min(100, raw)));
}

// ── Verdict from score ────────────────────────────────────────────────────
function getVerdict(score) {
  if (score >= 70) return { label: 'Good day to wash', level: 'good', color: '#1D9E75' };
  if (score >= 40) return { label: 'Wash at your own risk', level: 'warn', color: '#BA7517' };
  return { label: "Don't wash today", level: 'bad', color: '#E24B4A' };
}

// ── Best wash window ──────────────────────────────────────────────────────
function getBestWindow(hourlyRainProb, dayIndex) {
  const start = dayIndex * 24;
  const hours = hourlyRainProb.slice(start, start + 24);

  const morning   = hours.slice(6, 12).reduce((a, b) => a + b, 0) / 6;
  const afternoon = hours.slice(12, 18).reduce((a, b) => a + b, 0) / 6;
  const evening   = hours.slice(18, 24).reduce((a, b) => a + b, 0) / 6;

  const best = Math.min(morning, afternoon, evening);
  if (best === morning)   return 'Morning (7–11am)';
  if (best === afternoon) return 'Afternoon (12–4pm)';
  return 'Evening (5–8pm)';
}

// ── WMO weather code to label ─────────────────────────────────────────────
function weatherLabel(code) {
  if (code === 0)                    return 'Clear sky';
  if (code <= 2)                     return 'Partly cloudy';
  if (code === 3)                    return 'Overcast';
  if (code >= 51 && code <= 55)      return 'Drizzle';
  if (code >= 61 && code <= 65)      return 'Rain';
  if (code >= 80 && code <= 82)      return 'Rain showers';
  if (code >= 95 && code <= 99)      return 'Thunderstorm';
  return 'Cloudy';
}

// ── Compute scores for all 7 days ─────────────────────────────────────────
function computeWashScores(data) {
  const { daily, hourly } = data;
  const scores = [];

  for (let i = 0; i < 7; i++) {
    const rainProbToday = daily.precipitation_probability_max[i];
    const rainNext48h = i < 6
      ? (daily.precipitation_probability_max[i + 1] +
         (daily.precipitation_probability_max[i + 2] || 0)) / 2
      : daily.precipitation_probability_max[i];

    const hourStart = i * 24;
    const dayHumidity = hourly.relativehumidity_2m.slice(hourStart, hourStart + 24);
    const avgHumidity = dayHumidity.reduce((a, b) => a + b, 0) / dayHumidity.length;

    const score = computeDayScore(rainProbToday, rainNext48h, avgHumidity);
    const verdict = getVerdict(score);
    const bestWindow = getBestWindow(hourly.precipitation_probability, i);

    // Dry days ahead: count consecutive days after today with score >= 50
    let dryDaysAhead = 0;
    for (let j = i + 1; j < 7; j++) {
      const futureRain = daily.precipitation_probability_max[j];
      if (futureRain < 50) dryDaysAhead++;
      else break;
    }

    scores.push({
      date: daily.time[i],
      score,
      verdict,
      rainProb: Math.round(rainProbToday),
      humidity: Math.round(avgHumidity),
      precipitation: daily.precipitation_sum[i],
      weatherCode: daily.weathercode[i],
      weatherLabel: weatherLabel(daily.weathercode[i]),
      bestWindow,
      dryDaysAhead,
      sunrise: daily.sunrise[i],
      sunset: daily.sunset[i],
    });
  }

  return scores;
}

module.exports = { fetchForecast, computeWashScores };
