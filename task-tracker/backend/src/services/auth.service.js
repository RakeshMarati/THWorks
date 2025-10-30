const db = require('../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_SECRET_FALLBACK = process.env.JWT_SECRET_FALLBACK || '';

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function seedDefaultTasks(userId) {
  const today = new Date();
  const items = [
    { title: 'Getting Started (High)', description: 'High priority starter task', priority: 'High', due_date: addDays(today, 1) },
    { title: 'Plan This Week (Medium)', description: 'Medium priority planning task', priority: 'Medium', due_date: addDays(today, 3) },
    { title: 'Backlog Review (Low)', description: 'Low priority review task', priority: 'Low', due_date: addDays(today, 5) },
  ];
  const stmt = db.prepare('INSERT INTO tasks (user_id, title, description, priority, due_date, status) VALUES (?, ?, ?, ?, ?, ?)');
  items.forEach(t => {
    try { stmt.run(userId, t.title, t.description, t.priority, t.due_date, 'Open'); } catch {}
  });
}

function register({ email, password, name, mobile }) {
  if (!email || !password || !name) return { success: false, message: 'Name, email and password required' };
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return { success: false, message: 'Email already registered' };
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (email, password_hash, name, mobile) VALUES (?, ?, ?, ?)').run(email, hash, name, mobile||null);
  const user = { id: info.lastInsertRowid, email, name, mobile: mobile||null };
  seedDefaultTasks(user.id);
  const token = jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return { success: true, user, token };
}

function login({ email, password }) {
  if (!email || !password) return { success: false, message: 'Email and password required' };
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row) return { success: false, message: 'Invalid credentials' };
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) return { success: false, message: 'Invalid credentials' };
  const count = db.prepare('SELECT COUNT(*) as c FROM tasks WHERE user_id = ?').get(row.id).c;
  if (!count) seedDefaultTasks(row.id);
  const token = jwt.sign({ uid: row.id }, JWT_SECRET, { expiresIn: '7d' });
  const user = { id: row.id, email: row.email, name: row.name, mobile: row.mobile };
  return { success: true, user, token };
}

function verifyToken(header) {
  if (!header) return null;
  const trimmed = String(header).trim();
  const parts = trimmed.split(' ');
  let token = '';
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    token = parts[1];
  } else if (parts.length === 1) {
    token = parts[0];
  } else {
    return null;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.uid;
  } catch {
    if (JWT_SECRET_FALLBACK) {
      try {
        const payload2 = jwt.verify(token, JWT_SECRET_FALLBACK);
        return payload2.uid;
      } catch {
        return null;
      }
    }
    return null;
  }
}

module.exports = { register, login, verifyToken };
