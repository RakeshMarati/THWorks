const express = require('express');
const cors = require('cors');
const tasksRouter = require('./src/routes/tasks.router');
const { getInsights } = require('./src/services/insight.service');
const authRouter = require('./src/routes/auth.router');
const { verifyToken } = require('./src/services/auth.service');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

function authGuard(req, res, next) {
  const uid = verifyToken(req.headers.authorization || '');
  if (!uid) { res.status(401).json({ error: 'Unauthorized' }); return; }
  req.userId = uid;
  next();
}

app.use('/tasks', authGuard, (req, res, next) => { req.context = { userId: req.userId }; next(); }, tasksRouter);

app.get('/insights', authGuard, (req, res) => {
  try {
    const result = getInsights(req.userId);
    res.status(200).json(result);
  } catch {
    res.status(500).json({ error: 'Unable to fetch insights' });
  }
});

app.listen(3000, () => {});
