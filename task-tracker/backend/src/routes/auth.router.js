const express = require('express');
const { register, login } = require('../services/auth.service');

const router = express.Router();

router.post('/register', (req, res) => {
  const result = register(req.body);
  if (!result.success) { res.status(400).json(result); return; }
  res.status(201).json(result);
});

router.post('/login', (req, res) => {
  const result = login(req.body);
  if (!result.success) { res.status(400).json(result); return; }
  res.status(200).json(result);
});

module.exports = router;
