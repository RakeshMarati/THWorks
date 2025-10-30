import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function TimelineChart({ token, refresh, status, priority }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    let url = `${API}/tasks?limit=1000&sort_by=due_date&order=ASC`;
    const q = [];
    if (status) q.push(`status=${encodeURIComponent(status)}`);
    if (priority) q.push(`priority=${encodeURIComponent(priority)}`);
    if (q.length) url += '&' + q.join('&');
    fetch(url, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(async r => {
        if (!r.ok) {
          return { items: [] };
        }
        return r.json();
      })
      .then(data => {
        const items = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
        const priorities = ['Low','Medium','High'];
        const dateSet = new Set();
        items.forEach(t => { if (t.due_date) dateSet.add(t.due_date); });
        const labels = Array.from(dateSet).sort();
        const makeCounts = () => Object.fromEntries(labels.map(d => [d, 0]));
        const countsByPriority = {
          Low: makeCounts(),
          Medium: makeCounts(),
          High: makeCounts()
        };
        items.forEach(t => {
          const d = t.due_date; if (!d) return;
          const p = priorities.includes(t.priority) ? t.priority : 'Medium';
          countsByPriority[p][d] = (countsByPriority[p][d] || 0) + 1;
        });
        const datasets = [
          {
            label: 'Low',
            data: labels.map(d => countsByPriority.Low[d] || 0),
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: '#10b981',
            borderWidth: 1,
            stack: 'stack1'
          },
          {
            label: 'Medium',
            data: labels.map(d => countsByPriority.Medium[d] || 0),
            backgroundColor: 'rgba(245, 158, 11, 0.6)',
            borderColor: '#f59e0b',
            borderWidth: 1,
            stack: 'stack1'
          },
          {
            label: 'High',
            data: labels.map(d => countsByPriority.High[d] || 0),
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
            borderColor: '#ef4444',
            borderWidth: 1,
            stack: 'stack1'
          }
        ];
        if (chartRef.current) chartRef.current.destroy();
        chartRef.current = new Chart(canvasRef.current, {
          type: 'bar',
          data: {
            labels,
            datasets
          },
          options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
              x: { stacked: true, ticks: { color: '#36335f' } },
              y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1, color: '#36335f' } }
            }
          }
        });
      })
      .catch(() => {
        if (chartRef.current) chartRef.current.destroy();
      });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [token, refresh, status, priority]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="font-bold" style={{marginBottom:'.5rem'}}>Task Timeline</div>
      <canvas ref={canvasRef} height="120"></canvas>
    </div>
  );
}
