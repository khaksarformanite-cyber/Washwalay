import React from 'react';

function dayLabel(dateStr, index) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-PK', { weekday: 'short' });
}

function weatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 2)  return '⛅';
  if (code === 3) return '☁️';
  if (code >= 51 && code <= 55) return '🌦️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 95 && code <= 99) return '⛈️';
  return '🌤️';
}

export function WeekStrip({ week, selectedIndex, onSelect }) {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      paddingBottom: 4,
      scrollbarWidth: 'none',
    }}>
      {week.map((day, i) => {
        const isActive = i === selectedIndex;
        const color = day.verdict.color;
        return (
          <button
            key={day.date}
            onClick={() => onSelect(i)}
            aria-pressed={isActive}
            style={{
              flex: '0 0 auto',
              minWidth: 58,
              padding: '10px 8px',
              borderRadius: 12,
              border: isActive ? `2px solid ${color}` : '1.5px solid rgba(0,0,0,0.08)',
              background: isActive ? `${color}14` : '#fff',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.18s ease',
            }}
          >
            <div style={{ fontSize: 11, color: isActive ? color : '#888780', marginBottom: 4, fontWeight: 500 }}>
              {dayLabel(day.date, i)}
            </div>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{weatherIcon(day.weatherCode)}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color }}>
              {day.score}
            </div>
          </button>
        );
      })}
    </div>
  );
}
