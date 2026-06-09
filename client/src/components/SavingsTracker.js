import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'washwalay_savings';
const WASH_COST   = 500; // Rs per wash

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { washes: [], totalSaved: 0 };
  } catch { return { washes: [], totalSaved: 0 }; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function SavingsTracker() {
  const [data, setData]       = useState(loadData);
  const [showLog, setShowLog] = useState(false);

  useEffect(() => { saveData(data); }, [data]);

  function markWash(washedToday) {
    const entry = { date: new Date().toLocaleDateString('en-PK'), washedToday };
    setData(prev => ({
      washes: [entry, ...prev.washes],
      totalSaved: washedToday ? prev.totalSaved : prev.totalSaved + WASH_COST
    }));
  }

  const protected_ = data.washes.filter(w => !w.washedToday).length;
  const total      = data.washes.length;
  const pct        = total > 0 ? Math.round((protected_ / total) * 100) : 0;

  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(0,0,0,0.07)',
      borderRadius: 16,
      padding: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 12, color: '#888780', marginBottom: 2 }}>monsoon savings</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0F6E56' }}>
            Rs {data.totalSaved.toLocaleString()} saved
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: '#888780' }}>washes protected</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{protected_} of {total}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.07)', marginBottom: 14 }}>
        <div style={{ height: 6, borderRadius: 3, background: '#1D9E75', width: `${pct}%`, transition: 'width 0.4s ease' }} />
      </div>

      {/* Log a wash */}
      <div style={{ fontSize: 12, color: '#888780', marginBottom: 8 }}>Did you wash your car today?</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => markWash(false)}
          style={{
            flex: 1, padding: '9px', borderRadius: 8, border: '1.5px solid #1D9E75',
            background: '#E1F5EE', color: '#085041', fontWeight: 600, fontSize: 13
          }}
        >
          No — I skipped ✅
        </button>
        <button
          onClick={() => markWash(true)}
          style={{
            flex: 1, padding: '9px', borderRadius: 8, border: '1.5px solid rgba(0,0,0,0.1)',
            background: '#F1EFE8', color: '#5F5E5A', fontWeight: 600, fontSize: 13
          }}
        >
          Yes — I washed 🚗
        </button>
      </div>

      {total > 0 && (
        <button
          onClick={() => setShowLog(v => !v)}
          style={{ marginTop: 10, background: 'none', border: 'none', color: '#888780', fontSize: 12, cursor: 'pointer', padding: 0 }}
        >
          {showLog ? 'Hide' : 'Show'} wash history ({total})
        </button>
      )}

      {showLog && (
        <div style={{ marginTop: 10, maxHeight: 140, overflowY: 'auto' }}>
          {data.washes.map((w, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 12, color: '#5F5E5A',
              padding: '5px 0', borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
              <span>{w.date}</span>
              <span style={{ color: w.washedToday ? '#BA7517' : '#0F6E56' }}>
                {w.washedToday ? 'Washed' : `Skipped — Rs ${WASH_COST} saved`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
