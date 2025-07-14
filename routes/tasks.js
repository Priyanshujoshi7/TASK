const express = require('express');
const router = express.Router();
const db = require('../db');

// PUT /tasks/:task_str_id/reorder
router.put('/:task_str_id/reorder', async (req, res) => {
  const { task_str_id } = req.params;
  const { new_order_in_column } = req.body;

  try {
    const taskRes = await db.query(
      'SELECT column_str_id, order_in_column FROM tasks WHERE task_str_id = $1',
      [task_str_id]
    );

    const { column_str_id, order_in_column: oldOrder } = taskRes.rows[0];

    // Shift tasks
    if (new_order_in_column < oldOrder) {
      await db.query(
        `UPDATE tasks SET order_in_column = order_in_column + 1
         WHERE column_str_id = $1 AND order_in_column >= $2 AND order_in_column < $3`,
        [column_str_id, new_order_in_column, oldOrder]
      );
    } else {
      await db.query(
        `UPDATE tasks SET order_in_column = order_in_column - 1
         WHERE column_str_id = $1 AND order_in_column <= $2 AND order_in_column > $3`,
        [column_str_id, new_order_in_column, oldOrder]
      );
    }

    await db.query(
      'UPDATE tasks SET order_in_column = $1 WHERE task_str_id = $2',
      [new_order_in_column, task_str_id]
    );

    res.json({ message: 'Reordered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /tasks/:task_str_id/move
router.put('/:task_str_id/move', async (req, res) => {
  const { task_str_id } = req.params;
  const { target_column_str_id, new_order_in_column } = req.body;

  try {
    const taskRes = await db.query(
      'SELECT column_str_id, order_in_column FROM tasks WHERE task_str_id = $1',
      [task_str_id]
    );

    const { column_str_id: old_column, order_in_column: old_order } = taskRes.rows[0];

    // Step 1: shift old column tasks up
    await db.query(
      'UPDATE tasks SET order_in_column = order_in_column - 1 WHERE column_str_id = $1 AND order_in_column > $2',
      [old_column, old_order]
    );

    // Step 2: shift new column tasks down
    await db.query(
      'UPDATE tasks SET order_in_column = order_in_column + 1 WHERE column_str_id = $1 AND order_in_column >= $2',
      [target_column_str_id, new_order_in_column]
    );

    // Step 3: move the task
    await db.query(
      'UPDATE tasks SET column_str_id = $1, order_in_column = $2 WHERE task_str_id = $3',
      [target_column_str_id, new_order_in_column, task_str_id]
    );

    res.json({ message: 'Task moved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
