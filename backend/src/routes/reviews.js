const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// POST /api/reviews  { product_id, customer_id, rating, comment }
router.post('/', asyncHandler(async (req, res) => {
  const { product_id, customer_id, rating, comment } = req.body;

  if (!product_id || !customer_id || !rating) {
    return res.status(400).json({ error: 'product_id, customer_id and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be between 1 and 5' });
  }

  const [result] = await pool.query(
    `INSERT INTO Review (product_id, customer_id, rating, comment)
     VALUES (?, ?, ?, ?)`,
    [product_id, customer_id, rating, comment || null]
  );
  res.status(201).json({ review_id: result.insertId });
}));

// DELETE /api/reviews/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM Review WHERE review_id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Review not found' });
  res.json({ message: 'Review deleted' });
}));

module.exports = router;
