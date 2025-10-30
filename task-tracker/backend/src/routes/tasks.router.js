const express = require('express');
const { createTask, getTasks, updateTask, deleteTask } = require('../services/task.service');

const router = express.Router();

router.post('/', (req, res) => {
  const result = createTask(req.body, req.context.userId);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.status(201).json(result);
});

router.get('/', (req, res) => {
  const result = getTasks(req.query, req.context.userId);
  res.status(200).json(result);
});

router.patch('/:id', (req, res) => {
  const result = updateTask(req.params.id, req.body, req.context.userId);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.status(200).json(result);
});

router.delete('/:id', (req, res) => {
  const result = deleteTask(req.params.id, req.context.userId);
  if (!result.success) {
    res.status(404).json(result);
    return;
  }
  res.status(204).send();
});

module.exports = router;
