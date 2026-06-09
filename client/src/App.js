import React, { useState } from 'react';
import { useForecast } from './hooks/useForecast';
import { ScoreRing }     from './components/ScoreRing';
import { WeekStrip }     from './components/WeekStrip';
import { VerdictCard }   from './components/VerdictCard';
import { StatsGrid }     from './components/StatsGrid';
import { SavingsTracker } from './components/SavingsTracker';

// Islamabad coordinates
const DEFAULT_LAT = 33.72;
const DEFAULT_LON = 73.04;

export default function App() {
  const { data, loading, error, refetch, lastUpdated } = useForecast(DEFAULT_LAT, DEFAULT_LON);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedDay = data?.week?.[selectedIndex];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--page-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 0 40px',
    }}>

      {/* ── Header ── */}
      <header style={{
        width: '100%',
        maxWidth: 430,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 20px 12px',
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0F6E56', letterSpacing: '-0.3px' }}>
            WashWalay
          </div>
          <div style={{ fontSize: 13, color: '#888780' }}>Islamabad</div>
        </div>
        <button
          onClick={refetch}
          title="Refresh forecast"
          style={{
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: 18,
            cursor: 'pointer',
            color: '#0F6E56',
          }}
          aria-label="Refresh forecast"
        >
          ↻
        </button>
      </header>

      {/* ── Main content ── */}
      <main style={{ width: '100%', maxWidth: 430, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Loading */}
        {loading && (
          <div style={{
            background: '#fff', borderRadius: 18, padding: '48px 24px',
            textAlign: 'center', color: '#888780'
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🌤️</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>Checking Islamabad weather...</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Computing your wash score</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: '#FCEBEB', borderRadius: 14, padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontSize: 14, color: '#7A1F1F', fontWeight: 500, marginBottom: 12 }}>{error}</div>
            <button
              onClick={refetch}
              style={{
                background: '#E24B4A', color: '#fff', border: 'none',
                borderRadius: 8, padding: '9px 20px', fontWeight: 600, fontSize: 14,
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Main UI */}
        {!loading && !error && selectedDay && (
          <>
            {/* Score ring card */}
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: '28px 20px 20px',
              textAlign: 'center',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            }}>
              <ScoreRing
                score={selectedDay.score}
                color={selectedDay.verdict.color}
                size={160}
              />
              <div style={{ marginTop: 6, fontSize: 13, color: '#888780' }}>
                {selectedDay.weatherLabel} · {selectedIndex === 0 ? 'Today' : new Date(selectedDay.date).toLocaleDateString('en-PK', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>

            {/* Verdict */}
            <VerdictCard day={selectedDay} />

            {/* 7-day strip */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '14px' }}>
              <div style={{ fontSize: 12, color: '#888780', marginBottom: 10, fontWeight: 500 }}>
                7-DAY OUTLOOK
              </div>
              <WeekStrip
                week={data.week}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
              />
            </div>

            {/* Stats */}
            <StatsGrid day={selectedDay} />

            {/* Savings tracker */}
            <SavingsTracker />

            {/* Last updated */}
            {lastUpdated && (
              <div style={{ textAlign: 'center', fontSize: 11, color: '#aaa9a3' }}>
                Updated {lastUpdated.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                {data.fromCache && ' · from cache'}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{ marginTop: 24, fontSize: 11, color: '#aaa9a3', textAlign: 'center' }}>
        Powered by <strong style={{ color: '#0F6E56' }}>WeatherWalay</strong> · Islamabad, Pakistan
      </footer>
    </div>
  );
}
