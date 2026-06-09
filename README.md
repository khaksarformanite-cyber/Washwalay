# WashWalay 🚗🌧️

**Smart car wash timing for Islamabad** — powered by live weather data from Open-Meteo and WeatherWalay's monsoon intelligence.

---

## Project structure

```
washwalay/
├── client/          # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── ScoreRing.js      # Animated score ring
│       │   ├── WeekStrip.js      # 7-day day selector
│       │   ├── VerdictCard.js    # Colour-coded verdict
│       │   ├── StatsGrid.js      # Rain %, humidity, window
│       │   └── SavingsTracker.js # Cumulative savings logger
│       ├── hooks/
│       │   └── useForecast.js    # API fetch + 3h auto-refresh
│       ├── App.js
│       └── index.js
├── server/          # Node.js + Express backend
│   └── src/
│       ├── index.js     # Express app, routes, cron job
│       ├── weather.js   # Open-Meteo fetch + Wash Score logic
│       └── cache.js     # In-memory TTL cache
├── render.yaml      # One-click Render deployment
└── package.json     # Root (concurrently for local dev)
```

---

## Local development

### 1. Clone and install

```bash
git clone https://github.com/yourname/washwalay.git
cd washwalay

# Install root deps (concurrently)
npm install

# Install server deps
cd server && npm install && cd ..

# Install client deps
cd client && npm install && cd ..
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env if needed (defaults work for local dev)
```

### 3. Run both servers

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

---

## API endpoints

| Endpoint | Description |
|---|---|
| `GET /health` | Health check |
| `GET /api/forecast?lat=33.72&lon=73.04` | Full 7-day forecast + wash scores |
| `GET /api/score?lat=33.72&lon=73.04` | Today's score only (lightweight) |

### Example response (`/api/forecast`)

```json
{
  "location": { "lat": 33.72, "lon": 73.04 },
  "generatedAt": "2026-06-09T07:00:00.000Z",
  "today": {
    "date": "2026-06-09",
    "score": 74,
    "verdict": { "label": "Good day to wash", "level": "good", "color": "#1D9E75" },
    "rainProb": 18,
    "humidity": 62,
    "bestWindow": "Morning (7–11am)",
    "dryDaysAhead": 3,
    "weatherLabel": "Partly cloudy"
  },
  "week": [ ... ],
  "fromCache": false
}
```

---

## Wash Score formula

```
Score = 100
  - (rain_prob_today  × 0.5)
  - (rain_next_48h    × 0.3)
  - (humidity_penalty × 0.2)

humidity_penalty = max(0, humidity% − 70) × 0.5
Score clamped to 0–100
```

| Score | Verdict |
|---|---|
| 70–100 | ✅ Good day to wash |
| 40–69  | ⚠️ Wash at your own risk |
| 0–39   | ❌ Don't wash today |

---

## Deploy to Render

### Option A — Blueprint (recommended, one click)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your repo — Render reads `render.yaml` and creates both services automatically
4. Update the URLs in `render.yaml` after first deploy:
   - `CLIENT_URL` in server env → your frontend Render URL
   - `REACT_APP_API_URL` in client env → your backend Render URL
5. Redeploy

### Option B — Manual

**Backend:**
1. New → Web Service → connect repo → set Root Directory: `server`
2. Build: `npm install`, Start: `npm start`
3. Add env var: `CLIENT_URL=https://your-frontend.onrender.com`

**Frontend:**
1. New → Static Site → connect repo → set Root Directory: `client`
2. Build: `npm install && npm run build`, Publish: `build`
3. Add env var: `REACT_APP_API_URL=https://your-backend.onrender.com`
4. Add rewrite rule: `/*` → `/index.html`

---

## Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# From /server
cd server
railway init
railway up

# From /client — build and serve as static
cd ../client
npm run build
# Deploy build/ folder to Railway static service or Vercel
```

---

## Upgrade path

| Phase | Upgrade |
|---|---|
| Phase 2 | Swap in-memory cache (`cache.js`) for Redis |
| Phase 2 | Add Firebase Cloud Messaging for push notifications |
| Phase 3 | Upgrade Open-Meteo → WeatherAPI.com for reliability |
| Phase 3 | Add WeatherWalay NUST station data layer |
| Phase 4 | Add Tomorrow.io for hyperlocal nowcasting |

---

## Built by WeatherWalay
Islamabad, Pakistan · 2026
