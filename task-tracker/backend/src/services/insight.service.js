const db = require('../db/database');

function getInsights(userId) {
  const now = new Date();
  const soon = new Date(now);
  soon.setDate(now.getDate() + 3);
  const openCount = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status = 'Open' AND user_id = ?").get(userId).c;
  const priorities = db.prepare("SELECT priority, COUNT(*) as c FROM tasks WHERE status = 'Open' AND user_id = ? GROUP BY priority").all(userId);
  const dueSoon = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status = 'Open' AND user_id = ? AND due_date <= ? AND due_date >= ?").get(userId, soon.toISOString().split('T')[0], now.toISOString().split('T')[0]).c;
  const distribution = { Low: 0, Medium: 0, High: 0 };
  priorities.forEach(pr => { distribution[pr.priority] = pr.c; });
  let summary = `You have ${openCount} open tasks.`;
  if (distribution.High) summary += ` ${distribution.High} are High priority.`;
  if (distribution.Medium) summary += ` ${distribution.Medium} are Medium priority.`;
  if (distribution.Low) summary += ` ${distribution.Low} are Low priority.`;
  if (dueSoon) summary += ` ${dueSoon} are due within the next 3 days.`;
  if (openCount > 0 && distribution.High >= openCount/2) summary += ' Focus on High priority tasks first.';
  return { openCount, distribution, dueSoon, summary };
}

module.exports = { getInsights };
