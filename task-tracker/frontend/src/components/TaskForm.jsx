import { useState } from 'react';

export default function TaskForm({ onTaskAdded, token }) {
  const [form, setForm] = useState({title: '', description: '', priority: 'Medium', due_date: '', status: 'Open'});
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(v => ({ ...v, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.title || !form.priority || !form.due_date) {
      setError('Title, priority, and due date required');
      return;
    }
    const res = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({title: '', description: '', priority: 'Medium', due_date: '', status: 'Open'});
      onTaskAdded && onTaskAdded();
    } else {
      setError('Failed to add task');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
      <div>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full border rounded p-2" />
      </div>
      <div>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border rounded p-2" />
      </div>
      <div className="flex gap-4">
        <select name="priority" value={form.priority} onChange={handleChange} className="border rounded p-2 flex-1">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className="border rounded p-2 flex-1" />
      </div>
      <div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Task</button>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </form>
  );
}
