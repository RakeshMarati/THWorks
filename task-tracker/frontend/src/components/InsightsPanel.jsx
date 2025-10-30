import { useEffect, useState } from 'react';

export default function InsightsPanel({ refresh, token }) {
  const [insight, setInsight] = useState({});
  useEffect(() => {
    fetch('http://localhost:3000/insights', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(r => r.json())
      .then(setInsight);
  }, [refresh, token]);
  return (
    <div className="bg-yellow-100 text-yellow-900 rounded shadow p-4 text-center">
      <div className="font-bold">Smart Insights</div>
      <div>{insight.summary || ''}</div>
    </div>
  );
}
