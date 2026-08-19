const express = require('express');
const { pool } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/customers
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT customer_id, first_name, last_name, email, phone, created_at
     FROM Customer ORDER BY customer_id`
  );
  res.json(rows);
}));

// GET /api/customers/:id  (profile + addresses)
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [[customer]] = await pool.query(
    `SELECT customer_id, first_name, last_name, email, phone, created_at
     FROM Customer WHERE customer_id = ?`,
    [id]
  );
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const [addresses] = await pool.query('SELECT * FROM Address WHERE customer_id = ?', [id]);
  res.json({ ...customer, addresses });
}));

// POST /api/customers  (very simplified — real app would hash the password properly)
router.post('/', asyncHandler(async (req, res) => {
  const { first_name, last_name, email, phone, password_hash } = req.body;
  if (!first_name || !last_name || !email || !password_hash) {
    return res.status(400).json({ error: 'first_name, last_name, email and password_hash are required' });
  }

  const [result] = await pool.query(
    `INSERT INTO Customer (first_name, last_name, email, phone, password_hash)
     VALUES (?, ?, ?, ?, ?)`,
    [first_name, last_name, email, phone || null, password_hash]
  );
  res.status(201).json({ customer_id: result.insertId });
}));

// POST /api/customers/:id/addresses
router.post('/:id/addresses', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { address_line, city, state, zip_code, country, is_default } = req.body;

  if (!address_line || !city || !zip_code || !country) {
    return res.status(400).json({ error: 'address_line, city, zip_code and country are required' });
  }

  const [result] = await pool.query(
    `INSERT INTO Address (customer_id, address_line, city, state, zip_code, country, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, address_line, city, state || null, zip_code, country, !!is_default]
  );
  res.status(201).json({ address_id: result.insertId });
}));

module.exports = router;
