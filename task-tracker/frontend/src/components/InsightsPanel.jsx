import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function InsightsPanel({ refresh, token }) {
  const [insight, setInsight] = useState({});
  useEffect(() => {
    fetch(`${API}/insights`, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(async r => {
        if (!r.ok) {
          return {};
        }
        return r.json();
      })
      .then(setInsight)
      .catch(() => setInsight({}));
  }, [refresh, token]);
  return (
    <div className="bg-yellow-100 text-yellow-900 rounded shadow p-4 text-center">
      <div className="font-bold">Smart Insights</div>
      <div>{insight.summary || ''}</div>
    </div>
  );
}
