const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Supplier ORDER BY supplier_name');
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { supplier_name, contact_email, phone } = req.body;
  if (!supplier_name) return res.status(400).json({ error: 'supplier_name is required' });

  const [result] = await pool.query(
    'INSERT INTO Supplier (supplier_name, contact_email, phone) VALUES (?, ?, ?)',
    [supplier_name, contact_email || null, phone || null]
  );
  res.status(201).json({ supplier_id: result.insertId });
}));

module.exports = router;
