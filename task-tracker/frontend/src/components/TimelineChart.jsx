import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function TimelineChart({ token, refresh, status, priority }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    let url = 'http://localhost:3000/tasks?limit=1000&sort_by=due_date&order=ASC';
    const q = [];
    if (status) q.push(`status=${encodeURIComponent(status)}`);
    if (priority) q.push(`priority=${encodeURIComponent(priority)}`);
    if (q.length) url += '&' + q.join('&');
    fetch(url, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(r => r.json())
      .then(data => {
        const items = data.items || data;
        const dateToCount = new Map();
        items.forEach(t => {
          const d = t.due_date;
          dateToCount.set(d, (dateToCount.get(d)||0)+1);
        });
        const labels = Array.from(dateToCount.keys()).sort();
        const values = labels.map(l => dateToCount.get(l));
        if (chartRef.current) chartRef.current.destroy();
        chartRef.current = new Chart(canvasRef.current, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Tasks by Due Date',
              data: values,
              backgroundColor: 'rgba(99, 102, 241, 0.6)',
              borderColor: '#4f46e5',
              borderWidth: 1,
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: '#36335f' } },
              y: { beginAtZero: true, ticks: { stepSize: 1, color: '#36335f' } }
            }
          }
        });
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
