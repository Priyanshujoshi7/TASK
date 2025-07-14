const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /boards/:board_id/columns
router.post('/:board_id/columns', async (req, res) => {
  const { board_id } = req.params;
  const { column_str_id, name, order_on_board } = req.body;

  try {
    await db.query(
      'INSERT INTO columns (column_str_id, board_id, name, order_on_board) VALUES ($1, $2, $3, $4)',
      [column_str_id, board_id, name, order_on_board]
    );
    res.json({ message: 'Column created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /boards/:board_id/view
router.get('/:board_id/view', async (req, res) => {
  const { board_id } = req.params;

  try {
    const columns = await db.query(
      'SELECT * FROM columns WHERE board_id = $1 ORDER BY order_on_board',
      [board_id]
    );

    const result = await Promise.all(columns.rows.map(async column => {
      const tasks = await db.query(
        'SELECT * FROM tasks WHERE column_str_id = $1 ORDER BY order_in_column',
        [column.column_str_id]
      );
      return { ...column, tasks: tasks.rows };
    }));

    res.json({ board_id, columns: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
