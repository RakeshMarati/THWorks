import { useEffect, useState } from 'react';

const statusList = ['Open', 'In Progress', 'Done'];
const priorityList = ['Low', 'Medium', 'High'];

export default function TaskList({ refresh, onChanged, token }) {
  const [data, setData] = useState({ items: [], page: 1, limit: 10, total: 0, pages: 0 });
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ title: '', description: '', due_date: '' });

  useEffect(() => {
    let url = 'http://localhost:3000/tasks';
    const q = [];
    if (status) q.push(`status=${encodeURIComponent(status)}`);
    if (priority) q.push(`priority=${encodeURIComponent(priority)}`);
    q.push(`page=${page}`);
    q.push(`limit=${limit}`);
    q.push(`sort_by=due_date`);
    q.push(`order=ASC`);
    if (q.length) url += '?' + q.join('&');
    fetch(url, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(r => r.json())
      .then(setData);
  }, [refresh, status, priority, page, limit, token]);

  async function handleUpdate(id, field, value) {
    await fetch('http://localhost:3000/tasks/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ [field]: value })
    });
    onChanged && onChanged();
  }

  async function handleSave(id) {
    await fetch('http://localhost:3000/tasks/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(editValues)
    });
    setEditingId(null);
    onChanged && onChanged();
  }

  async function handleDelete(id) {
    await fetch('http://localhost:3000/tasks/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    onChanged && onChanged();
  }

  function startEdit(t) {
    setEditingId(t.id);
    setEditValues({ title: t.title, description: t.description || '', due_date: t.due_date });
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex gap-4 pb-4">
        <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded p-2"><option value="">All Status</option>{statusList.map(s => <option key={s}>{s}</option>)}</select>
        <select value={priority} onChange={e => setPriority(e.target.value)} className="border rounded p-2"><option value="">All Priority</option>{priorityList.map(p => <option key={p}>{p}</option>)}</select>
        <select value={limit} onChange={e=>{setPage(1);setLimit(parseInt(e.target.value,10));}} className="border rounded p-2">
          {[5,10,20,50].map(n => <option key={n} value={n}>{n}/page</option>)}
        </select>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th>Title</th><th>Description</th><th>Priority</th><th>Due Date</th><th>Status</th><th style={{width:'180px'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map(t => (
            <tr key={t.id}>
              <td>
                {editingId === t.id ? (
                  <input value={editValues.title} onChange={e=>setEditValues(v=>({...v, title: e.target.value}))} />
                ) : (
                  t.title
                )}
              </td>
              <td>
                {editingId === t.id ? (
                  <textarea value={editValues.description} onChange={e=>setEditValues(v=>({...v, description: e.target.value}))} />
                ) : (
                  t.description
                )}
              </td>
              <td>
                <select value={t.priority} onChange={e => handleUpdate(t.id, 'priority', e.target.value)} className="border rounded">
                  {priorityList.map(p => <option key={p}>{p}</option>)}
                </select>
              </td>
              <td>
                {editingId === t.id ? (
                  <input type="date" value={editValues.due_date} onChange={e=>setEditValues(v=>({...v, due_date: e.target.value}))} />
                ) : (
                  t.due_date
                )}
              </td>
              <td>
                <select value={t.status} onChange={e => handleUpdate(t.id, 'status', e.target.value)} className="border rounded">
                  {statusList.map(s => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td>
                {editingId === t.id ? (
                  <div className="flex gap-4">
                    <button onClick={()=>handleSave(t.id)} className="px-4 py-2">Done</button>
                    <button onClick={()=>setEditingId(null)} className="px-4 py-2">Cancel</button>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <button onClick={()=>startEdit(t)} className="px-4 py-2">Edit</button>
                    <button onClick={()=>handleDelete(t.id)} className="px-4 py-2">Delete</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4" style={{marginTop:'1rem'}}>
        <button onClick={()=> setPage(p => Math.max(1, p-1))} disabled={data.page<=1} className="px-4 py-2">Prev</button>
        <div style={{alignSelf:'center'}}>Page {data.page} of {data.pages || 1}</div>
        <button onClick={()=> setPage(p => (data.pages ? Math.min(data.pages, p+1) : p+1))} disabled={data.pages ? data.page>=data.pages : false} className="px-4 py-2">Next</button>
      </div>
    </div>
  );
}
