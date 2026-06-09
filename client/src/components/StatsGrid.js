import React from 'react';

function Stat({ icon, label, value }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.07)',
      borderRadius: 12,
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: '#888780', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}

export function StatsGrid({ day }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
    }}>
      <Stat icon="🌧️" label="Rain chance"      value={`${day.rainProb}%`} />
      <Stat icon="📅" label="Dry days ahead"   value={day.dryDaysAhead > 0 ? `${day.dryDaysAhead} day${day.dryDaysAhead !== 1 ? 's' : ''}` : 'None'} />
      <Stat icon="🕐" label="Best wash window" value={day.bestWindow} />
      <Stat icon="💧" label="Humidity"          value={`${day.humidity}%`} />
    </div>
  );
}
