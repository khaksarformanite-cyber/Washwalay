import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

export function useForecast(lat = 33.72, lon = 73.04) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/forecast`, {
        params: { lat, lon }
      });
      setData(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load forecast. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    fetch();
    // Refresh every 3 hours
    const interval = setInterval(fetch, 3 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { data, loading, error, refetch: fetch, lastUpdated };
}
