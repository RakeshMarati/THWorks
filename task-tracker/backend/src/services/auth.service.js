const db = require('../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_SECRET_FALLBACK = process.env.JWT_SECRET_FALLBACK || '';

function register({ email, password, name, mobile }) {
  if (!email || !password || !name) return { success: false, message: 'Name, email and password required' };
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return { success: false, message: 'Email already registered' };
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (email, password_hash, name, mobile) VALUES (?, ?, ?, ?)').run(email, hash, name, mobile||null);
  const user = { id: info.lastInsertRowid, email, name, mobile: mobile||null };
  const token = jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return { success: true, user, token };
}

function login({ email, password }) {
  if (!email || !password) return { success: false, message: 'Email and password required' };
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row) return { success: false, message: 'Invalid credentials' };
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) return { success: false, message: 'Invalid credentials' };
  const token = jwt.sign({ uid: row.id }, JWT_SECRET, { expiresIn: '7d' });
  const user = { id: row.id, email: row.email, name: row.name, mobile: row.mobile };
  return { success: true, user, token };
}

function verifyToken(header) {
  if (!header) return null;
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    return payload.uid;
  } catch {
    if (JWT_SECRET_FALLBACK) {
      try {
        const payload2 = jwt.verify(parts[1], JWT_SECRET_FALLBACK);
        return payload2.uid;
      } catch {
        return null;
      }
    }
    return null;
  }
}

module.exports = { register, login, verifyToken };
