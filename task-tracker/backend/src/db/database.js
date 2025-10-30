const Database = require('better-sqlite3');
const db = new Database('task_tracker.db');

db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  mobile TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK(priority IN ('Low', 'Medium', 'High')) NOT NULL DEFAULT 'Medium',
  due_date TEXT NOT NULL,
  status TEXT CHECK(status IN ('Open', 'In Progress', 'Done')) NOT NULL DEFAULT 'Open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`).run();

try {
  const colsTasks = db.prepare("PRAGMA table_info('tasks')").all();
  const hasUserId = colsTasks.some(c => c.name === 'user_id');
  if (!hasUserId) {
    db.prepare('ALTER TABLE tasks ADD COLUMN user_id INTEGER').run();
  }
  const colsUsers = db.prepare("PRAGMA table_info('users')").all();
  if (!colsUsers.some(c => c.name === 'name')) {
    db.prepare('ALTER TABLE users ADD COLUMN name TEXT').run();
  }
  if (!colsUsers.some(c => c.name === 'mobile')) {
    db.prepare('ALTER TABLE users ADD COLUMN mobile TEXT').run();
  }
} catch {}

module.exports = db;
