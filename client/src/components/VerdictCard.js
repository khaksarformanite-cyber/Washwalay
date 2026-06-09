import React from 'react';

function verdictIcon(level) {
  if (level === 'good') return '✅';
  if (level === 'warn') return '⚠️';
  return '❌';
}

function verdictSub(day) {
  if (day.verdict.level === 'good')
    return `${day.dryDaysAhead}+ dry day${day.dryDaysAhead !== 1 ? 's' : ''} ahead — your wash will last.`;
  if (day.verdict.level === 'warn')
    return `Rain possible in ${day.dryDaysAhead > 0 ? day.dryDaysAhead + ' day(s)' : 'less than a day'} — may not be worth it.`;
  return `${day.rainProb}% rain chance — wait for a better window.`;
}

export function VerdictCard({ day }) {
  const { verdict } = day;
  const bgMap = { good: '#E1F5EE', warn: '#FAEEDA', bad: '#FCEBEB' };
  const colorMap = { good: '#085041', warn: '#6B3A08', bad: '#7A1F1F' };
  const bg    = bgMap[verdict.level];
  const color = colorMap[verdict.level];

  return (
    <div style={{
      background: bg,
      borderRadius: 12,
      padding: '14px 16px',
      transition: 'background 0.3s ease',
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color, marginBottom: 4 }}>
        {verdictIcon(verdict.level)}&nbsp; {verdict.label}
      </div>
      <div style={{ fontSize: 13, color, opacity: 0.85 }}>
        {verdictSub(day)}
      </div>
    </div>
  );
}
