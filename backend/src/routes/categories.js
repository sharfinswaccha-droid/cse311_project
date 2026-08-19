const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/categories — includes parent category name for sub-categories
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.category_id, c.category_name, c.parent_category_id,
            parent.category_name AS parent_category_name
     FROM Category c
     LEFT JOIN Category parent ON c.parent_category_id = parent.category_id
     ORDER BY c.category_id`
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { category_name, parent_category_id } = req.body;
  if (!category_name) return res.status(400).json({ error: 'category_name is required' });

  const [result] = await pool.query(
    'INSERT INTO Category (category_name, parent_category_id) VALUES (?, ?)',
    [category_name, parent_category_id || null]
  );
  res.status(201).json({ category_id: result.insertId });
}));

module.exports = router;
