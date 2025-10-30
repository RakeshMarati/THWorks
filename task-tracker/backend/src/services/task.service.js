const db = require('../db/database');

function createTask(data, userId) {
  const { title, description, priority, due_date, status } = data;
  if (!title || !priority || !due_date) return { success: false, message: 'Required fields missing' };
  const stmt = db.prepare('INSERT INTO tasks (user_id, title, description, priority, due_date, status) VALUES (?, ?, ?, ?, ?, ?)');
  try {
    const info = stmt.run(userId, title, description||'', priority, due_date, status||'Open');
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(info.lastInsertRowid, userId);
    return { success: true, task };
  } catch {
    return { success: false, message: 'Invalid data' };
  }
}

function getTasks(query, userId) {
  let base = 'FROM tasks WHERE user_id = ?';
  const values = [userId];
  if (query.status) { base += ' AND status = ?'; values.push(query.status); }
  if (query.priority) { base += ' AND priority = ?'; values.push(query.priority); }
  const countRow = db.prepare(`SELECT COUNT(*) as total ${base}`).get(...values);
  const sortBy = ['due_date','created_at','priority','status','title'].includes(query.sort_by) ? query.sort_by : 'due_date';
  const order = (query.order||'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  const limit = Math.min(parseInt(query.limit||'10',10), 50);
  const page = Math.max(parseInt(query.page||'1',10), 1);
  const offset = (page - 1) * limit;
  const rows = db.prepare(`SELECT * ${base} ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`).all(...values, limit, offset);
  return { items: rows, page, limit, total: countRow.total, pages: Math.ceil(countRow.total/limit) };
}

function updateTask(id, data, userId) {
  const fields = [];
  const values = [];
  if (data.title != null) { fields.push('title = ?'); values.push(data.title); }
  if (data.description != null) { fields.push('description = ?'); values.push(data.description); }
  if (data.due_date != null) { fields.push('due_date = ?'); values.push(data.due_date); }
  if (data.status) { fields.push('status = ?'); values.push(data.status); }
  if (data.priority) { fields.push('priority = ?'); values.push(data.priority); }
  if (!fields.length) return { success: false, message: 'No update field' };
  values.push(userId, id);
  const stmt = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE user_id = ? AND id = ?`);
  try {
    const info = stmt.run(...values);
    if (info.changes === 0) return { success: false, message: 'Not found' };
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, userId);
    return { success: true, task };
  } catch {
    return { success: false, message: 'Invalid update' };
  }
}

function deleteTask(id, userId) {
  try {
    const info = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(id, userId);
    if (info.changes === 0) return { success: false, message: 'Not found' };
    return { success: true };
  } catch {
    return { success: false, message: 'Delete failed' };
  }
}

module.exports = { createTask, getTasks, updateTask, deleteTask };
