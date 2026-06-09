require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { fetchForecast, computeWashScores } = require('./weather');
const { cache } = require('./cache');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── GET /api/forecast ─────────────────────────────────────────────────────
// Query params: lat, lon (defaults to Islamabad)
// Returns 7-day wash scores + today's full detail
app.get('/api/forecast', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 33.72;
    const lon = parseFloat(req.query.lon) || 73.04;
    const cacheKey = `forecast_${lat}_${lon}`;

    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, fromCache: true });
    }

    const raw = await fetchForecast(lat, lon);
    const scores = computeWashScores(raw);

    const payload = {
      location: { lat, lon },
      generatedAt: new Date().toISOString(),
      today: scores[0],
      week: scores,
      fromCache: false
    };

    cache.set(cacheKey, payload, 3 * 60 * 60); // 3 hour TTL
    res.json(payload);
  } catch (err) {
    console.error('Forecast error:', err.message);
    res.status(500).json({ error: 'Failed to fetch forecast. Please try again.' });
  }
});

// ── GET /api/score ────────────────────────────────────────────────────────
// Returns just today's wash score for a location (lightweight)
app.get('/api/score', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 33.72;
    const lon = parseFloat(req.query.lon) || 73.04;
    const cacheKey = `forecast_${lat}_${lon}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached.today);

    const raw = await fetchForecast(lat, lon);
    const scores = computeWashScores(raw);
    res.json(scores[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute score.' });
  }
});

// ── Refresh cache every 3 hours (Islamabad default) ───────────────────────
cron.schedule('0 */3 * * *', async () => {
  console.log('[cron] Refreshing Islamabad forecast cache...');
  try {
    const raw = await fetchForecast(33.72, 73.04);
    const scores = computeWashScores(raw);
    const payload = {
      location: { lat: 33.72, lon: 73.04 },
      generatedAt: new Date().toISOString(),
      today: scores[0],
      week: scores,
    };
    cache.set('forecast_33.72_73.04', payload, 3 * 60 * 60);
    console.log('[cron] Cache refreshed. Today score:', scores[0].score);
  } catch (err) {
    console.error('[cron] Refresh failed:', err.message);
  }
}, { timezone: 'Asia/Karachi' });

app.listen(PORT, () => {
  console.log(`WashWalay server running on port ${PORT}`);
});
