const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /columns/:column_str_id/tasks
router.post('/:column_str_id/tasks', async (req, res) => {
  const { column_str_id } = req.params;
  const { task_str_id, title } = req.body;

  try {
    const countRes = await db.query(
      'SELECT COUNT(*) FROM tasks WHERE column_str_id = $1',
      [column_str_id]
    );

    const order_in_column = parseInt(countRes.rows[0].count);

    await db.query(
      'INSERT INTO tasks (task_str_id, column_str_id, title, order_in_column) VALUES ($1, $2, $3, $4)',
      [task_str_id, column_str_id, title, order_in_column]
    );

    res.json({ message: 'Task added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /columns/:column_str_id/tasks
router.get('/:column_str_id/tasks', async (req, res) => {
  const { column_str_id } = req.params;
  try {
    const tasks = await db.query(
      'SELECT * FROM tasks WHERE column_str_id = $1 ORDER BY order_in_column',
      [column_str_id]
    );
    res.json(tasks.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
